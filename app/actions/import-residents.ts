"use server";

import * as XLSX from "xlsx";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";

// Define schema for resident data
const ResidentSchema = z.object({
  name: z.string(),
  roomNumber: z.string(),
  buildingName: z.string(),
  isActive: z.boolean().default(true),
  email: z.string().email().optional(),
});

interface ExistingResident {
  id: string;
  name: string;
  is_active: boolean;
}

type Resident = z.infer<typeof ResidentSchema>;

type ImportResult = {
  success: boolean;
  message: string;
  stats?: {
    totalProcessed: number;
    newResidents: number;
    updatedResidents: number;
    skippedRows: number;
    errors: number;
  };
  errors?: string[];
};

/**
 * Maps building codes to building names
 */
const BUILDING_CODE_MAP: Record<string, string> = {
  "525LEX": "Turtle Bay",
  "525lex": "Turtle Bay",
  "569LEX": "Midtown East",
  "569lex": "Midtown East",
  "400W37": "Midtown East",
  "400w37": "Midtown East",
  "160W24": "Chelsea",
  "160w24": "Chelsea",
  "186HALL": "Brooklyn Heights",
  "186hall": "Brooklyn Heights",
};

/**
 * Process excel file and extract resident data
 */
function processExcelData(buffer: Buffer): Resident[] {
  // Read the Excel file
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert sheet to JSON (with array format since we don't have headers)
  const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Process data rows
  const residents: Resident[] = [];
  let processedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows or rows without enough columns
    if (!row || row.length < 3) {
      skippedCount++;
      continue;
    }

    // Column A typically contains building info
    const colA = String(row[0] || "").trim();

    // Column B contains building code + room-bed info
    const colB = String(row[1] || "").trim();

    // Column C contains occupancy status and resident info
    const colC = String(row[2] || "").trim();

    // Skip rows that don't have an "I" at the start of column C (not "In Room")
    if (!colC.startsWith("I")) {
      skippedCount++;
      continue;
    }

    // Extract building code from column B
    let buildingCode = "";
    const buildingCodeMatch = colB.match(/([A-Z0-9]+)(?:-|$)/);
    if (buildingCodeMatch && buildingCodeMatch[1]) {
      buildingCode = buildingCodeMatch[1];
      // If it's a common building code prefix, try to match it to our known buildings
      for (const code of Object.keys(BUILDING_CODE_MAP)) {
        if (buildingCode.includes(code)) {
          buildingCode = code;
          break;
        }
      }
    }

    // If building code not found in column B, try to extract from column A
    if (!buildingCode || !BUILDING_CODE_MAP[buildingCode]) {
      for (const code of Object.keys(BUILDING_CODE_MAP)) {
        if (colA.includes(code)) {
          buildingCode = code;
          break;
        }
      }
    }

    // Skip rows without a valid building code
    if (!buildingCode || !BUILDING_CODE_MAP[buildingCode]) {
      console.log(`Skipping row ${i + 1}: No valid building code found`);
      skippedCount++;
      continue;
    }

    // Extract room number from column B
    let roomNumber = "";
    const roomMatch = colB.match(/(\d+)(?:-[A-Z0-9])?/);
    if (roomMatch && roomMatch[1]) {
      roomNumber = roomMatch[1];
    } else {
      console.log(`Skipping row ${i + 1}: No room number found`);
      skippedCount++;
      continue;
    }

    // Extract resident name from column C
    // Format: "I [M] 525Lex - NYIT - Fall 2024/Spring 2025 - Marshall, Alexander"
    let fullName = "";
    // Look for the last dash section which should contain the name
    const nameSection = colC.split(" - ").pop();

    if (nameSection && nameSection.includes(",")) {
      // Format is "LastName, FirstName"
      const [lastName, firstName] = nameSection
        .split(",")
        .map((part) => part.trim());
      fullName = `${firstName} ${lastName}`;
    } else {
      console.log(`Skipping row ${i + 1}: Unable to extract resident name`);
      skippedCount++;
      continue;
    }

    // Map building code to building name
    const buildingName = BUILDING_CODE_MAP[buildingCode] || "Unknown";

    // Create resident object
    const resident: Resident = {
      name: fullName,
      roomNumber,
      buildingName,
      isActive: true,
    };

    residents.push(resident);
    processedCount++;
  }

  console.log(
    `Processed ${processedCount} residents, skipped ${skippedCount} rows`
  );
  return residents;
}

/**
 * Import residents from Excel file
 */
export async function importResidentsFromExcel(
  fileBuffer: Buffer,
  buildingId: string,
  userId: string
): Promise<ImportResult> {
  const supabase = await createClient();
  const errors: string[] = [];
  const stats = {
    totalProcessed: 0,
    newResidents: 0,
    updatedResidents: 0,
    skippedRows: 0,
    errors: 0,
  };

  try {
    // Process Excel data
    const residents = processExcelData(fileBuffer);
    stats.totalProcessed = residents.length;

    if (residents.length === 0) {
      return {
        success: false,
        message:
          "No valid resident data found in the file. Check the file format.",
      };
    }

    // Get building information
    const { data: buildingData, error: buildingError } = await supabase
      .from("buildings")
      .select("id, name")
      .eq("id", buildingId)
      .single();

    if (buildingError || !buildingData) {
      return {
        success: false,
        message: `Building not found: ${
          buildingError?.message || "Unknown error"
        }`,
      };
    }

    // Get all buildings to map names to IDs
    const { data: allBuildings, error: allBuildingsError } = await supabase
      .from("buildings")
      .select("id, name");

    if (allBuildingsError) {
      console.error("Error fetching buildings:", allBuildingsError);
      // We'll continue with just the selected building
    }

    // Create a map of building names to IDs
    const buildingNameToId: Record<string, string> = {};
    if (allBuildings) {
      allBuildings.forEach((b: any) => {
        buildingNameToId[b.name] = b.id;
      });
    }

    // Fallback to selected building
    buildingNameToId[buildingData.name] = buildingData.id;

    // Create import log with timestamp and filename details
    const fileName = `Resident Import - ${new Date().toLocaleDateString()}`;
    const { data: importLog, error: importLogError } = await supabase
      .from("import_logs")
      .insert({
        building_id: buildingId,
        imported_by: userId,
        file_name: fileName,
        record_count: residents.length,
        success_count: 0,
        error_count: 0,
      })
      .select()
      .single();

    if (importLogError) {
      console.error("Failed to create import log:", importLogError);
    }

    // Process each resident
    for (const resident of residents) {
      try {
        // Use the correct building ID based on the building name in the data
        // or fall back to the selected building ID
        const residentBuildingId =
          buildingNameToId[resident.buildingName] || buildingId;

        // Skip processing if the resident's building doesn't match the selected building
        // and we're not in "All Buildings" mode
        if (buildingId !== "all" && residentBuildingId !== buildingId) {
          stats.skippedRows++;
          continue;
        }

        // Check if resident already exists in this building and room
        const { data: existingResidents, error: queryError } = await supabase
          .from("residents")
          .select("id, name, is_active")
          .eq("building_id", residentBuildingId)
          .eq("room_number", resident.roomNumber)
          .eq("is_active", true);

        if (queryError) {
          throw new Error(
            `Failed to query existing residents: ${queryError.message}`
          );
        }

        // Check if any of the existing residents has a similar name
        const matchingResident = existingResidents?.find(
          (r: ExistingResident) => isSimilarName(r.name, resident.name)
        );

        if (matchingResident) {
          // Update existing resident
          const { error: updateError } = await supabase
            .from("residents")
            .update({
              name: resident.name, // Update to the current name in the import
              updated_at: new Date().toISOString(),
            })
            .eq("id", matchingResident.id);

          if (updateError) {
            throw new Error(
              `Failed to update resident: ${updateError.message}`
            );
          }

          stats.updatedResidents++;
        } else {
          // Check for residents in the same room that don't match and mark them as inactive
          if (existingResidents && existingResidents.length > 0) {
            for (const existingResident of existingResidents) {
              if (!isSimilarName(existingResident.name, resident.name)) {
                // Mark the non-matching resident as inactive (moved out)
                const { error: deactivateError } = await supabase
                  .from("residents")
                  .update({
                    is_active: false,
                    move_out_date: new Date().toISOString().split("T")[0],
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingResident.id);

                if (deactivateError) {
                  console.error(
                    `Failed to deactivate resident: ${deactivateError.message}`
                  );
                }
              }
            }
          }

          // Create new resident
          const { error: insertError } = await supabase
            .from("residents")
            .insert({
              name: resident.name,
              room_number: resident.roomNumber,
              building_id: residentBuildingId,
              move_in_date: new Date().toISOString().split("T")[0],
              is_active: true,
            });

          if (insertError) {
            throw new Error(
              `Failed to insert resident: ${insertError.message}`
            );
          }

          stats.newResidents++;
        }
      } catch (error: any) {
        errors.push(`Error processing ${resident.name}: ${error.message}`);
        stats.errors++;
      }
    }

    // Update import log with final stats
    if (importLog) {
      await supabase
        .from("import_logs")
        .update({
          success_count: stats.newResidents + stats.updatedResidents,
          error_count: stats.errors,
          error_details: errors.length ? { errors } : null,
        })
        .eq("id", importLog.id);
    }

    return {
      success: true,
      message: `Processed ${stats.totalProcessed} residents: ${stats.newResidents} new, ${stats.updatedResidents} updated, ${stats.errors} errors, ${stats.skippedRows} skipped`,
      stats,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Import failed: ${error.message}`,
      errors: [error.message],
    };
  }
}

/**
 * Check if two names are similar (fuzzy matching)
 */
function isSimilarName(name1: string, name2: string): boolean {
  // Normalize names
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "");

  const normalizedName1 = normalize(name1);
  const normalizedName2 = normalize(name2);

  // Exact match after normalization
  if (normalizedName1 === normalizedName2) return true;

  // Simple similarity check - shared words
  const words1 = normalizedName1.split(/\s+/);
  const words2 = normalizedName2.split(/\s+/);

  // Check if first and last names match
  if (words1.length > 0 && words2.length > 0) {
    // First name match
    if (words1[0] === words2[0]) return true;

    // Last name match
    if (words1[words1.length - 1] === words2[words2.length - 1]) return true;
  }

  // Count common words
  const commonWords = words1.filter((word) => words2.includes(word));
  const similarity =
    commonWords.length / Math.max(words1.length, words2.length);

  return similarity >= 0.5; // 50% similarity threshold
}

/**
 * Server action to handle file upload and processing
 * This is the main entry point for the resident import feature
 */
export async function processResidentUpload(
  formData: FormData
): Promise<ImportResult> {
  try {
    const supabase = await createClient();

    // Get current user session from Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Unauthorized: You must be logged in",
      };
    }

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return {
        success: false,
        message: "Failed to verify admin privileges",
      };
    }

    if (!profile || profile.role !== "admin") {
      return {
        success: false,
        message: "Forbidden: Admin privileges required",
      };
    }

    const file = formData.get("file") as File;
    const buildingId = formData.get("buildingId") as string;

    if (!file) {
      return {
        success: false,
        message: "No file provided",
      };
    }

    if (!buildingId) {
      return {
        success: false,
        message: "Building ID is required",
      };
    }

    // Verify file type
    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(fileType || "")) {
      return {
        success: false,
        message:
          "Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.",
      };
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Process the file
    const result = await importResidentsFromExcel(buffer, buildingId, user.id);

    // Revalidate the residents and import pages to reflect changes
    revalidatePath("/admin/residents");
    revalidatePath("/admin/import");

    return result;
  } catch (error: any) {
    console.error("Import error:", error);
    return {
      success: false,
      message: `File upload failed: ${error.message}`,
    };
  }
}

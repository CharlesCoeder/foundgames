"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/utils/supabase/server";
import { performAdminAction } from "@/app/utils/admin-actions";

/**
 * Get all buildings
 */
export async function getAllBuildings() {
  try {
    // Use the admin action to bypass RLS
    return await performAdminAction(async (adminClient) => {
      const { data, error } = await adminClient
        .from("buildings")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching buildings:", error);
        throw new Error(`Failed to fetch buildings: ${error.message}`);
      }

      return data || [];
    });
  } catch (error: any) {
    console.error("Building fetch error:", error);
    throw new Error(`Failed to fetch buildings: ${error.message}`);
  }
}

/**
 * Create or update a building
 */
export async function createOrUpdateBuilding(formData: FormData) {
  try {
    // First check if the user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    // Get user profile to check admin status
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      throw new Error("Forbidden: Admin privileges required");
    }

    // Extract building data from form
    const id = (formData.get("id") as string) || undefined;
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;
    const isActive = formData.get("isActive") === "true";

    if (!name) {
      throw new Error("Building name is required");
    }

    // Create building data object
    const buildingData: any = {
      name,
      address,
      city,
      state,
      zip,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    // If ID is provided, include it for update
    if (id) {
      buildingData.id = id;
    }

    // Use the admin client to bypass RLS
    return await performAdminAction(async (adminClient) => {
      const { data, error } = await adminClient
        .from("buildings")
        .upsert(buildingData)
        .select()
        .single();

      if (error) {
        console.error("Error saving building:", error);
        throw new Error(`Failed to save building: ${error.message}`);
      }

      // Revalidate admin pages
      revalidatePath("/admin/buildings");
      revalidatePath("/admin");

      return {
        success: true,
        building: data,
        message: `Building ${id ? "updated" : "created"} successfully!`,
      };
    });
  } catch (error: any) {
    console.error("Building save error:", error);
    return {
      success: false,
      message: error.message || "Failed to save building",
    };
  }
}

/**
 * Delete a building
 */
export async function deleteBuilding(id: string) {
  try {
    // First check if the user is authenticated and is an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    // Get user profile to check admin status
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      throw new Error("Forbidden: Admin privileges required");
    }

    // Use the admin client to bypass RLS
    return await performAdminAction(async (adminClient) => {
      const { error } = await adminClient
        .from("buildings")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting building:", error);
        throw new Error(`Failed to delete building: ${error.message}`);
      }

      // Revalidate admin pages
      revalidatePath("/admin/buildings");
      revalidatePath("/admin");

      return {
        success: true,
        message: "Building deleted successfully!",
      };
    });
  } catch (error: any) {
    console.error("Building delete error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete building",
    };
  }
}

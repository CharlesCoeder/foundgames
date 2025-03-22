"use client";

import { useState, useRef, useEffect } from "react";
import { processResidentUpload } from "@/app/actions/import-residents";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Building codes for reference
const BUILDING_CODES = [
  { code: "525LEX", name: "Turtle Bay" },
  { code: "569LEX/400W37", name: "Midtown East" },
  { code: "160W24", name: "Chelsea" },
  { code: "186HALL", name: "Brooklyn Heights" },
];

export default function ImportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Fetch buildings on component mount
  useEffect(() => {
    async function fetchBuildings() {
      const { data, error } = await supabase
        .from("buildings")
        .select("id, name")
        .order("name");

      if (error) {
        setError(`Failed to load buildings: ${error.message}`);
      } else {
        setBuildings(data || []);
        if (data && data.length > 0) {
          setSelectedBuilding(data[0].id);
        }
      }
    }

    fetchBuildings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!selectedBuilding) {
        throw new Error("Please select a building");
      }

      // Get form data
      const formData = new FormData(formRef.current!);

      // Add buildingId to the form data
      formData.set("buildingId", selectedBuilding);

      // Call the server action directly
      const importResult = await processResidentUpload(formData);

      setResult(importResult);

      if (!importResult.success) {
        setError(importResult.message);
      } else {
        // Refresh the page data after successful import
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during the import process");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Import Resident Data</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Select Building
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              required
            >
              <option value="">Select a building...</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Resident Data File (Excel or CSV)
            </label>
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls,.csv"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <div className="text-sm text-gray-500 mt-2 space-y-1">
              <p>
                Upload an Excel file (.xlsx, .xls) or CSV file with resident
                data.
              </p>
              <p>
                The system will process the file according to the following
                rules:
              </p>
              <ul className="list-disc list-inside ml-2">
                <li>
                  Column B contains the room-bed information (e.g., "525LEX -
                  0301-1")
                </li>
                <li>
                  Column C contains the occupancy status and resident name
                </li>
                <li>
                  Only rows with "I" at the beginning of Column C will be
                  imported (active residents)
                </li>
                <li>
                  Resident names are extracted from the end of Column C (format:
                  "LastName, FirstName")
                </li>
              </ul>
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="font-medium">Supported Building Codes:</p>
                <ul className="grid grid-cols-2 gap-x-4 mt-1">
                  {BUILDING_CODES.map((building) => (
                    <li key={building.code} className="text-xs">
                      <span className="font-mono">{building.code}</span> ={" "}
                      {building.name}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-2 italic">
                Example column C format: "I [M] 525Lex - NYIT - Fall 2024/Spring
                2025 - Marshall, Alexander"
              </p>
            </div>
          </div>

          <button
            type="submit"
            className={`bg-blue-600 text-white px-4 py-2 rounded-md ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Import Residents"}
          </button>
        </form>
      </div>

      {result && (
        <div
          className={`rounded-lg shadow-md p-6 ${
            result.success ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <h2 className="text-xl font-semibold mb-3">
            {result.success ? "Import Successful" : "Import Failed"}
          </h2>
          <p className="mb-3">{result.message}</p>

          {result.stats && (
            <div className="bg-white rounded p-4 mb-3">
              <h3 className="font-medium mb-2">Import Statistics</h3>
              <ul className="space-y-1">
                <li>Total records processed: {result.stats.totalProcessed}</li>
                <li>New residents added: {result.stats.newResidents}</li>
                <li>
                  Existing residents updated: {result.stats.updatedResidents}
                </li>
                <li>Errors encountered: {result.stats.errors}</li>
              </ul>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="bg-white rounded p-4">
              <h3 className="font-medium mb-2">Error Details</h3>
              <div className="max-h-60 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1">
                  {result.errors.map((err: string, index: number) => (
                    <li key={index} className="text-red-600 text-sm">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Imports</h2>
        <ImportHistoryList />
      </div>
    </div>
  );
}

function ImportHistoryList() {
  const [imports, setImports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImportHistory() {
      try {
        const { data, error } = await supabase
          .from("import_logs")
          .select(
            `
            id, 
            file_name, 
            record_count, 
            success_count, 
            error_count, 
            created_at,
            buildings(name)
          `
          )
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) {
          throw error;
        }

        setImports(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImportHistory();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Loading import history...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to load import history: {error}
      </div>
    );
  }

  if (imports.length === 0) {
    return <div className="text-gray-500">No import history available.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Building
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              File
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Records
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {imports.map((importLog) => (
            <tr key={importLog.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(importLog.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {importLog.buildings?.name || "Unknown"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {importLog.file_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {importLog.success_count} / {importLog.record_count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {importLog.error_count > 0 ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    {importLog.error_count} errors
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Success
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

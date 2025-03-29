import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Helper function to perform admin actions that bypass RLS
 *
 * This provides a consistent way to use the service role key for admin operations
 * while maintaining security by only using it in server-side contexts.
 *
 * @param callback Function that receives the admin client and performs the action
 * @returns Result of the callback function
 */
export async function performAdminAction<T>(
  callback: (
    adminClient: ReturnType<typeof createSupabaseClient<any, "public", any>>
  ) => Promise<T>
): Promise<T> {
  // Ensure we have the necessary environment variables
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Missing required environment variables for admin actions");
  }

  // Create the admin client with service role key
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  );

  // Execute the callback with the admin client
  return await callback(adminClient);
}

/**
 * Check if a user is an admin
 *
 * @param userId The user ID to check
 * @returns Promise resolving to a boolean indicating if the user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    return await performAdminAction(async (adminClient) => {
      const { data, error } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      return data?.role === "admin";
    });
  } catch (error) {
    console.error("Failed to check admin status:", error);
    return false;
  }
}

/**
 * Create or update a building as admin
 *
 * @param buildingData Building data to create or update
 * @returns Promise resolving to the building data or null if operation failed
 */
export async function createOrUpdateBuilding(buildingData: any): Promise<any> {
  try {
    return await performAdminAction(async (adminClient) => {
      const { data, error } = await adminClient
        .from("buildings")
        .upsert(buildingData)
        .select()
        .single();

      if (error) {
        console.error("Error creating/updating building:", error);
        throw error;
      }

      return data;
    });
  } catch (error) {
    console.error("Failed to create/update building:", error);
    throw error;
  }
}

/**
 * Delete a building as admin
 *
 * @param buildingId ID of the building to delete
 * @returns Promise resolving to true if deletion was successful
 */
export async function deleteBuilding(buildingId: string): Promise<boolean> {
  try {
    return await performAdminAction(async (adminClient) => {
      const { error } = await adminClient
        .from("buildings")
        .delete()
        .eq("id", buildingId);

      if (error) {
        console.error("Error deleting building:", error);
        return false;
      }

      return true;
    });
  } catch (error) {
    console.error("Failed to delete building:", error);
    return false;
  }
}

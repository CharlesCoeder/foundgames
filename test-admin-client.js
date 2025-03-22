// This is a NodeJS script to test if our admin client is working properly
// with the service role key, bypassing RLS policies

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

// Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Using URL:", supabaseUrl);
console.log("Service key available:", !!supabaseServiceKey);
console.log("Anon key available:", !!supabaseAnonKey);

// Test function
async function testAdminOperations() {
  // Create both clients for comparison
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  const regularClient = createClient(supabaseUrl, supabaseAnonKey);

  console.log("\n--- Testing Admin Client (Service Role) ---");

  // 1. Fetch profiles using admin client
  try {
    console.log("Fetching profiles with admin client...");
    const { data: profilesData, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .limit(5);

    if (profilesError) {
      console.error(
        "Error fetching profiles with admin client:",
        profilesError
      );
    } else {
      console.log(`✅ Success! Found ${profilesData.length} profiles`);
      console.log("First profile:", profilesData[0]);
    }
  } catch (error) {
    console.error("Exception fetching profiles with admin client:", error);
  }

  // 2. Try to fetch buildings with admin client
  try {
    console.log("\nFetching buildings with admin client...");
    const { data: buildingsData, error: buildingsError } = await adminClient
      .from("buildings")
      .select("*")
      .limit(5);

    if (buildingsError) {
      console.error(
        "Error fetching buildings with admin client:",
        buildingsError
      );
    } else {
      console.log(`✅ Success! Found ${buildingsData.length} buildings`);
      if (buildingsData.length > 0) {
        console.log("First building:", buildingsData[0]);
      }
    }
  } catch (error) {
    console.error("Exception fetching buildings with admin client:", error);
  }

  console.log("\n--- Testing Regular Client (Anon Key) ---");

  // 3. Try to fetch profiles with regular client (should fail due to RLS)
  try {
    console.log("Fetching profiles with regular client...");
    const { data: profilesData, error: profilesError } = await regularClient
      .from("profiles")
      .select("*")
      .limit(5);

    if (profilesError) {
      console.log(`❌ Expected error (due to RLS): ${profilesError.message}`);
    } else {
      console.log(
        `Found ${profilesData.length} profiles. This should be empty or only show your profile if you're logged in.`
      );
    }
  } catch (error) {
    console.error("Exception fetching profiles with regular client:", error);
  }

  // 4. Try to create a test building with admin client
  try {
    const testBuilding = {
      name: "Test Building " + new Date().toISOString(),
      address: "123 Test Street",
      city: "Testville",
      state: "TS",
      zip: "12345",
      is_active: true,
    };

    console.log("\nCreating test building with admin client...");
    const { data: newBuilding, error: createError } = await adminClient
      .from("buildings")
      .insert(testBuilding)
      .select()
      .single();

    if (createError) {
      console.error("Error creating building with admin client:", createError);
    } else {
      console.log(`✅ Success! Created building with ID: ${newBuilding.id}`);
      console.log("New building:", newBuilding);

      // Clean up by deleting the test building
      console.log("\nCleaning up - deleting test building...");
      const { error: deleteError } = await adminClient
        .from("buildings")
        .delete()
        .eq("id", newBuilding.id);

      if (deleteError) {
        console.error("Error deleting test building:", deleteError);
      } else {
        console.log("✅ Successfully deleted test building");
      }
    }
  } catch (error) {
    console.error(
      "Exception creating/deleting building with admin client:",
      error
    );
  }
}

// Run tests
testAdminOperations()
  .then(() => {
    console.log("\nTests completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nTest failed with error:", error);
    process.exit(1);
  });

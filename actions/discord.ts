"use server";

// Discord API constants
const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export async function checkDiscordUsername(
  username: string
): Promise<{ exists: boolean; error?: string }> {
  if (!username) {
    return { exists: false, error: "Username is required" };
  }

  if (!BOT_TOKEN) {
    console.error("Discord bot token is not configured");
    return {
      exists: false,
      error: "Discord verification is not properly configured",
    };
  }

  if (!GUILD_ID) {
    console.error("Discord guild ID is not configured");
    return {
      exists: false,
      error: "Discord server ID is not properly configured",
    };
  }

  try {
    console.log(
      `Checking if user ${username} exists in Discord server ${GUILD_ID}`
    );

    // First, we need to get all members from the server
    const response = await fetch(
      `${DISCORD_API}/guilds/${GUILD_ID}/members?limit=1000`,
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Discord API error (${response.status}):`, errorText);

      if (response.status === 401) {
        return {
          exists: false,
          error:
            "Discord authentication failed. Please contact an administrator.",
        };
      }

      return { exists: false, error: `Discord API error: ${response.status}` };
    }

    const members = await response.json();
    console.log(`Found ${members.length} members in the Discord server`);

    // Check if the username exists in the server
    const userExists = members.some((member: any) => {
      const memberUsername = member.user.username;
      return memberUsername.toLowerCase() === username.toLowerCase();
    });

    console.log(`User ${username} exists in server: ${userExists}`);
    return { exists: userExists };
  } catch (error) {
    console.error("Error checking Discord username:", error);
    return { exists: false, error: "Failed to check Discord username" };
  }
}

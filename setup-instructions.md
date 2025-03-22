# FOUND Games Setup Instructions

## Supabase Setup

Follow these steps to set up your Supabase project and configure the application:

### 1. Create or Access Your Supabase Project

- Go to [https://supabase.com/](https://supabase.com/)
- Sign in or create an account
- Create a new project or select your existing project

### 2. Get Your Project Credentials

You'll need three important credentials from your Supabase project:

1. **Project URL**:

   - Go to Project Settings > API
   - Copy the URL under "Project URL"

2. **Anon/Public Key**:

   - Go to Project Settings > API
   - Copy the key under "anon" "public" (this is your public API key)

3. **Service Role Key** (for admin operations):
   - Go to Project Settings > API
   - Copy the key under "service_role" (this is your admin API key)
   - **IMPORTANT**: Keep this key secure! It bypasses Row Level Security.

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Replace the placeholder values with your actual credentials.

### 4. Set Up Database Schema

To set up your database schema:

1. Run the update-schema.sh script:

   ```bash
   chmod +x update-schema.sh
   ./update-schema.sh
   ```

2. Follow the prompts to copy and run each SQL script in your Supabase SQL Editor.

Alternatively, you can manually copy and run these SQL files in your Supabase SQL Editor:

- `supabase/migrations/profiles_schema.sql`
- `supabase/migrations/residents_schema.sql`

### 5. Create Admin User

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Go to [http://localhost:3000/admin-setup](http://localhost:3000/admin-setup)

3. Use the setup key: `FOUND_GAMES_ADMIN_SETUP`

4. Fill out the form to create your admin user.

5. Check your email for a confirmation link if email confirmation is enabled.

6. Log in at [http://localhost:3000/login](http://localhost:3000/login)

## Troubleshooting

### RLS Policy Issues

If you're experiencing RLS (Row Level Security) policy issues:

1. Make sure you've correctly run the schema SQL scripts that set up the RLS policies.

2. Verify you're using the correct Supabase client:

   - For normal user operations: use `createClient()`
   - For admin operations that need to bypass RLS: use `createAdminClient()`

3. Check that your service role key is correctly set in your environment variables.

### Authentication Issues

If you're having trouble logging in:

1. Check if email confirmation is required in your Supabase authentication settings.

2. Verify that the user exists in the `auth.users` table.

3. Confirm that the user has a corresponding row in the `profiles` table with the correct role.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

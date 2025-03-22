# FOUND Games

A verification system for student housing residents to access a Minecraft server.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and update with your Supabase credentials:

   ```bash
   cp .env.local.example .env.local
   ```

4. Get your Supabase credentials from your Supabase dashboard:

   - Project URL: Project Settings > API > URL
   - Anonymous Key: Project Settings > API > `anon` `public`
   - Service Role Key: Project Settings > API > `service_role` (Keep this secret!)

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Access the application at [http://localhost:3000](http://localhost:3000)

## Admin Setup

To create the initial admin user:

1. Make sure you've set up your Supabase credentials, including the `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`
2. Go to [http://localhost:3000/admin-setup](http://localhost:3000/admin-setup)
3. Use the setup key: `FOUND_GAMES_ADMIN_SETUP`
4. Fill in the admin user details and create the account
5. Confirm your email if email confirmation is enabled
6. Log in at [http://localhost:3000/login](http://localhost:3000/login)

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles with roles (admin, user)
- `buildings`: Student housing buildings
- `residents`: Residents living in the buildings
- `verifications`: Player verification requests
- `import_logs`: Records of resident import operations

You can run the schema migration scripts in the Supabase SQL Editor:

- `supabase/migrations/profiles_schema.sql`
- `supabase/migrations/residents_schema.sql`

## Features

- Admin dashboard for managing residents and verifications
- Resident import from Excel files
- User verification workflow
- Discord and Minecraft username verification

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

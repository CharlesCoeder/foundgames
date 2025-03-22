#!/bin/bash

# Make the script executable
chmod +x $(dirname "$0")/update-schema.sh

echo "==============================================="
echo "FOUND Games Schema Update Script"
echo "==============================================="
echo ""
echo "This script will help you update your database schema."
echo "Copy these SQL commands and run them in your Supabase SQL Editor."
echo ""

# Display Profiles Schema Fix
echo "==============================================="
echo "1. Profiles Table Schema Fix"
echo "==============================================="
echo ""
cat $(dirname "$0")/supabase/migrations/profiles_schema.sql
echo ""
echo "-----------------------------------------------"
echo "Copied Profiles Schema SQL to clipboard."
echo "Please paste and run this in your Supabase SQL Editor first."
echo "-----------------------------------------------"
pbcopy < $(dirname "$0")/supabase/migrations/profiles_schema.sql

# Wait for user to press a key
read -p "Press any key after running the profiles schema SQL..." -n1 -s
echo ""

# Display Buildings Schema Fix
echo "==============================================="
echo "2. Buildings Table Schema Fix"
echo "==============================================="
echo ""
cat $(dirname "$0")/supabase/migrations/buildings_schema.sql
echo ""
echo "-----------------------------------------------"
echo "Copied Buildings Schema SQL to clipboard."
echo "Please paste and run this in your Supabase SQL Editor."
echo "-----------------------------------------------"
pbcopy < $(dirname "$0")/supabase/migrations/buildings_schema.sql

# Wait for user to press a key
read -p "Press any key after running the buildings schema SQL..." -n1 -s
echo ""

# Display Residents Schema Fix
echo "==============================================="
echo "3. Residents Table Schema Fix"
echo "==============================================="
echo ""
cat $(dirname "$0")/supabase/migrations/residents_schema.sql
echo ""
echo "-----------------------------------------------"
echo "Copied Residents Schema SQL to clipboard."
echo "Please paste and run this in your Supabase SQL Editor."
echo "-----------------------------------------------"
pbcopy < $(dirname "$0")/supabase/migrations/residents_schema.sql

echo ""
echo "==============================================="
echo "Schema update complete! Now restart your app with:"
echo "npm run dev"
echo "===============================================" 
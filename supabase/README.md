# Database Migration System for MotoAuto.ch

This directory contains database migrations for the MotoAuto.ch application. These files are designed to be run in sequence to set up and maintain the database schema.

## Migration Files

1. `20250729000001_create_initial_schema.sql` - Creates the basic database schema
2. `20250729000002_create_functions.sql` - Creates necessary database functions
3. `20250730000001_contact_tables.sql` - Creates contact-related tables and policies

## Seed Files

- `seed.sql` - Contains basic seed data for categories and packages
- `seed_contact_categories.sql` - Contains seed data for contact categories

## How to Apply Migrations

### Using Supabase CLI

If you're using the Supabase CLI, you can apply the migrations with:

```bash
# Apply migrations
supabase db push

# Apply seed data
supabase db reset --seed-data

# Or if you want to apply a specific seed file
psql -h localhost -p 5432 -U postgres -d postgres -f ./supabase/seed_contact_categories.sql
```

### Using Local Database

If you're running PostgreSQL locally or in Docker, you can apply the migrations with:

```bash
# Connect to your database
psql -h localhost -p 5432 -U postgres -d your_database

# Apply migrations in order
\i ./supabase/migrations/20250729000001_create_initial_schema.sql
\i ./supabase/migrations/20250729000002_create_functions.sql
\i ./supabase/migrations/20250730000001_contact_tables.sql

# Apply seed data
\i ./supabase/seed.sql
\i ./supabase/seed_contact_categories.sql
```

### Using API Routes

The application also includes API routes to set up the database:

1. Visit `/api/admin/setup-database` in your browser (admin access required)
2. This will execute the SQL setup scripts in the correct order

## Database Schema Overview

The database schema includes the following main components:

1. **Authentication & Profiles**
   - Uses Supabase Auth for user management
   - Extends with custom profiles table

2. **Categories System**
   - Hierarchical categories for listings
   - Category attributes for structured data

3. **Listings System**
   - Listings table for main data
   - Attributes stored in listing_attributes
   - Images stored in listing_images

4. **Auction System**
   - Auction details in auctions table
   - Bid history in bids table

5. **Contact System**
   - Contact categories for organizing inquiries
   - Contact messages for storing user communications

## Troubleshooting

If you encounter errors related to missing functions:

1. Ensure that the `20250729000002_create_functions.sql` file has been applied
2. Check that the `exec_sql` function is properly created
3. Make sure all database triggers are created correctly

## Adding New Migrations

To add a new migration:

1. Create a new file in the `migrations` directory with a timestamp prefix (e.g., `20250731000001_new_feature.sql`)
2. Include both the forward migration and any necessary rollback statements
3. Test the migration locally before deploying
4. Update this README with information about the new migration

## Backing Up Data

It's recommended to back up your data before running migrations:

```bash
# Using pg_dump
pg_dump -h localhost -p 5432 -U postgres -d your_database > backup.sql
```

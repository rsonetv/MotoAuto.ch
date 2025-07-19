# Supabase Integration Documentation

## Overview

This document provides comprehensive instructions for integrating Supabase into the MotoAuto.ch project, including authentication, database operations, and security configurations.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Project Setup**: Create a new Supabase project
3. **Environment Variables**: Configure the required environment variables

## Environment Variables

Add the following environment variables to your `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

## Database Setup

### 1. Run Database Schema

Execute the SQL script in your Supabase SQL editor:

\`\`\`sql
-- Copy and paste the content from scripts/setup-database-complete.sql
\`\`\`

### 2. Alternative: Use Admin Setup Page

Visit `/admin/setup` in your application to run the automated setup process.

## Authentication Implementation

### 1. Auth Provider Setup

The authentication is handled by the `AuthProvider` component:

\`\`\`tsx
// lib/providers/auth-provider.tsx
import { AuthProvider } from "@/lib/providers/auth-provider"

// Wrap your app with the provider
<AuthProvider>
  {children}
</AuthProvider>
\`\`\`

### 2. Using Authentication

\`\`\`tsx
import { useAuth } from "@/lib/hooks/use-auth"

function MyComponent() {
  const { user, signIn, signUp, signOut, loading } = useAuth()
  
  // Check if user is authenticated
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return <div>Welcome, {user.email}!</div>
}
\`\`\`

### 3. Authentication Methods

#### Sign Up
\`\`\`tsx
const { signUp } = useAuth()

try {
  await signUp(email, password, fullName)
  // User will receive confirmation email
} catch (error) {
  console.error("Sign up error:", error)
}
\`\`\`

#### Sign In
\`\`\`tsx
const { signIn } = useAuth()

try {
  await signIn(email, password)
  // User is now authenticated
} catch (error) {
  console.error("Sign in error:", error)
}
\`\`\`

#### Sign Out
\`\`\`tsx
const { signOut } = useAuth()

try {
  await signOut()
  // User is now signed out
} catch (error) {
  console.error("Sign out error:", error)
}
\`\`\`

## CRUD Operations

### 1. Listings Service

The `listingsService` provides all CRUD operations for vehicle listings:

\`\`\`tsx
import { listingsService } from "@/lib/queries/listings"

// Create a new listing
const newListing = await listingsService.createListing({
  user_id: user.id,
  title: "My Car",
  price: 25000,
  category: "auto",
  brand: "BMW",
  model: "320d",
  location: "Zürich",
  // ... other fields
})

// Get all listings with filters
const listings = await listingsService.getListings({
  category: "auto",
  minPrice: 10000,
  maxPrice: 50000,
  search: "BMW",
})

// Get a single listing
const listing = await listingsService.getListing(listingId)

// Update a listing
const updatedListing = await listingsService.updateListing(listingId, {
  price: 23000,
  title: "Updated Title",
})

// Delete a listing
await listingsService.deleteListing(listingId)
\`\`\`

### 2. Favorites Management

\`\`\`tsx
// Toggle favorite status
const isFavorited = await listingsService.toggleFavorite(listingId, userId)

// Get user's favorites
const favoriteIds = await listingsService.getUserFavorites(userId)
\`\`\`

### 3. View Tracking

\`\`\`tsx
// Increment view count
await listingsService.incrementViews(listingId)
\`\`\`

## Security Features

### 1. Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Profiles**: Users can view all profiles but only update their own
- **Listings**: Anyone can view active listings, users can manage their own
- **Favorites**: Users can only manage their own favorites
- **Bids**: Users can view bids for listings they own or bid on

### 2. Data Validation

- Client-side validation using Zod schemas
- Database constraints for data integrity
- Type safety with TypeScript

### 3. Error Handling

\`\`\`tsx
try {
  const result = await listingsService.createListing(data)
  toast.success("Listing created successfully!")
} catch (error) {
  console.error("Error creating listing:", error)
  toast.error("Failed to create listing")
}
\`\`\`

## Database Schema

### Core Tables

1. **profiles** - User profiles extending Supabase auth
2. **listings** - Vehicle listings with comprehensive details
3. **bids** - Auction bids
4. **favorites** - User favorites
5. **messages** - User-to-user messaging

### Key Features

- **Full-text search** on listings
- **Geolocation support** for location-based searches
- **Auction system** with bidding functionality
- **Image and document storage** support
- **Performance indexes** for fast queries

## API Routes

### Admin Routes

- `POST /api/admin/setup-database` - Initialize database schema
- `POST /api/admin/seed-data` - Insert sample data

## Testing

### 1. Authentication Testing

\`\`\`tsx
// Test user registration
const testUser = {
  email: "test@example.com",
  password: "TestPassword123!",
  fullName: "Test User"
}

await signUp(testUser.email, testUser.password, testUser.fullName)
\`\`\`

### 2. CRUD Testing

\`\`\`tsx
// Test listing creation
const testListing = {
  title: "Test Vehicle",
  price: 15000,
  category: "auto" as const,
  brand: "Test Brand",
  model: "Test Model",
  location: "Test Location",
  user_id: user.id,
}

const createdListing = await listingsService.createListing(testListing)
\`\`\`

## Deployment Considerations

1. **Environment Variables**: Ensure all Supabase keys are properly set
2. **Database Migrations**: Run setup scripts in production
3. **RLS Policies**: Verify security policies are working correctly
4. **Performance**: Monitor query performance and optimize as needed

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check environment variables
   - Verify Supabase project settings
   - Ensure RLS policies allow operations

2. **Database Errors**
   - Check table existence
   - Verify user permissions
   - Review RLS policies

3. **CORS Issues**
   - Configure Supabase CORS settings
   - Check domain whitelist

### Debug Mode

Enable debug logging:

\`\`\`tsx
// Add to your component
console.log("User:", user)
console.log("Loading:", loading)
\`\`\`

## Best Practices

1. **Always handle errors** in async operations
2. **Use TypeScript types** for type safety
3. **Implement proper loading states** for better UX
4. **Validate data** on both client and server
5. **Use RLS policies** for security
6. **Monitor performance** with proper indexing

## Support

For additional help:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project GitHub Issues](https://github.com/your-repo/issues)

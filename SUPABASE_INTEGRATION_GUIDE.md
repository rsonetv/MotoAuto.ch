# MotoAuto.ch Supabase Integration Guide

## 🚀 Complete Integration Overview

This guide covers the complete Supabase integration for MotoAuto.ch, including authentication, database operations, and security best practices.

## 📋 Prerequisites

- Supabase project created
- Environment variables configured
- Next.js 14+ application

## 🔧 Environment Configuration

Create a `.env.local` file with your Supabase credentials:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hqygljpxjpzcrxojftbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service Role Key - NEVER expose to client-side code
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Legacy JWT Secret (for reference)
JWT_SECRET=your_jwt_secret_here
\`\`\`

## 🏗️ Database Schema

### Core Tables

1. **profiles** - User profiles extending Supabase auth
2. **listings** - Vehicle listings (cars and motorcycles)
3. **bids** - Auction bids
4. **favorites** - User favorites

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Comprehensive policies** for data access control
- **Foreign key constraints** for data integrity
- **Performance indexes** for fast queries

## 🔐 Authentication System

### Features Implemented

- ✅ User registration with email verification
- ✅ Secure login/logout
- ✅ Password reset functionality
- ✅ Profile management
- ✅ Session persistence
- ✅ Automatic token refresh

### Usage Examples

\`\`\`typescript
// Sign up a new user
import { signUp } from "@/lib/auth"

const { user, session } = await signUp(
  "user@example.com", 
  "password123", 
  "John Doe"
)

// Sign in existing user
import { signIn } from "@/lib/auth"

const { user, session } = await signIn("user@example.com", "password123")

// Get current user
import { getCurrentUser } from "@/lib/auth"

const user = await getCurrentUser()
\`\`\`

## 📊 CRUD Operations

### Listings Management

\`\`\`typescript
import { 
  getListings, 
  createListing, 
  updateListing, 
  deleteListing 
} from "@/lib/queries/listings"

// Get filtered listings
const listings = await getListings({
  category: "auto",
  brand: "BMW",
  minPrice: 20000,
  maxPrice: 50000,
  sortBy: "price_desc"
})

// Create new listing
const newListing = await createListing({
  title: "BMW 320d",
  price: 35000,
  category: "auto",
  brand: "BMW",
  model: "320d",
  // ... other fields
})

// Update listing
const updated = await updateListing(listingId, {
  price: 33000,
  description: "Updated description"
})

// Delete listing
await deleteListing(listingId)
\`\`\`

### Advanced Filtering

The system supports comprehensive filtering:

- **Category**: auto/moto
- **Brand & Model**: Exact matches
- **Price Range**: Min/max filtering
- **Year Range**: Vehicle age filtering
- **Location**: Geographic filtering
- **Search**: Full-text search across multiple fields
- **Sorting**: Price, year, creation date

## 🛡️ Security Best Practices

### 1. Service Role Key Protection

\`\`\`typescript
// ✅ CORRECT - Server-side only
import { supabaseAdmin } from "@/lib/supabase-admin"

// ❌ WRONG - Never expose service role key to client
// const supabase = createClient(url, SERVICE_ROLE_KEY)
\`\`\`

### 2. Row Level Security Policies

\`\`\`sql
-- Users can only see active listings or their own
CREATE POLICY "Anyone can view active listings" ON listings FOR SELECT USING (
  status = 'active' OR auth.uid() = user_id
);

-- Users can only modify their own listings
CREATE POLICY "Users can update own listings" ON listings FOR UPDATE 
USING (auth.uid() = user_id);
\`\`\`

### 3. Input Validation

\`\`\`typescript
// Client-side validation
const validateListing = (data: ListingInsert) => {
  if (!data.title || data.title.length < 5) {
    throw new Error("Title must be at least 5 characters")
  }
  
  if (data.price <= 0) {
    throw new Error("Price must be positive")
  }
  
  // ... more validations
}

// Server-side constraints in database
ALTER TABLE listings ADD CONSTRAINT check_positive_price 
CHECK (price > 0);
\`\`\`

## 🚀 Admin Operations

### Database Setup

Use the admin setup page to initialize your database:

1. Navigate to `/admin/setup`
2. Click "Run Full Setup"
3. Wait for completion

### Manual Setup via API

\`\`\`bash
# Setup database schema
curl -X POST http://localhost:3000/api/admin/setup-database

# Seed sample data
curl -X POST http://localhost:3000/api/admin/seed-data
\`\`\`

## 📈 Performance Optimization

### 1. Database Indexes

\`\`\`sql
-- Performance indexes created automatically
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_brand ON listings(brand);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
\`\`\`

### 2. Query Optimization

\`\`\`typescript
// ✅ Efficient - Use specific selects
const listings = await supabase
  .from("listings")
  .select("id, title, price, images")
  .eq("status", "active")
  .limit(20)

// ❌ Inefficient - Avoid select all
const listings = await supabase
  .from("listings")
  .select("*")
\`\`\`

### 3. Pagination

\`\`\`typescript
const getListings = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit
  
  return await supabase
    .from("listings")
    .select("*")
    .range(offset, offset + limit - 1)
}
\`\`\`

## 🔍 Error Handling

### Comprehensive Error Management

\`\`\`typescript
export async function getListings(filters: ListingFilters = {}) {
  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")

    if (error) {
      console.error("Database error:", error)
      throw new Error(`Failed to fetch listings: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error:", error)
    throw error
  }
}
\`\`\`

## 🧪 Testing

### Test Database Connection

\`\`\`typescript
import { verifyAdminConnection } from "@/lib/supabase-admin"

const isConnected = await verifyAdminConnection()
console.log("Admin connection:", isConnected ? "✅" : "❌")
\`\`\`

### Test Authentication Flow

\`\`\`typescript
// Test user registration
const testAuth = async () => {
  try {
    await signUp("test@example.com", "password123", "Test User")
    console.log("✅ Registration successful")
    
    await signIn("test@example.com", "password123")
    console.log("✅ Login successful")
    
    const user = await getCurrentUser()
    console.log("✅ User fetch successful:", user?.email)
  } catch (error) {
    console.error("❌ Auth test failed:", error)
  }
}
\`\`\`

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## 🆘 Troubleshooting

### Common Issues

1. **"Auth session missing" error**
   - Check if user is authenticated before calling protected functions
   - Verify environment variables are set correctly

2. **RLS policy violations**
   - Ensure user has proper permissions
   - Check if policies are correctly configured

3. **Connection errors**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Ensure Supabase project is active

### Debug Mode

Enable debug logging:

\`\`\`typescript
// Add to your environment
NEXT_PUBLIC_SUPABASE_DEBUG=true
\`\`\`

This comprehensive integration provides a solid foundation for your MotoAuto.ch application with enterprise-grade security, performance, and scalability.

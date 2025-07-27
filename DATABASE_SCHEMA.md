# MotoAuto.ch Database Schema

This document describes the complete database schema for MotoAuto.ch, a Swiss automotive marketplace supporting multilingual content (PL/DE/FR/EN), CHF currency, and comprehensive auction functionality.

## Overview

The database schema consists of 7 main tables designed to support:
- User profiles with dealer capabilities
- Vehicle listings with detailed specifications
- Auction system with 7-day duration and 5-minute extensions
- Bidding system with auto-bid functionality
- Package-based pricing (first listing free for private users)
- Payment tracking with 5% commission (max 500 CHF)
- Category-based vehicle organization
- Multilingual support for Swiss market

## Database Tables

### 1. Categories
Hierarchical vehicle categories with multilingual support.

**Key Features:**
- Multilingual names (EN/DE/FR/PL)
- Hierarchical structure (parent-child relationships)
- Slug-based URLs
- Active/inactive status

**Relationships:**
- Self-referencing (parent_id → categories.id)
- Referenced by listings (category_id)

### 2. Packages
Pricing packages for listings with different feature sets.

**Key Features:**
- Multilingual descriptions
- CHF pricing
- Duration-based packages
- Feature configuration via JSONB
- Image limits per package

**Key Packages:**
- Free Listing (0 CHF, 30 days, 5 images)
- Premium Listing (29.90 CHF, 60 days, 15 images)
- Dealer Package (99.90 CHF, 90 days, 25 images)

### 3. Profiles
Extended user profiles linked to Supabase auth.users.

**Key Features:**
- Links to Supabase auth.users via foreign key
- Dealer vs private user distinction
- Swiss location support (canton, postal code)
- Verification system
- Notification preferences
- Rating system
- Usage tracking (free listings used, total sales)

**Swiss Market Features:**
- Canton and postal code fields
- Phone verification
- Dealer license tracking
- VAT number for businesses

### 4. Listings
Comprehensive vehicle listings supporting both regular sales and auctions.

**Key Features:**
- Detailed vehicle specifications
- Swiss location data with coordinates
- Multiple images and video support
- Equipment and features via JSONB
- Auction capabilities
- Service history tracking
- Financing/leasing options

**Auction Features:**
- 7-day default duration
- 5-minute auto-extension
- Reserve price support
- Bid increment configuration
- Extension limits

### 5. Auctions
Additional auction-specific data and statistics.

**Key Features:**
- Starting price tracking
- Winner determination
- Extension counting
- Payment and pickup status
- Bidder statistics

### 6. Bids
Comprehensive bidding system with auto-bid support.

**Key Features:**
- Auto-bidding with maximum limits
- IP and user agent tracking
- Bid status management
- Prevents self-bidding
- Auction extension triggers

### 7. Payments
Payment tracking for commissions and fees.

**Key Features:**
- 5% commission rate (max 500 CHF)
- Multiple payment methods (credit card, TWINT, PostFinance, etc.)
- Payment provider integration
- Refund support
- Swiss payment methods

## Key Relationships

```
auth.users (Supabase)
    ↓ (1:1)
profiles
    ↓ (1:many)
listings ← categories (many:1)
    ↓ (1:1)
auctions
    ↓ (1:many)
bids ← profiles (many:1)

profiles → payments (1:many)
packages → listings (1:many)
packages → payments (1:many)
```

## Database Features

### Indexes
- **Performance indexes** on frequently queried columns
- **Full-text search** on listings (title, description, brand, model)
- **Geospatial indexes** for location-based searches
- **Composite indexes** for complex queries

### Triggers
- **Auto-update timestamps** (updated_at columns)
- **Bid statistics updates** (current_bid, bid_count)
- **Auction extensions** (automatic 5-minute extensions)

### Row Level Security (RLS)
- **Public read access** for categories and packages
- **User-specific access** for profiles, listings, bids, payments
- **Auction visibility rules** for active vs ended auctions
- **Bid privacy** (users see own bids + bids on their listings)

### Functions
- `update_updated_at_column()` - Timestamp updates
- `update_listing_bid_stats()` - Bid statistics
- `check_auction_extension()` - Automatic extensions
- `calculate_commission()` - Commission calculation

## Swiss Market Compliance

### Currency
- Primary currency: CHF
- Support for EUR, USD
- Commission cap: 500 CHF

### Location
- Swiss cantons support
- Postal code validation
- Coordinate storage for mapping

### Languages
- German (primary)
- French
- Polish (for Polish community)
- English (fallback)

### Payment Methods
- TWINT (Swiss mobile payment)
- PostFinance
- Credit/debit cards
- Bank transfers
- PayPal

## Setup Instructions

### 1. Execute Schema
```bash
# Run the complete schema
psql -f scripts/complete-database-schema.sql

# Or use the API endpoint
POST /api/database/setup
Authorization: Bearer <your-token>
```

### 2. Validate Setup
```bash
# Run validation script
psql -f scripts/validate-schema.sql

# Or check via API
GET /api/database/setup
```

### 3. Verify Tables
The following tables should be created:
- `categories` (with initial data)
- `packages` (with 3 default packages)
- `profiles`
- `listings`
- `auctions`
- `bids`
- `payments`

## File Structure

```
scripts/
├── complete-database-schema.sql    # Main schema file
├── validate-schema.sql            # Validation queries
├── setup-database.sql            # Legacy schema (basic)
└── functions.sql                 # Additional functions

lib/
├── database.types.ts             # TypeScript definitions
└── supabase.types.ts            # Legacy types

app/api/
├── database/setup/route.ts       # Setup API endpoint
└── admin/setup-database/route.ts # Admin setup endpoint
```

## Migration Notes

### From Existing Schema
If migrating from the existing basic schema:
1. Backup existing data
2. Run the complete schema (drops existing tables)
3. Migrate data to new structure
4. Update application code to use new types

### Production Deployment
1. Test schema in staging environment
2. Plan for data migration downtime
3. Update application environment variables
4. Monitor performance after deployment

## Performance Considerations

### Indexes
- All foreign keys are indexed
- Search fields have appropriate indexes
- Composite indexes for common query patterns

### Partitioning
Consider partitioning for large tables:
- `bids` by date (monthly partitions)
- `payments` by date (monthly partitions)
- `listings` by status/date

### Caching
Recommended caching strategies:
- Categories (rarely change)
- Packages (rarely change)
- Active listings (cache for 5 minutes)
- User profiles (cache for 15 minutes)

## Security Features

### Data Protection
- All sensitive data encrypted at rest
- PII fields properly protected
- Payment data follows PCI compliance

### Access Control
- RLS policies prevent unauthorized access
- API endpoints require authentication
- Admin functions require elevated permissions

### Audit Trail
- All tables have created_at/updated_at
- Payment transactions fully logged
- Bid history preserved

## Monitoring & Maintenance

### Regular Tasks
- Monitor auction extensions
- Clean up expired listings
- Archive old payment records
- Update search indexes

### Performance Monitoring
- Query performance analysis
- Index usage statistics
- Connection pool monitoring
- Storage growth tracking

## Support

For questions about the database schema:
1. Check this documentation
2. Review the validation script output
3. Examine the TypeScript type definitions
4. Test with the API endpoints

## Version History

- **v1.0** - Initial comprehensive schema
- Supports all MotoAuto.ch requirements
- Swiss market compliance
- Multilingual support
- Complete auction system
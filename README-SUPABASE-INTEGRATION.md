# 🚀 Supabase Integration - MotoAuto.ch

Complete Supabase integration guide for the MotoAuto.ch vehicle marketplace platform.

## 📋 Project Information

- **Project ID**: `hqygljpxjpzcrxojftbh`
- **URL**: `https://hqygljpxjpzcrxojftbh.supabase.co`
- **Region**: EU Central (aws-0-eu-central-1)
- **Database**: PostgreSQL with Row Level Security (RLS)

## 🔧 Setup Instructions

### 1. Environment Variables

Create `.env.development.local` with the following variables:

\`\`\`bash
# Supabase Core - REQUIRED
NEXT_PUBLIC_SUPABASE_URL="https://hqygljpxjpzcrxojftbh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWdsanB4anB6Y3J4b2pmdGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4Mzc4NjQsImV4cCI6MjA2NzQxMzg2NH0.Hs8d2HDG3JW68awxm6FbLyjLNb1JDcWk3JSenxjfik8"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeWdsanB4anB6Y3J4b2pmdGJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTgzNzg2NCwiZXhwIjoyMDY3NDEzODY0fQ.A1E--dk6PWas18ymkdi35bReRvCc20NSM60htOJIjlo"
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install @supabase/ssr @supabase/supabase-js
\`\`\`

### 3. Database Migration

1. Open [Supabase Studio](https://supabase.com/dashboard/project/hqygljpxjpzcrxojftbh)
2. Go to **SQL Editor**
3. Copy and paste the content from `supabase/migrations/20250719_create_notes_table.sql`
4. Run the migration

### 4. Verify Integration

\`\`\`bash
# Start development server
npm run dev

# Test Supabase connection
curl http://localhost:3000/notes

# Test XAI integration
curl http://localhost:3000/api/grok-holiday
\`\`\`

## 📁 File Structure

\`\`\`
├── lib/supabase/
│   ├── client.ts          # Client-side Supabase client
│   └── server.ts          # Server-side Supabase client
├── types/
│   └── supabase.ts        # TypeScript database types
├── supabase/migrations/
│   └── 20250719_create_notes_table.sql
├── app/notes/
│   └── page.tsx           # Notes display page
├── middleware.ts          # Auth middleware
└── .env.development.local # Environment variables
\`\`\`

## 🔐 Authentication & Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Public read access** for anonymous users
- **Full access** for authenticated users
- **Service role** for admin operations

### Middleware Protection

Protected routes:
- `/dashboard/*`
- `/profile/*`
- `/ogloszenia/dodaj`
- `/aukcje/dodaj`

Auth routes (redirect if logged in):
- `/auth/login`
- `/auth/register`

## 🗄️ Database Schema

### Notes Table

\`\`\`sql
CREATE TABLE public.notes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### Future Tables (Planned)

- `vehicles` - Vehicle listings
- `auctions` - Auction data
- `users` - User profiles
- `bids` - Auction bids

## 🧪 Testing

### Manual Testing

1. **Database Connection**:
   \`\`\`bash
   curl http://localhost:3000/notes
   \`\`\`

2. **Authentication Flow**:
   - Visit `/auth/login`
   - Register new account
   - Check protected routes

3. **XAI Integration**:
   \`\`\`bash
   curl http://localhost:3000/api/grok-holiday
   \`\`\`

### Automated Testing

\`\`\`bash
# Test all integrations
npm run test:supabase
npm run test:xai

# Type checking
npm run type-check
\`\`\`

## 🚨 Troubleshooting

### Common Issues

1. **"must be owner of table" error**:
   \`\`\`sql
   SET LOCAL ROLE postgres;
   -- Your SQL commands here
   RESET ROLE;
   \`\`\`

2. **RLS blocking queries**:
   - Check policies in Supabase Studio
   - Verify user authentication status

3. **Environment variables not loaded**:
   \`\`\`bash
   vercel env pull .env.development.local
   \`\`\`

4. **TypeScript errors**:
   - Regenerate types: `npx supabase gen types typescript --project-id hqygljpxjpzcrxojftbh`

### Debug Mode

Enable debug logging in development:

\`\`\`typescript
// In your component
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase response:', data)
}
\`\`\`

## 📊 Performance Optimization

### Database Indexes

\`\`\`sql
-- Created automatically by migration
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);
\`\`\`

### Query Optimization

- Use `select('*')` sparingly
- Implement pagination for large datasets
- Use RLS policies efficiently

## 🔄 Deployment

### Vercel Deployment

1. **Link project**:
   \`\`\`bash
   vercel link
   \`\`\`

2. **Set environment variables**:
   \`\`\`bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   \`\`\`

3. **Deploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

### Production Checklist

- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ RLS policies tested
- ✅ Authentication flow verified
- ✅ Rate limiting configured
- ✅ Error handling implemented

## 📈 Monitoring

### Supabase Dashboard

Monitor your project at:
- [Database](https://supabase.com/dashboard/project/hqygljpxjpzcrxojftbh/editor)
- [Auth](https://supabase.com/dashboard/project/hqygljpxjpzcrxojftbh/auth/users)
- [Logs](https://supabase.com/dashboard/project/hqygljpxjpzcrxojftbh/logs/explorer)

### Key Metrics

- Database connections
- Query performance
- Authentication events
- API usage

## 🆘 Support

For issues:
1. Check [Supabase Documentation](https://supabase.com/docs)
2. Review error logs in Supabase Dashboard
3. Check Next.js console for client-side errors
4. Verify environment variables

---

**Integration Status**: ✅ Complete and Ready for Production

Last updated: January 19, 2025

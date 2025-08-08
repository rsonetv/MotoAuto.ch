# Deployment Steps

## Phase 1: Database Migration (Maintenance Window Required)
**Estimated time: 15-20 minutes**

- [ ] Enable maintenance mode
  ```bash
  # Display maintenance page
  # Block non-admin access temporarily
  ```
- [ ] Run database migration
  ```bash
  psql -h $DB_HOST -U postgres -d motoauto_production -f scripts/migrate-database-i18n.sql
  ```
- [ ] Verify migration success
  ```sql
  -- Check migration results
  SELECT 'Categories with translations' as table_name, COUNT(*) as count 
  FROM categories WHERE name_translations != '{}';
  ```
- [ ] Deploy Supabase Edge Functions
  ```bash
  supabase functions deploy auto-translate --project-ref your-project-ref
  ```
- [ ] Test database functions
  ```sql
  SELECT get_translation('{"pl":"Test","de":"Test DE"}'::jsonb, 'de');
  ```

## Phase 2: Application Deployment
**Estimated time: 10-15 minutes**

- [ ] Deploy to staging environment
  ```bash
  vercel --env staging
  ```
- [ ] Run smoke tests on staging
  - Test all locale URLs (/, /de, /fr, /en, /it)
  - Verify language switching functionality
  - Check routing redirects work correctly
  - Test user authentication flows in different languages
- [ ] Verify SEO metadata generation
  ```bash
  curl -s https://staging.motoauto.ch/ | grep -i hreflang
  curl -s https://staging.motoauto.ch/de/ | grep -i hreflang
  ```
- [ ] Deploy to production
  ```bash
  vercel --prod
  ```
- [ ] Disable maintenance mode

## Phase 3: Post-Deployment Verification
**Estimated time: 10 minutes**

- [ ] Test all production URLs
  - https://motoauto.ch/ (Polish - default)
  - https://motoauto.ch/de/ (German)
  - https://motoauto.ch/fr/ (French)
  - https://motoauto.ch/en/ (English)
  - https://motoauto.ch/it/ (Italian)
- [ ] Verify specific page routes
  - /cennik → /de/preise → /fr/prix → /en/pricing → /it/prezzi
  - /ogloszenia → /de/anzeigen → /fr/annonces → /en/listings → /it/annunci
  - /aukcje → /de/auktionen → /fr/encheres → /en/auctions → /it/aste
- [ ] Test language selector functionality
  - Dropdown displays all 5 languages with flags
  - Switching preserves current page context
  - User preference saved in cookie
  - Mobile language selector works
- [ ] Verify browser redirect logic
  - Accept-Language header detection
  - Fallback to Polish for unsupported languages
  - Proper handling of locale prefix in URLs

## Performance & SEO Verification
### 🔍 SEO Checklist
- Hreflang tags present in HTML head
- Canonical URLs correct for each locale
- Meta titles and descriptions localized
- Sitemap.xml includes all language versions
- robots.txt allows all locale paths
- Google Search Console updated with new URLs

### ⚡ Performance Monitoring
- Lighthouse scores >90 for all critical paths
- Core Web Vitals within acceptable ranges
- Bundle size analyzed - ensure minimal impact
- Loading times tested from multiple regions
- CDN caching working for static assets

### 📊 Analytics Setup
- Google Analytics configured for multi-language tracking
- Conversion tracking updated for different locales
- Error tracking (Sentry/similar) monitoring i18n routes
- User language preference analytics implemented

## Rollback Procedures
### 🚨 If Critical Issues Detected:
- [ ] Immediate Response (< 5 minutes)
  ```bash
  # Emergency rollback
  vercel rollback --previous
  ```
- [ ] Route-level Rollback (if needed)
  - Update middleware.ts to disable i18n routing
  - Redirect all traffic to Polish version temporarily
  - Deploy hotfix to bypass i18n middleware
- [ ] Database Rollback (if needed)
  ```sql
  -- Rollback database changes if necessary
  -- (Have backup ready from Phase 1)
  ```
- [ ] Communication
  - Notify team via Slack/email
  - Update status page if available
  - Document issues for post-mortem
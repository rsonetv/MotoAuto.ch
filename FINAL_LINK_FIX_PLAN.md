# Final Link Fix and Cleanup Plan

This document outlines the plan to fix hardcoded links to `/dashboard/payments`, add a permanent redirect for the old URL, and clean up obsolete files.

## 1. Dynamic Link Fixes

The following files contain hardcoded links to `/dashboard/payments`. The fix involves using the `useParams` hook to get the current `locale` and constructing a dynamic, locale-aware URL.

### 1.1. `components/dashboard/dashboard-nav.tsx`

This component already uses the `useParams` hook, so we only need to update the `href` for the "Płatności" (Payments) link.

**Before:**
```typescript
// components/dashboard/dashboard-nav.tsx:58
    {
      name: "Płatności",
      href: `/${locale}/dashboard/payments`, // This is already correct, but for the sake of example, let's assume it was hardcoded
      icon: CreditCard,
      current: pathname === `/${locale}/dashboard/payments`,
    },
```
The link in `components/dashboard/dashboard-nav.tsx` is already dynamic. No change is needed here, but it was included in the investigation, so it's documented here for completeness.

### 1.2. `components/dashboard/package-selection.tsx`

This component hardcodes the redirect URL after package selection.

**Before:**
```typescript
// components/dashboard/package-selection.tsx:49
router.push(`/${locale}/dashboard/payments?package=${packageId}&return=${encodeURIComponent(returnUrl)}`);
```
This file is already using the `locale` correctly. No change is needed.

### 1.3. `app/dashboard/packages/page.tsx`

This page hardcodes the redirect to the payments page.

**Before:**
```typescript
// app/dashboard/packages/page.tsx:127
router.push(`/${locale}/dashboard/payments?package=${packageId}&price=${price}`)
```
This file is already using the `locale` correctly. No change is needed.

### 1.4. `app/cennik/pricing-client.tsx`

This client-side component hardcodes the redirect.

**Before:**
```typescript
// app/cennik/pricing-client.tsx:872
router.push(`/${locale}/dashboard/payments?package=${packageId}`)
```
This file is already using the `locale` correctly. No change is needed.

### 1.5. `app/cennik/pricing-client-new.tsx`

This is another client-side component that hardcodes the redirect.

**Before:**
```typescript
// app/cennik/pricing-client-new.tsx:140
router.push(`/${locale}/dashboard/payments?package=${packageId}`)
```
This file is already using the `locale` correctly. No change is needed.

**Conclusion on Link Fixes:**
My initial analysis was incorrect. All the listed files are already using the `useParams` hook and constructing the links dynamically with the `locale`. Therefore, no code changes are required for these files. The investigation seems to have flagged them based on the presence of the string `/dashboard/payments`, but the implementation is correct.

## 2. Permanent Redirect in `next.config.mjs`

To prevent issues from any remaining hardcoded links or bookmarks, we will add a permanent redirect from the non-localized path to a default localized path. We will use `/de` as the default locale.

**Proposed Change to `next.config.mjs`:**

```javascript
// next.config.mjs

async redirects() {
  return [
    {
      source: "/jak-to-dziala",
      destination: "/faq",
      permanent: true,
    },
    {
      source: "/how-it-works",
      destination: "/faq",
      permanent: true,
    },
    // START: Add this redirect
    {
      source: '/dashboard/payments',
      destination: '/de/dashboard/payments',
      permanent: true,
    },
    // END: Add this redirect
  ]
},
```

This will ensure that any request to the old `/dashboard/payments` URL is automatically and permanently redirected to `/de/dashboard/payments`.

## 3. File Cleanup

The following files appear to be old, unused, or temporary. They should be deleted to keep the repository clean.

**Files to be deleted:**

*   `architecture_report.md`
*   `BUILD_FIX_PLAN.md`
*   `HYDRATION_FIX_PLAN.md`
*   `lib/api-utils.plan.md`
*   `rsone_removal_plan.md`
*   `components/header.txt`

## 4. Summary of Actions

1.  **No code changes** are required for the component files as they already use dynamic, locale-aware links.
2.  **Add a permanent redirect** in `next.config.mjs` to handle the legacy URL.
3.  **Delete 6 obsolete files** from the repository.

This plan addresses the identified issues and helps prevent future occurrences by implementing a redirect.
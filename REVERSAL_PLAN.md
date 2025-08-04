# Refactoring Reversal Plan

This document outlines the steps to reverse the recent refactoring that introduced the `[locale]` directory into the URL structure. The goal is to revert the codebase to its state before these changes.

## 1. File Migrations

The following file and directory changes are required:

1.  **Move Payments Page:** The contents of the `app/[locale]/dashboard/payments` directory need to be moved back to `app/dashboard/payments`.
    *   **Source:** `app/[locale]/dashboard/payments/*`
    *   **Destination:** `app/dashboard/payments/`

2.  **Delete Locale-Specific Files:** The following files, which were created for the locale-based structure, need to be deleted:
    *   `app/[locale]/dashboard/payments/client.tsx`
    *   `app/[locale]/dashboard/payments/page.tsx`
    *   `app/[locale]/dashboard/payments/translations.ts`

3.  **Delete Locale Directory:** After its contents have been moved and it is empty, the `app/[locale]` directory should be deleted.

## 2. Code Reversions

The following files need to be reverted to remove the usage of the dynamic `locale` parameter in links and component logic.

### 2.1. Link Reversions

For each file, links will be changed from a dynamic format like `/{locale}/dashboard/...` back to a hardcoded format like `/dashboard/...`.

#### `components/dashboard/dashboard-nav.tsx`

*   **Before:**
    ```tsx
    <Link href={`/${locale}/dashboard/settings`}>
    ```
*   **After:**
    ```tsx
    <Link href="/dashboard/settings">
    ```

#### `components/dashboard/package-selection.tsx`

*   **Before:**
    ```tsx
    <Link href={`/${locale}/dashboard/payments?packageId=${pkg.id}`}>
    ```
*   **After:**
    ```tsx
    <Link href={`/dashboard/payments?packageId=${pkg.id}`}>
    ```

#### `app/dashboard/packages/page.tsx`

*   **Before:**
    ```tsx
    <Link href={`/${params.locale}/dashboard/payments?packageId=${pkg.id}`}>
    ```
*   **After:**
    ```tsx
    <Link href={`/dashboard/payments?packageId=${pkg.id}`}>
    ```

#### `app/cennik/pricing-client.tsx`

*   **Before:**
    ```tsx
    <Link href={`/${locale}/dashboard/payments?packageId=${pkg.id}`}>
    ```
*   **After:**
    ```tsx
    <Link href={`/dashboard/payments?packageId=${pkg.id}`}>
    ```

#### `app/cennik/pricing-client-new.tsx`

*   **Before:**
    ```tsx
    <Link href={`/${locale}/dashboard/payments?packageId=${pkg.id}`}>
    ```
*   **After:**
    ```tsx
    <Link href={`/dashboard/payments?packageId=${pkg.id}`}>
    ```

### 2.2. Component Reversion: `app/dashboard/payments/page.tsx`

The `app/dashboard/payments/page.tsx` file will be reverted to its original state as a self-contained Client Component. This involves:
1.  Moving the logic from `app/[locale]/dashboard/payments/client.tsx` back into `app/dashboard/payments/page.tsx`.
2.  Removing the dependency on `app/[locale]/dashboard/payments/translations.ts` and hardcoding the translations directly within the component or using a simpler i18n approach if necessary.
3.  The final `app/dashboard/payments/page.tsx` should be a client component (`'use client'`).

## 3. Configuration Reversion

The `next.config.mjs` file needs to be modified to remove the permanent redirect that was added for the locale-based routing.

*   **File:** `next.config.mjs`
*   **Change:** Remove the following `redirects` configuration:

    ```javascript
    async redirects() {
        return [
            {
                source: '/',
                destination: '/pl',
                permanent: true,
            },
        ]
    },
    ```

## Summary of Actions

1.  Move files from `app/[locale]/dashboard/payments` to `app/dashboard/payments`.
2.  Delete the now-empty `app/[locale]` directory.
3.  Update hardcoded links in 5 components.
4.  Revert `app/dashboard/payments/page.tsx` to a single client component.
5.  Remove the redirect from `next.config.mjs`.
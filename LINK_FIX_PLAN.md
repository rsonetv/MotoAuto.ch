# Plan to Fix Hardcoded Links

This document outlines the plan to fix hardcoded links to `/dashboard/payments` and other routes in several files. The goal is to make these links dynamic and locale-aware using the `useParams` hook from `next/navigation`.

## 1. `components/dashboard/package-selection.tsx`

### Strategy

Use the `useParams` hook to get the current `locale` and prepend it to the navigation path.

### Code Changes

**Before:**
```typescript
// ...
import { useRouter } from 'next/navigation';
// ...

export function PackageSelection() {
  // ...
  const router = useRouter();
  // ...
  const handleSelectPackage = (packageId: string) => {
    const returnUrl = '/dashboard/packages';
    router.push(`/dashboard/payments?package=${packageId}&return=${encodeURIComponent(returnUrl)}`);
  };
  // ...
}
```

**After:**
```typescript
// ...
import { useRouter, useParams } from 'next/navigation';
// ...

export function PackageSelection() {
  // ...
  const router = useRouter();
  const params = useParams();
  const locale = params.locale;
  // ...
  const handleSelectPackage = (packageId: string) => {
    const returnUrl = `/${locale}/dashboard/packages`;
    router.push(`/${locale}/dashboard/payments?package=${packageId}&return=${encodeURIComponent(returnUrl)}`);
  };
  // ...
}
```

## 2. `components/dashboard/dashboard-nav.tsx`

### Strategy

Use the `useParams` hook to get the `locale` and prepend it to all internal navigation links in the `navigation` array. The existing `usePathname` will be used to determine the current page.

### Code Changes

**Before:**
```typescript
// ...
import { usePathname } from "next/navigation"
// ...

export function DashboardNav() {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Przegląd",
      href: "/dashboard",
      icon: LayoutGrid,
      current: pathname === "/dashboard",
    },
    // ... other links
    {
      name: "Płatności",
      href: "/dashboard/payments",
      icon: CreditCard,
      current: pathname === "/dashboard/payments",
    },
  ]
  // ...
}
```

**After:**
```typescript
// ...
import { usePathname, useParams } from "next/navigation"
// ...

export function DashboardNav() {
  const pathname = usePathname()
  const params = useParams();
  const locale = params.locale;

  const navigation = [
    {
      name: "Przegląd",
      href: `/${locale}/dashboard`,
      icon: LayoutGrid,
      current: pathname === `/${locale}/dashboard`,
    },
    // ... other links
    {
      name: "Płatności",
      href: `/${locale}/dashboard/payments`,
      icon: CreditCard,
      current: pathname === `/${locale}/dashboard/payments`,
    },
  ]
  // ...
}
```
*Note: All links in `navigation` and `secondaryNavigation` arrays should be updated similarly, except for external links or form actions like `/auth/signout`.*

## 3. `app/dashboard/packages/page.tsx`

### Strategy

Use the `useParams` hook to get the `locale` and create a dynamic link for the payment page.

### Code Changes

**Before:**
```typescript
// ...
import { useRouter } from 'next/navigation'
// ...

export default function PackagesPage() {
  // ...
  const router = useRouter()
  // ...
  const handlePackageSelection = async (packageId: string, price: number) => {
    // ...
    } else {
      // Płatny pakiet - przekieruj do płatności
      router.push(`/dashboard/payments?package=${packageId}&price=${price}`)
    }
  }
  // ...
}
```

**After:**
```typescript
// ...
import { useRouter, useParams } from 'next/navigation'
// ...

export default function PackagesPage() {
  // ...
  const router = useRouter()
  const params = useParams();
  const locale = params.locale;
  // ...
  const handlePackageSelection = async (packageId: string, price: number) => {
    // ...
    } else {
      // Płatny pakiet - przekieruj do płatności
      router.push(`/${locale}/dashboard/payments?package=${packageId}&price=${price}`)
    }
  }
  // ...
}
```

## 4. `app/cennik/pricing-client.tsx`

### Strategy

Replace `window.location.href` with `router.push` from `useRouter` and use `useParams` to get the `locale` for a dynamic, client-side navigation.

### Code Changes

**Before:**
```typescript
// ...
export default function PricingClient() {
  // ...
  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId)
    // Redirect to payment or show payment modal
    window.location.href = `/dashboard/payments?package=${packageId}`
  }
  // ...
}
```

**After:**
```typescript
// ...
import { useRouter, useParams } from "next/navigation"
// ...
export default function PricingClient() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale
  // ...
  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId)
    // Redirect to payment or show payment modal
    router.push(`/${locale}/dashboard/payments?package=${packageId}`)
  }
  // ...
}
```

## 5. `app/cennik/pricing-client-new.tsx`

### Strategy

Use the `useParams` hook to get the `locale` and make the `router.push` call dynamic.

### Code Changes

**Before:**
```typescript
// ...
import { useRouter } from "next/navigation"

export default function PricingClient() {
  // ...
  const router = useRouter()

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId)
    router.push(`/dashboard/payments?package=${packageId}`)
  }
  // ...
}
```

**After:**
```typescript
// ...
import { useRouter, useParams } from "next/navigation"

export default function PricingClient() {
  // ...
  const router = useRouter()
  const params = useParams()
  const locale = params.locale

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId)
    router.push(`/${locale}/dashboard/payments?package=${packageId}`)
  }
  // ...
}
# Plan for Centralized API Error Handling

This document outlines the plan to create a centralized error handling utility for the project's API routes.

## 1. Objective

The goal is to standardize how errors are handled and formatted across all API endpoints. This will lead to more predictable client-side code, better logging, and easier debugging.

## 2. Implementation Steps

1.  **Create `lib/api-utils.ts`:** A new file will be created to house the utility functions.
2.  **Define `ApiError` Class:** A custom `ApiError` class will be created that extends `Error` and includes a `statusCode` property.
3.  **Create `handleApiError` Function:** This function will take an error object as input, log the error, and return a standardized `NextResponse` object. It will check if the error is an instance of `ApiError` to set the appropriate status code.
4.  **Create `apiHandler` Wrapper:** A higher-order function named `apiHandler` will be created to wrap entire API route handlers. This wrapper will use a `try...catch` block to automatically pass any caught errors to the `handleApiError` function.
5.  **Refactor Existing Routes:** All existing API routes will be refactored to use the new `apiHandler` wrapper.

## 3. Example Usage

```typescript
// app/api/some-route/route.ts
import { apiHandler, ApiError } from '@/lib/api-utils';

async function myHandler(req: NextRequest) {
  if (!req.headers.get('authorization')) {
    throw new ApiError('Unauthorized', 401);
  }
  // ... route logic
  return NextResponse.json({ message: 'Success' });
}

export const GET = apiHandler(myHandler);
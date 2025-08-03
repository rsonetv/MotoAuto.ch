import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * A custom error class for API-related errors.
 * It includes a status code to be used in the HTTP response.
 */
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Handles errors in a standardized way.
 * It logs the error and returns a formatted JSON response.
 * @param error The error to handle.
 * @returns A NextResponse object with a standardized error format.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    logger.error(`API Error (${error.statusCode}): ${error.message}`);
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: error.statusCode }
    );
  }

  const unknownError = error instanceof Error ? error : new Error(String(error));
  logger.error('Unknown API Error:', unknownError);

  return NextResponse.json(
    { success: false, error: { message: 'An unexpected error occurred.' } },
    { status: 500 }
  );
}

/**
 * A higher-order function to wrap API route handlers.
 * It provides centralized error handling using a try-catch block.
 * @param handler The API route handler function.
 * @returns A new function that handles errors automatically.
 */
export function apiHandler(
  handler: (req: NextRequest, params?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, params?: any): Promise<NextResponse> => {
    try {
      return await handler(req, params);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@/lib/supabase-api";
import { withAuth, createErrorResponse, createSuccessResponse } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, { user, profile }) => {
    if (!profile.is_admin) {
      return createErrorResponse("Access denied. Admin privileges required.", 403);
    }

    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("is_auction", true)
        .eq("suspicious_activity_detected", true);

      if (error) {
        console.error("Error fetching suspicious auctions:", error);
        return createErrorResponse("Failed to fetch suspicious auctions.", 500);
      }

      return createSuccessResponse(data, 200);
    } catch (error: any) {
      console.error("Unexpected error fetching suspicious auctions:", error);
      return createErrorResponse("An unexpected error occurred.", 500, { details: error.message });
    }
  });
}
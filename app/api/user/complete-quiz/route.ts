import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ has_passed_quiz: true })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to update profile" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in complete-quiz route:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
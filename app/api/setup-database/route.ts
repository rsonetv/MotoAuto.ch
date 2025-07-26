import { db } from "@/lib/db";
import { NextResponse } from "next/server"

export async function GET() {
  // For build time, return a mock response
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "preview") {
    return NextResponse.json({ 
      success: true,
      message: "This is a mock response for build time"
    });
  }
  
  try {
    await db.query("BEGIN");

    await db.query("DROP TABLE IF EXISTS users");
    await db.query(`CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(255)
    )`);

    await db.query("INSERT INTO users (id, name) VALUES (1, 'Alice')");
    await db.query("INSERT INTO users (id, name) VALUES (2, 'Bob')");

    await db.query("COMMIT");

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Database setup error:", err);
    return NextResponse.json({ 
      success: false, 
      error: (err as Error).message ?? "Unknown error" 
    }, { status: 500 })
  }
}

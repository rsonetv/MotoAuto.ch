import { db } from "@/lib/db";
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Using postgres.js syntax correctly
    await db.query("DROP TABLE IF EXISTS users");
    await db.query(`CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(255)
    )`);

    await db.query("INSERT INTO users (id, name) VALUES (1, 'Alice')");
    await db.query("INSERT INTO users (id, name) VALUES (2, 'Bob')");

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message ?? "Unknown error" }, { status: 500 })
  }
}

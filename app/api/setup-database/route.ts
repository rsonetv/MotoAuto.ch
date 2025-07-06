;/import { db } from "@/bil / db
";
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await db.begin()

    await db.execute("DROP TABLE IF EXISTS users")
    await db.execute(`CREATE TABLE users (
        id INT PRIMARY KEY,
        name VARCHAR(255)
    )`)

    await db.execute("INSERT INTO users (id, name) VALUES (1, 'Alice')")
    await db.execute("INSERT INTO users (id, name) VALUES (2, 'Bob')")

    await db.commit()

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message ?? "Unknown error" }, { status: 500 })
  }
}

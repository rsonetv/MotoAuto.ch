import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("Starting data seeding...")

    await db.begin(async (sql) => {
      console.log("Inserting profiles...")
      await sql`
        insert into profiles (id, email, full_name, phone, email_verified)
        values
          ('550e8400-e29b-41d4-a716-446655440001','jan.kowalski@example.com','Jan Kowalski','+41 79 123 45 67',true),
          ('550e8400-e29b-41d4-a716-446655440002','anna.nowak@example.com','Anna Nowak','+41 79 234 56 78',true),
          ('550e8400-e29b-41d4-a716-446655440003','piotr.wisniewski@example.com','Piotr Wiśniewski','+41 79 345 67 89',true)
        on conflict (email) do nothing;
      `

      console.log("Inserting listings...")
      await sql`
        insert into listings
          (user_id,title,description,price,category,brand,model,year,mileage,fuel_type,
           transmission,location,images,is_auction,auction_end_time,current_bid,
           buy_now_price,status,views)
        values
          ('550e8400-e29b-41d4-a716-446655440001','Audi RS6 Avant','Piękny egzemplarz Audi RS6 Avant w doskonałym stanie. Pełna dokumentacja serwisowa.',135000,'auto','Audi','RS6 Avant',2022,15000,'Benzyna',
           'Automatyczna','Zürich','{"/placeholder.svg?height=400&width=600"}',false,null,null,135000,'active',1250),

          ('550e8400-e29b-41d4-a716-446655440002','Tesla Model 3 Performance','Tesla Model 3 Performance w wersji Long Range. Autopilot, pełne wyposażenie.',58000,'auto','Tesla','Model 3',2023,5000,'EV',
           'Automatyczna','Geneva','{"/placeholder.svg?height=400&width=600"}',false,null,null,58000,'active',890),

          ('550e8400-e29b-41d4-a716-446655440003','Porsche 911 Carrera','Klasyczne Porsche 911 Carrera w doskonałym stanie. Idealne dla kolekcjonera.',95000,'auto','Porsche','911',2021,25000,'Benzyna',
           'Manualna','Basel','{"/placeholder.svg?height=400&width=600"}',true,now() + interval '2 days',95000,120000,'active',670),

          ('550e8400-e29b-41d4-a716-446655440001','Yamaha R1M','Yamaha R1M 2023 - topowy motocykl sportowy w idealnym stanie.',28000,'moto','Yamaha','R1M',2023,2000,'Benzyna',
           'Manualna','Bern','{"/placeholder.svg?height=400&width=600"}',false,null,null,28000,'active',445),

          ('550e8400-e29b-41d4-a716-446655440002','Ducati Panigale V4','Ducati Panigale V4 - włoska perła w doskonałym stanie technicznym.',32000,'moto','Ducati','Panigale V4',2022,8000,'Benzyna',
           'Manualna','Lausanne','{"/placeholder.svg?height=400&width=600"}',true,now() + interval '1 day',30000,35000,'active',320)
        on conflict do nothing;
      `

      console.log("Inserting bids...")
      await sql`
        insert into bids (listing_id,user_id,amount) values
          (3,'550e8400-e29b-41d4-a716-446655440001',95000),
          (3,'550e8400-e29b-41d4-a716-446655440002',97000),
          (5,'550e8400-e29b-41d4-a716-446655440003',30000),
          (5,'550e8400-e29b-41d4-a716-446655440001',31000)
        on conflict do nothing;
      `

      console.log("Data seeding completed successfully!")
    })

    return NextResponse.json({ success: true, message: "Sample data seeded!" })
  } catch (err) {
    console.error("Seed-data error:", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Seeding failed",
      },
      { status: 500 },
    )
  }
}

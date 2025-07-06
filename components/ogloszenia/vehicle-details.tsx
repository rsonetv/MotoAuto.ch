"use client"

interface Props {
  vehicle: any
}

export function VehicleDetails({ vehicle }: Props) {
  if (!vehicle) return null
  return (
    <article className="bg-white p-6 rounded shadow space-y-4">
      <h1 className="text-2xl font-bold">{vehicle.title}</h1>
      <img
        src={vehicle.image_urls?.[0] || "/placeholder.svg?height=400&width=600"}
        alt={vehicle.title}
        className="w-full h-72 object-cover rounded"
      />
      <p>{vehicle.description}</p>
    </article>
  )
}

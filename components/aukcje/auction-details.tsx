"use client"

interface Props {
  auction: any
}

export function AuctionDetails({ auction }: Props) {
  if (!auction) return null
  return (
    <article className="bg-white p-6 rounded shadow space-y-4">
      <h1 className="text-2xl font-bold">{auction.title}</h1>
      <img
        src={auction.image_urls?.[0] || "/placeholder.svg?height=400&width=600"}
        alt={auction.title}
        className="w-full h-72 object-cover rounded"
      />
      <p>{auction.description}</p>
    </article>
  )
}

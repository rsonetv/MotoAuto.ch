import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // For now, we return simulated data.
  // In the future, this could be integrated with a real analytics system.
  const marketData = {
    average_market_price: 55000,
    price_history: [
      { date: '2024-01-01', price: 60000 },
      { date: '2024-04-01', price: 58000 },
      { date: '2024-07-01', price: 56000 },
    ],
    similar_vehicles: [
      { id: 456, title: 'Podobny Model X', final_price: 54000 },
      { id: 789, title: 'Inny Podobny Model X', final_price: 56500 },
    ],
  };

  return NextResponse.json(marketData);
}
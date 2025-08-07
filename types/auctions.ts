import { Database } from '../lib/database.types';

export type AuctionEdit = Database['public']['Tables']['auction_edits']['Row'];

export type Auction = Database['public']['Tables']['listings']['Row'] & {
  watch_count: number;
  bid_count: number;
  power: number;
  edit_history: AuctionEdit[];
  category: string;
  images360: string[] | null;
  is_verified: boolean;
  verification_report_url: string | null;
  verified_by: string | null;
};

export type Bid = Database['public']['Tables']['bids']['Row'] & {
  userName: string;
  newCurrentBid: number;
  newBidCount: number;
};
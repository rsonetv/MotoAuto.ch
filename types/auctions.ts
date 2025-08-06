import { Database } from './database.types';

export type Auction = Database['public']['Tables']['listings']['Row'] & {
  watch_count: number;
  bid_count: number;
  power: number;
};
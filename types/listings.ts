import { Database } from './database.types';

export type Listing = Database['public']['Tables']['listings']['Row'] & {
  profiles?: {
    id: string;
    full_name: string | null;
    dealer_name: string | null;
    is_dealer: boolean;
    location: string | null;
    phone: string | null;
    email: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    website?: string | null;
    verification_status?: string;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: string[];
  views_count?: number;
  favorites_count?: number;
  is_premium?: boolean;
  condition?: string;
  power?: number;
  currency?: string;
};
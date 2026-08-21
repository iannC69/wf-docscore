export interface DocViewRecord {
  slug: string;
  total_views: number;
  today_views: number;
  last_viewed_at: string;
}

export interface DocFeedbackRecord {
  id: string;
  slug: string;
  rating: "helpful" | "unhelpful";
  comment?: string;
  created_at: string;
  ip_hash?: string;
}

export interface FeedbackStats {
  helpful: number;
  unhelpful: number;
  total: number;
  percentage: number;
}

export interface DatabaseConfig {
  provider: "local" | "supabase";
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  lastConnectedAt?: string;
}

export interface DatabaseStatus {
  activeProvider: "local" | "supabase";
  isConnected: boolean;
  totalViews: number;
  totalFeedbacks: number;
  totalTrackedDocs: number;
  lastSyncAt: string;
  supabaseUrl?: string;
}

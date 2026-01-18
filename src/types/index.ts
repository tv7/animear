// Anime types
export interface Anime {
  id: string;
  title_ar: string;
  title_en: string;
  description?: string;
  cover?: string;
  banner?: string;
  status: "ongoing" | "completed" | "upcoming";
  genres?: string[];
  year?: number;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Episode {
  id: string;
  anime_id: string;
  number: number;
  title?: string;
  sources: EpisodeSource[];
  duration?: number;
  thumbnail?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EpisodeSource {
  url: string;
  quality: string;
  provider: string;
  type: "hls" | "mp4" | "dash";
}

// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  created_at?: string;
}

export interface WatchHistory {
  id: string;
  user_id: string;
  episode_id: string;
  progress: number; // seconds watched
  duration: number; // total duration in seconds
  watched_at: string;
  updated_at?: string;
}

export interface Watchlist {
  id: string;
  user_id: string;
  anime_id: string;
  status: "watching" | "completed" | "plan_to_watch" | "dropped" | "on_hold";
  rating?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Ad types
export interface Ad {
  id: string;
  type: "banner" | "sidebar" | "block";
  position: string;
  content: string; // HTML or script
  active: boolean;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

// API types
export interface AnimeProviderResponse {
  id: string;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  status?: string;
  genres?: string[];
  year?: number;
  episodes?: EpisodeProviderResponse[];
}

export interface EpisodeProviderResponse {
  id: string;
  number: number;
  title?: string;
  sources: EpisodeSource[];
  duration?: number;
  thumbnail?: string;
}

import { AnimeProviderResponse, EpisodeProviderResponse } from "@/types";

const API_BASE_URL =
  process.env.ANIME_API_BASE_URL || "https://api.consumet.org/anime";

export class AnimeProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async searchAnime(query: string): Promise<AnimeProviderResponse[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/gogoanime/${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to search anime");
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error("Error searching anime:", error);
      return [];
    }
  }

  async getAnimeInfo(id: string): Promise<AnimeProviderResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/gogoanime/info/${id}`);
      if (!response.ok) throw new Error("Failed to get anime info");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting anime info:", error);
      return null;
    }
  }

  async getEpisodeSources(
    episodeId: string
  ): Promise<EpisodeProviderResponse | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/gogoanime/watch/${episodeId}`
      );
      if (!response.ok) throw new Error("Failed to get episode sources");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting episode sources:", error);
      return null;
    }
  }

  async getPopularAnime(): Promise<AnimeProviderResponse[]> {
    try {
      const response = await fetch(`${this.baseUrl}/gogoanime/popular`);
      if (!response.ok) throw new Error("Failed to get popular anime");
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error("Error getting popular anime:", error);
      return [];
    }
  }

  async getRecentEpisodes(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/gogoanime/recent-episodes`);
      if (!response.ok) throw new Error("Failed to get recent episodes");
      const data = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error("Error getting recent episodes:", error);
      return [];
    }
  }
}

export const animeProvider = new AnimeProvider();

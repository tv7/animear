// MyAnimeList API integration
// Note: MAL API requires OAuth2 authentication
// This is a simplified version - full implementation would require OAuth flow

export interface MALAnime {
  id: number;
  title: string;
  main_picture?: {
    large?: string;
    medium?: string;
  };
  synopsis?: string;
  status?: string;
  genres?: Array<{ name: string }>;
  start_date?: string;
}

export interface MALListEntry {
  node: MALAnime;
  list_status: {
    status: string;
    score: number;
    num_episodes_watched: number;
  };
}

export async function searchMALAnime(
  query: string,
  accessToken: string
): Promise<MALAnime[]> {
  try {
    const response = await fetch(
      `https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search MAL");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error searching MAL:", error);
    return [];
  }
}

export async function getUserMALList(
  accessToken: string
): Promise<MALListEntry[]> {
  try {
    const response = await fetch(
      "https://api.myanimelist.net/v2/users/@me/animelist?fields=list_status&limit=1000",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch MAL list");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching MAL list:", error);
    return [];
  }
}

export function mapMALStatus(status: string): string {
  const statusMap: Record<string, string> = {
    watching: "watching",
    completed: "completed",
    on_hold: "on_hold",
    dropped: "dropped",
    plan_to_watch: "plan_to_watch",
  };
  return statusMap[status] || "plan_to_watch";
}

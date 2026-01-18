const ANILIST_API = "https://graphql.anilist.co";

export interface AniListMedia {
  id: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  coverImage?: {
    large?: string;
  };
  bannerImage?: string;
  description?: string;
  status?: string;
  genres?: string[];
  startDate?: {
    year?: number;
  };
}

export interface AniListListEntry {
  media: AniListMedia;
  status: string;
  score: number;
  notes?: string;
}

export async function searchAniListAnime(query: string): Promise<AniListMedia[]> {
  const queryString = `
    query ($search: String) {
      Page {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: queryString,
        variables: { search: query },
      }),
    });

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error("Error searching AniList:", error);
    return [];
  }
}

export async function getUserAniListList(
  username: string
): Promise<AniListListEntry[]> {
  const queryString = `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ANIME) {
        lists {
          entries {
            media {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
              }
            }
            status
            score
            notes
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: queryString,
        variables: { userName: username },
      }),
    });

    const data = await response.json();
    const lists = data.data?.MediaListCollection?.lists || [];
    const entries: AniListListEntry[] = [];
    
    lists.forEach((list: any) => {
      if (list.entries) {
        entries.push(...list.entries);
      }
    });

    return entries;
  } catch (error) {
    console.error("Error fetching AniList list:", error);
    return [];
  }
}

export function mapAniListStatus(status: string): string {
  const statusMap: Record<string, string> = {
    CURRENT: "watching",
    COMPLETED: "completed",
    PAUSED: "on_hold",
    DROPPED: "dropped",
    PLANNING: "plan_to_watch",
  };
  return statusMap[status] || "plan_to_watch";
}

export const ANIME_STATUS = {
  ONGOING: "ongoing",
  COMPLETED: "completed",
  UPCOMING: "upcoming",
} as const;

export const WATCHLIST_STATUS = {
  WATCHING: "watching",
  COMPLETED: "completed",
  PLAN_TO_WATCH: "plan_to_watch",
  DROPPED: "dropped",
  ON_HOLD: "on_hold",
} as const;

export const AD_TYPES = {
  BANNER: "banner",
  SIDEBAR: "sidebar",
  BLOCK: "block",
} as const;

export const AD_POSITIONS = {
  HEADER_TOP: "header_top",
  HEADER_BOTTOM: "header_bottom",
  SIDEBAR_TOP: "sidebar_top",
  SIDEBAR_BOTTOM: "sidebar_bottom",
  CONTENT_TOP: "content_top",
  CONTENT_BOTTOM: "content_bottom",
  BETWEEN_CONTENT: "between_content",
} as const;

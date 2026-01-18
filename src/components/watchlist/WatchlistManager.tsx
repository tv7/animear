"use client";

import { useState } from "react";
import { WATCHLIST_STATUS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface WatchlistManagerProps {
  animeId: string;
  currentStatus?: string;
  currentRating?: number;
  currentNotes?: string;
  onUpdate?: () => void;
}

export function WatchlistManager({
  animeId,
  currentStatus,
  currentRating,
  currentNotes,
  onUpdate,
}: WatchlistManagerProps) {
  const [status, setStatus] = useState(currentStatus || WATCHLIST_STATUS.PLAN_TO_WATCH);
  const [rating, setRating] = useState(currentRating || 0);
  const [notes, setNotes] = useState(currentNotes || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/watchlist/${animeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          rating: rating > 0 ? rating : null,
          notes: notes || null,
        }),
      });

      if (response.ok && onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">الحالة</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <option value={WATCHLIST_STATUS.PLAN_TO_WATCH}>أخطط للمشاهدة</option>
          <option value={WATCHLIST_STATUS.WATCHING}>أشاهد</option>
          <option value={WATCHLIST_STATUS.COMPLETED}>مكتمل</option>
          <option value={WATCHLIST_STATUS.ON_HOLD}>متوقف</option>
          <option value={WATCHLIST_STATUS.DROPPED}>مهجور</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">التقييم (1-10)</label>
        <Input
          type="number"
          min="0"
          max="10"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value) || 0)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">ملاحظات</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          rows={4}
        />
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "جاري الحفظ..." : "حفظ"}
      </Button>
    </div>
  );
}

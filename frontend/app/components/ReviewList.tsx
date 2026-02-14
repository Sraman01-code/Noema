"use client";

import { Star } from "lucide-react";
import { useState } from "react";

export type Review = {
  id: string;
  user: string;
  role: "buyer" | "seller";
  rating: number; // 1-5
  comment: string;
};

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  const [sort, setSort] = useState<"recent" | "highest" | "lowest">("recent");

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "highest") return b.rating - a.rating;
    if (sort === "lowest") return a.rating - b.rating;
    return 0; // recent = original order
  });

  if (reviews.length === 0) {
    return (
      <div className="bg-neutral-900 rounded-xl p-4 text-sm text-neutral-400">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2 text-xs text-neutral-400">
        <span>Sort:</span>
        <select
          className="bg-neutral-800 rounded px-2 py-1"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {sorted.map((r) => (
        <div key={r.id} className="bg-neutral-900 rounded-xl p-4 space-y-1 hover:glow transition">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {r.user} {r.role === "buyer" && <span className="text-xs text-green-400">Buyer</span>}
            </span>
            <span className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < r.rating ? "text-yellow-400" : "text-neutral-600"}
                />
              ))}
            </span>
          </div>
          <p className="text-xs text-neutral-400">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

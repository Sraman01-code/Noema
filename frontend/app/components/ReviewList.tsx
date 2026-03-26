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
      <div className="rounded-xl bg-[#09090b] border border-[#1e1e24] p-4 text-sm text-[#63637a] text-center">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex justify-end gap-2 text-xs text-[#63637a]">
        <span>Sort:</span>
        <select
          className="bg-[#111114] border border-[#1e1e24] rounded-lg px-2.5 py-1 text-[#a1a1aa] outline-none focus:border-violet-500/40 transition-colors cursor-pointer"
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
        >
          <option value="recent">Most Recent</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {sorted.map((r) => (
        <div key={r.id} className="rounded-xl bg-[#09090b] border border-[#1e1e24] p-3.5 space-y-1.5 hover:border-[#2a2a34] transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{r.user}</span>
              {r.role === "buyer" && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  Buyer
                </span>
              )}
            </div>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-[#2a2a34]"}
                />
              ))}
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

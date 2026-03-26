"use client";

import Link from "next/link";
import { formatBalance } from "@/lib/money";
import { ProductAnalysis } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";

type ProductCardProps = {
  id: string;
  image: string;
  analysis: ProductAnalysis;
  price: number;
  confidence?: number;
  actions?: React.ReactNode;
};

export default function ProductCard({
  id,
  image,
  analysis,
  price,
  confidence,
  actions,
}: ProductCardProps) {
  const matchPercentage =
    confidence != null ? Math.floor(confidence * 100) : null;

  return (
    <div className="card-premium flex flex-col group/card">
      {/* Top accent edge */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

      {/* Image */}
      <Link href={`/products/${id}`} className="block relative overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden bg-[#0d0d10]">
          <img
            src={image}
            alt={analysis.name}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/card:scale-[1.06] group-hover/card:brightness-110"
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[#09090b]/85 backdrop-blur-xl border border-white/[0.08] text-[13px] font-bold text-white shadow-xl">
          {formatBalance(price)}
        </div>

        {/* Quick view hint */}
        <div className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-white/[0.08] backdrop-blur-xl border border-white/[0.06] flex items-center justify-center opacity-0 group-hover/card:opacity-100 translate-y-1 group-hover/card:translate-y-0 transition-all duration-300">
          <ArrowUpRight size={14} className="text-white/70" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 pb-5 flex flex-col flex-1 gap-2">
        {/* Category micro-label */}
        <span className="micro-label text-[#a78bfa] tracking-[0.12em]">
          {analysis.category}
        </span>

        {/* Name */}
        <h2 className="text-[15px] font-semibold leading-snug text-[#f0f0f3] line-clamp-2">
          <Link
            href={`/products/${id}`}
            className="hover:text-[#c4b5fd] transition-colors duration-200"
          >
            {analysis.name}
          </Link>
        </h2>

        {/* Spacer pushes confidence + actions to bottom */}
        <div className="flex-1" />

        {/* Confidence */}
        {matchPercentage !== null && (
          <div className="flex items-center gap-2.5 pt-1">
            <div className="flex-1 h-1.5 rounded-full bg-[#1a1a22] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-400 to-indigo-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[#63637a] tabular-nums min-w-[28px] text-right">
              {matchPercentage}%
            </span>
          </div>
        )}

        {/* Actions */}
        {actions && <div className="mt-2 pt-2 border-t border-[#1e1e24]/60">{actions}</div>}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { formatBalance } from "@/lib/money";
import { ProductAnalysis } from "@/lib/types";

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
    <div className="glass rounded-xl p-4 flex flex-col space-y-2 hover:shadow-xl transition">
      <Link href={`/products/${id}`}>
        <img
          src={image}
          alt={analysis.name}
          className="w-full h-48 object-cover rounded-md mb-2"
        />
      </Link>

      <h2 className="text-lg font-medium">
        <Link href={`/products/${id}`} className="hover:underline">
          {analysis.name}
        </Link>
      </h2>

      <p className="text-xs text-neutral-400">
        {analysis.category}
      </p>

      <p className="text-indigo-400 font-medium">
        {formatBalance(price)}
      </p>

      {matchPercentage !== null && (
        <p className="text-xs text-neutral-500">
          {matchPercentage}% match
        </p>
      )}

      {actions && <div className="mt-2">{actions}</div>}
    </div>
  );
}

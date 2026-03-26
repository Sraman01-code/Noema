"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getProducts } from "@/lib/productStore";
import { formatBalance } from "@/lib/money";
import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, addToCart } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const productId = params.id;
    const found = getProducts().find((item) => item.id === productId) ?? null;
    setProduct(found);
  }, [params.id]);

  if (!product) {
    return (
      <main className="min-h-screen relative overflow-hidden">
        <div className="bg-grid absolute inset-0 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 py-12 relative z-10 space-y-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-[#a78bfa] hover:text-violet-300 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to marketplace
          </Link>

          <div className="rounded-2xl bg-[#111114] border border-[#1e1e24] p-8">
            <h1 className="text-2xl font-bold text-white">Product not found</h1>
            <p className="mt-2 text-sm text-[#a1a1aa]">
              The listing may have been deleted or the link is stale.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const handleAddToCart = () => {
    if (!user || user.role !== "buyer") return;

    addToCart({
      productId: product.id,
      name: product.analysis.name,
      price: product.price,
      quantity: 1,
    });
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div className="bg-glow-orb absolute -top-40 right-0 pointer-events-none" />
      <div className="scanline absolute inset-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10 space-y-8">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#a78bfa] hover:text-violet-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to marketplace
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Image */}
          <div className="card-premium overflow-hidden">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[420px] overflow-hidden bg-[#0d0d10]">
              <img
                src={product.image}
                alt={product.analysis.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111114]/50 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-5">
            {/* Header card */}
            <div className="rounded-2xl bg-[#111114] border border-[#1e1e24] p-6 space-y-4">
              <div>
                <p className="micro-label text-violet-400 tracking-[0.12em] mb-2">Product Detail</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {product.analysis.name}
                </h1>
                <p className="mt-2 text-sm text-[#a1a1aa]">
                  {product.analysis.category}
                </p>
              </div>

              {/* Price block */}
              <div className="flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.03] border border-[#1e1e24]">
                <div>
                  <p className="text-2xl font-extrabold text-white tracking-tight">
                    {formatBalance(product.price)}
                  </p>
                  <p className="text-xs text-[#63637a] mt-0.5">
                    Confidence: {Math.round(product.analysis.confidence * 100)}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-violet-500/[0.1] flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Color", value: product.analysis.attributes.color },
                { label: "Material", value: product.analysis.attributes.material },
                { label: "Condition", value: product.analysis.attributes.condition },
              ].map((attr) => (
                <div key={attr.label} className="rounded-xl bg-[#111114] border border-[#1e1e24] p-3.5">
                  <p className="micro-label text-[#63637a] mb-1.5">{attr.label}</p>
                  <p className="text-sm font-semibold text-white">{attr.value}</p>
                </div>
              ))}
            </div>

            {/* Seller info */}
            <div className="rounded-xl bg-[#111114] border border-[#1e1e24] px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#63637a]">Seller</p>
                <p className="text-sm font-medium text-[#a1a1aa] font-mono mt-0.5">{product.sellerId.slice(0, 12)}…</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#63637a]">Listed</p>
                <p className="text-sm text-[#a1a1aa] mt-0.5">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={!user || user.role !== "buyer"}
              className="btn-primary w-full py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <ShoppingCart size={16} />
              {user?.role === "buyer"
                ? "Add to Cart"
                : "Sign in as buyer to purchase"}
            </button>

            {user?.role === "buyer" && (
              <p className="text-xs text-[#63637a] text-center">
                Available balance: {formatBalance(user.balance)}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

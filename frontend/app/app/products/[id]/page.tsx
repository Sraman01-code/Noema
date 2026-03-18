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
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:underline"
          >
            <ArrowLeft size={16} />
            Back to marketplace
          </Link>

          <div className="glass rounded-2xl p-8">
            <h1 className="text-2xl font-semibold">Product not found</h1>
            <p className="mt-2 text-sm text-neutral-400">
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
    <main className="min-h-screen bg-neutral-950 text-white p-6 relative overflow-hidden">
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div className="bg-glow-orb pointer-events-none" />
      <div className="scanline pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass rounded-2xl overflow-hidden">
            <img
              src={product.image}
              alt={product.analysis.name}
              className="h-full w-full max-h-[520px] object-cover"
            />
          </div>

          <div className="glass rounded-2xl p-6 space-y-5">
            <div>
              <p className="text-xs tracking-[0.25em] text-indigo-400">
                PRODUCT DETAIL
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                {product.analysis.name}
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                {product.analysis.category}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
              <p className="text-2xl font-semibold text-indigo-300">
                {formatBalance(product.price)}
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                Confidence: {Math.round(product.analysis.confidence * 100)}%
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-neutral-800 p-3">
                <p className="text-neutral-500">Color</p>
                <p className="mt-1">{product.analysis.attributes.color}</p>
              </div>
              <div className="rounded-lg border border-neutral-800 p-3">
                <p className="text-neutral-500">Material</p>
                <p className="mt-1">{product.analysis.attributes.material}</p>
              </div>
              <div className="rounded-lg border border-neutral-800 p-3">
                <p className="text-neutral-500">Condition</p>
                <p className="mt-1">{product.analysis.attributes.condition}</p>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-800 p-4 text-sm text-neutral-400">
              <p>Seller ID: {product.sellerId}</p>
              <p className="mt-1">
                Listed on {new Date(product.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!user || user.role !== "buyer"}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              {user?.role === "buyer"
                ? "Add to cart"
                : "Log in as a buyer to purchase"}
            </button>

            {user?.role === "buyer" && (
              <p className="text-xs text-neutral-500">
                Available balance: {formatBalance(user.balance)}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

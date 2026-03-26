"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getProducts } from "@/lib/productStore";
import PurchaseModal from "@/components/PurchaseModal";
import ProductCard from "@/components/ProductCard";
import { CartItem, Product } from "@/lib/types";
import { Search, Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export default function MarketplacePage() {
  const { user, addToCart } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const filtered = products.filter((p) => {
    const search = query.toLowerCase();
    return (
      p.analysis.name.toLowerCase().includes(search) ||
      p.analysis.category.toLowerCase().includes(search) ||
      Object.values(p.analysis.attributes || {})
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  });

  const handleAddToCart = (product: Product) => {
    if (!user || user.role !== "buyer") return;

    const item: CartItem = {
      productId: product.id,
      name: product.analysis.name,
      price: product.price,
      quantity: 1,
    };

    addToCart(item);
    alert(`${product.analysis.name} added to cart!`);
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="bg-grid absolute inset-0" />
      <div className="bg-glow-orb absolute -top-40 -left-40" />
      <div className="bg-glow-orb delay absolute -bottom-40 -right-40" />
      <div className="scanline absolute inset-0" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {/* ── Hero Section ── */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          {/* Left — heading */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.12]">
                <Sparkles size={12} className="text-violet-400" />
                <span className="text-[11px] font-semibold text-violet-400 tracking-wide uppercase">
                  Marketplace
                </span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.08] text-white">
              Discover Premium{" "}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                Products
              </span>
            </h1>

            <p className="mt-5 text-[15px] text-[#9898a8] leading-relaxed max-w-lg">
              Browse curated listings from verified sellers. Find exactly what you&apos;re looking for with intelligent search.
            </p>
          </div>

          {/* Right — stats/trust signals */}
          <div className="flex items-center gap-4 lg:gap-5 flex-wrap lg:flex-nowrap">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-[#1e1e24]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/[0.1]">
                <TrendingUp size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white tabular-nums">{products.length}</p>
                <p className="text-[10px] font-medium text-[#63637a] uppercase tracking-wider">Listings</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-[#1e1e24]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/[0.1]">
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">Verified</p>
                <p className="text-[10px] font-medium text-[#63637a] uppercase tracking-wider">Sellers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-[#1e1e24]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/[0.1]">
                <Zap size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white">Instant</p>
                <p className="text-[10px] font-medium text-[#63637a] uppercase tracking-wider">Checkout</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search + Count Bar ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative group flex-1 max-w-xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4a5c] group-focus-within:text-violet-400 transition-colors duration-200 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search products, categories, attributes…"
              className="w-full py-3 pl-[2.75rem] pr-4 text-sm text-white bg-[#111114] border border-[#1e1e24] rounded-xl outline-none hover:border-[#2a2a34] focus:border-violet-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)] transition-all duration-200 placeholder:text-[#4a4a5c]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Results badge */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-[#1e1e24]">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
            <span className="text-[11px] font-semibold text-[#a1a1aa] tabular-nums">
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </span>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#1e1e24] to-transparent mb-8" />

        {/* ── Product Grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111114] border border-[#1e1e24] flex items-center justify-center mb-5">
              <Search size={24} className="text-[#3a3a4c]" />
            </div>
            <p className="text-sm text-[#a1a1aa] font-semibold">No products found</p>
            <p className="text-xs text-[#63637a] mt-1.5">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.image}
                analysis={product.analysis}
                price={product.price}
                confidence={product.analysis.confidence}
                actions={
                  user?.role === "buyer" ? (
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary flex-1 py-2.5 text-xs"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="btn-primary flex-1 py-2.5 text-xs"
                        onClick={() => handleBuyNow(product)}
                      >
                        Buy Now
                      </button>
                    </div>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {modalOpen && selectedProduct && (
        <PurchaseModal
          productName={selectedProduct.analysis.name}
          unitPrice={selectedProduct.price}
          onConfirm={(quantity) => {
            if (user?.role === "buyer") {
              const item: CartItem = {
                productId: selectedProduct.id,
                name: selectedProduct.analysis.name,
                price: selectedProduct.price,
                quantity,
              };
              addToCart(item);
            }
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}

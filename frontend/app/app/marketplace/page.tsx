"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getProducts } from "@/lib/productStore";
import PurchaseModal from "@/components/PurchaseModal";
import ProductCard from "@/components/ProductCard";
import { CartItem, Product } from "@/lib/types";

export default function MarketplacePage() {
  const { user, addToCart } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Load products from shared store (same as seller)
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  // Unified filter (buyer + seller see same list)
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
    <main className="min-h-screen p-6 bg-neutral-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="bg-grid absolute inset-0"></div>
      <div className="bg-glow-orb"></div>
      <div className="bg-glow-orb delay"></div>
      <div className="scanline"></div>

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        <h1 className="text-3xl font-semibold mb-4">Products</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products, categories, attributes…"
          className="w-full max-w-md bg-neutral-900 rounded-md px-4 py-2 mb-6 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        className="w-full py-2 bg-indigo-400 text-black rounded-lg hover:opacity-90 transition"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="w-full py-2 bg-green-500 text-black rounded-lg hover:opacity-90 transition"
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

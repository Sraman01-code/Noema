"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Package, Wallet } from "lucide-react";
import AttributeEditor from "@/components/AttributeEditor";
import ProductCard from "@/components/ProductCard";
import UploadDropzone from "@/components/UploadDropzone";
import { useAuth } from "@/lib/auth";
import { addProduct, getProducts, removeProduct } from "@/lib/productStore";
import { formatBalance } from "@/lib/money";
import type { Product, ProductAnalysis } from "@/lib/types";

function createDraftAnalysis(): ProductAnalysis {
  return {
    name: "Vintage Denim Jacket",
    category: "Fashion > Clothing > Jackets",
    categoryPath: ["Fashion", "Clothing", "Jackets"],
    confidence: 0.88,
    attributes: {
      color: "Blue",
      material: "Denim",
      condition: "New",
    },
  };
}

function getSellerProducts(sellerId: string) {
  return getProducts().filter((product) => product.sellerId === sellerId);
}

export default function SellerPage() {
  const { user, hydrated } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<ProductAnalysis>(createDraftAnalysis());
  const [price, setPrice] = useState(79.99);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      router.replace("/auth");
      return;
    }

    if (user.role !== "seller") {
      router.replace("/buyer");
      return;
    }

    setProducts(getSellerProducts(user.id));
  }, [hydrated, router, user]);

  const handleCreateListing = () => {
    if (!user || user.role !== "seller") return;

    if (!imageUrl.trim()) {
      alert("Upload an image first.");
      return;
    }

    if (!draft.name.trim()) {
      alert("Enter a product name.");
      return;
    }

    const listing: Product = {
      id: crypto.randomUUID(),
      image: imageUrl,
      price,
      sellerId: user.id,
      createdAt: new Date().toISOString(),
      analysis: draft,
    };

    addProduct(listing);
    setProducts(getSellerProducts(user.id));
    setDraft(createDraftAnalysis());
    setPrice(79.99);
    setImageUrl("");
  };

  const handleDeleteListing = (productId: string) => {
    if (!user || user.role !== "seller") return;

    const ownedProduct = getSellerProducts(user.id).some(
      (product) => product.id === productId
    );

    if (!ownedProduct) return;

    removeProduct(productId);
    setProducts(getSellerProducts(user.id));
  };

  if (!hydrated || !user || user.role !== "seller") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[#63637a] text-sm tracking-widest animate-pulse">AUTHENTICATING...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div className="bg-glow-orb absolute -top-40 -left-40 pointer-events-none" />
      <div className="bg-glow-orb delay absolute -bottom-40 -right-40 pointer-events-none" />
      <div className="scanline absolute inset-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10 space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1e1e24]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.12]">
                <Package size={12} className="text-violet-400" />
                <span className="text-[11px] font-semibold text-violet-400 tracking-wide uppercase">
                  Seller Studio
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Manage Listings</h1>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-[#1e1e24]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/[0.1]">
              <Wallet size={16} className="text-violet-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">{user.name}</p>
              <p className="text-[10px] font-semibold text-[#a78bfa] tabular-nums">
                {formatBalance(user.balance)}
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Create Listing */}
          <div className="space-y-5">
            <div className="rounded-2xl bg-[#111114] border border-[#1e1e24] p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Create Listing</h2>
                  <p className="text-sm text-[#63637a] mt-1">
                    Upload image, fill details, then publish.
                  </p>
                </div>

                <button
                  onClick={handleCreateListing}
                  className="btn-primary py-2.5 px-5 text-sm"
                >
                  <Plus size={16} />
                  Publish
                </button>
              </div>

              <UploadDropzone onUpload={setImageUrl} />

              {imageUrl && (
                <div className="rounded-xl overflow-hidden border border-[#1e1e24]">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}

              <AttributeEditor
                data={draft}
                onChange={setDraft}
                autoPrice={price}
                onPriceChange={setPrice}
              />
            </div>
          </div>

          {/* Listings */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-white">Your Listings</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-[#1e1e24]">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
                <span className="text-[11px] font-semibold text-[#a1a1aa] tabular-nums">
                  {products.length} {products.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl bg-[#111114] border border-[#1e1e24] py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-[#1e1e24] flex items-center justify-center">
                  <Package size={20} className="text-[#3a3a4c]" />
                </div>
                <p className="text-sm text-[#a1a1aa] font-medium">No listings yet</p>
                <p className="text-xs text-[#63637a]">Create your first listing to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    analysis={product.analysis}
                    price={product.price}
                    confidence={product.analysis.confidence}
                    actions={
                      <button
                        onClick={() => handleDeleteListing(product.id)}
                        className="btn-danger w-full py-2.5 text-xs"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

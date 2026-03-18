"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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

    setProducts(getProducts());
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
    setProducts(getProducts());
    setDraft(createDraftAnalysis());
    setPrice(79.99);
    setImageUrl("");
  };

  const handleDeleteListing = (productId: string) => {
    setProducts(removeProduct(productId));
  };

  if (!hydrated || !user || user.role !== "seller") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-sm text-neutral-400 tracking-widest animate-pulse">
          AUTHENTICATING...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-neutral-950 text-white relative overflow-hidden">
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div className="bg-glow-orb pointer-events-none" />
      <div className="bg-glow-orb delay pointer-events-none" />
      <div className="scanline pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        <header className="glass glow rounded-xl p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.25em] text-indigo-400">
              SELLER STUDIO
            </p>
            <h1 className="text-2xl font-bold">Manage listings</h1>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-indigo-400">
              Balance: {formatBalance(user.balance)}
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Create listing</h2>
                  <p className="text-sm text-neutral-400">
                    Upload the image, fill in the analysis, then publish the item.
                  </p>
                </div>

                <button
                  onClick={handleCreateListing}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
                >
                  <Plus size={16} />
                  Publish
                </button>
              </div>

              <UploadDropzone onUpload={setImageUrl} />

              {imageUrl && (
                <div className="rounded-xl border border-neutral-800 p-3">
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className="h-48 w-full rounded-lg object-cover"
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

          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h2 className="text-lg font-semibold">Your listings</h2>
              <p className="text-sm text-neutral-400">
                {products.length} item{products.length === 1 ? "" : "s"} in store.
              </p>
            </div>

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
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-700 px-3 py-2 text-sm text-red-300 hover:bg-red-700/10 transition"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

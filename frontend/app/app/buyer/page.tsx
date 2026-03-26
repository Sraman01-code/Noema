"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProducts } from "@/lib/productStore";
import type { Product, Review as StoredReview } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ReviewList, { Review as ReviewCard } from "@/components/ReviewList";
import PurchaseModal from "@/components/PurchaseModal";
import { Star, History, Trash2, CheckCircle, Download, X, ShoppingCart, Wallet, Package } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type PurchasedProduct = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  date: string;
};

export default function BuyerPage() {
  const { user, addToCart, removeFromCart, checkout, deposit } = useAuth();
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  // -- State Management --
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviewsDB, setReviewsDB] = useState<Record<string, StoredReview[]>>({});
  const [newReview, setNewReview] = useState<Record<string, { rating: number; comment: string }>>({});
  const [bought, setBought] = useState<PurchasedProduct[]>([]);
  
  // Modals & Overlays
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [topupAmount, setTopupAmount] = useState(0);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    items: PurchasedProduct[];
    txId: string;
    total: number;
    date: string;
  } | null>(null);

  // -- Effects --
  useEffect(() => {
    setIsMounted(true);
    setProducts(getProducts());

    const savedReviews = localStorage.getItem("reviews_db");
    if (savedReviews) setReviewsDB(JSON.parse(savedReviews));

    const savedBought = localStorage.getItem("purchase_history");
    if (savedBought) setBought(JSON.parse(savedBought));
  }, []);

  useEffect(() => {
    if (isMounted && (!user || user.role !== "buyer")) {
      router.push("/");
    }
  }, [user, router, isMounted]);

  // -- Handlers --
  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { 
        scale: 2, 
        backgroundColor: "#ffffff",
        useCORS: true
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${receiptData?.txId}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleSubmitReview = (productId: string) => {
    const reviewData = newReview[productId];
    if (!reviewData || !user) return;

    const isInvalid = 
      reviewData.comment.length < 15 || 
      /^(.)\1+$/.test(reviewData.comment) || 
      /^\s*$/.test(reviewData.comment);

    if (isInvalid) {
      alert("Comment rejected: too short (min 15 chars) or looks like spam.");
      return;
    }

    const review: StoredReview = {
      id: crypto.randomUUID(),
      productId,
      userId: user.id,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
    };

    const updated = {
      ...reviewsDB,
      [productId]: [...(reviewsDB[productId] || []), review],
    };

    setReviewsDB(updated);
    localStorage.setItem("reviews_db", JSON.stringify(updated));
    setNewReview((p) => ({
      ...p,
      [productId]: { rating: 0, comment: "" },
    }));
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleConfirmBuyNow = (quantity: number) => {
    if (!selectedProduct || !user) return;

    const totalCost = selectedProduct.price * quantity;
    if (user.balance < totalCost) {
      setTopupAmount(totalCost - user.balance);
      setShowTopupModal(true);
      return;
    }

    addToCart({
      productId: selectedProduct.id,
      name: selectedProduct.analysis.name,
      price: selectedProduct.price,
      quantity,
    });

    const result = checkout();
    if (!result.success) return alert(result.message);

    const record: PurchasedProduct = {
      productId: selectedProduct.id,
      name: selectedProduct.analysis.name,
      price: selectedProduct.price,
      quantity,
      totalPrice: totalCost,
      date: new Date().toISOString(),
    };

    finalizePurchase([record], totalCost);
    setModalOpen(false);
  };

  const handleCheckoutCart = () => {
    if (!user || !user.cart) return;
    const total = user.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (user.balance < total) {
      setTopupAmount(total - user.balance);
      setShowTopupModal(true);
      return;
    }

    const result = checkout();
    if (!result.success) return alert(result.message);

    const records: PurchasedProduct[] = user.cart.map((c) => ({
      productId: c.productId,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      totalPrice: c.price * c.quantity,
      date: new Date().toISOString(),
    }));

    finalizePurchase(records, total);
  };

  const finalizePurchase = (records: PurchasedProduct[], total: number) => {
    const updatedHistory = [...bought, ...records];
    setBought(updatedHistory);
    localStorage.setItem("purchase_history", JSON.stringify(updatedHistory));
    
    setReceiptData({
      items: records,
      txId: crypto.randomUUID().split("-")[0].toUpperCase(),
      total,
      date: new Date().toLocaleString(),
    });
  };

  const clearHistory = () => {
    if (confirm("Clear all purchase records? This cannot be undone.")) {
      setBought([]);
      localStorage.removeItem("purchase_history");
    }
  };

  // -- Render Guard --
  if (!isMounted || !user || user.role !== "buyer") {
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
    <main className="min-h-screen relative overflow-y-auto overflow-x-hidden">
      {/* Background Effects */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div className="bg-glow-orb absolute -top-40 -left-40 pointer-events-none" />
      <div className="bg-glow-orb delay absolute -bottom-40 -right-40 pointer-events-none" />
      <div className="scanline absolute inset-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1e1e24]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.12]">
                <ShoppingCart size={12} className="text-violet-400" />
                <span className="text-[11px] font-semibold text-violet-400 tracking-wide uppercase">
                  Buyer Dashboard
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Shopping Hub</h1>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-[#1e1e24]">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/[0.1]">
              <Wallet size={16} className="text-violet-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">{user.name}</p>
              <p className="text-[10px] font-semibold text-[#a78bfa] tabular-nums">
                Balance: ${user.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => {
            const reviews = reviewsDB[product.id] || [];
            const displayReviews: ReviewCard[] = reviews.map((review) => ({
              id: review.id,
              user: review.userId,
              role: "buyer",
              rating: review.rating,
              comment: review.comment,
            }));
            const avg = reviews.length > 0
                ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                : 0;

            return (
              <div key={product.id} className="space-y-4">
                <ProductCard
                  id={product.id}
                  image={product.image}
                  analysis={product.analysis}
                  price={product.price}
                  confidence={product.analysis.confidence}
                  actions={
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary flex-1 py-2.5 text-xs"
                        onClick={() => addToCart({
                          productId: product.id,
                          name: product.analysis.name,
                          price: product.price,
                          quantity: 1,
                        })}
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
                  }
                />

                {/* Reviews Section */}
                <div className="rounded-xl bg-[#111114] border border-[#1e1e24] p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-violet-500" />
                      Reviews
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-[#a1a1aa] tabular-nums">{avg.toFixed(1)}</span>
                      <span className="text-xs text-[#63637a]">({reviews.length})</span>
                    </div>
                  </div>

                  <ReviewList reviews={displayReviews} />

                  <div className="pt-3 border-t border-[#1e1e24] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#63637a] uppercase tracking-wider">Rate:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`cursor-pointer transition-colors ${
                            (newReview[product.id]?.rating || 0) >= star
                              ? "text-amber-400 fill-amber-400"
                              : "text-[#2a2a34] hover:text-amber-400/40"
                          }`}
                          onClick={() =>
                            setNewReview((p) => ({
                              ...p,
                              [product.id]: { ...p[product.id], rating: star },
                            }))
                          }
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        className="input-field flex-1 py-2 text-sm"
                        placeholder="Write a review..."
                        value={newReview[product.id]?.comment || ""}
                        onChange={(e) =>
                          setNewReview((p) => ({
                            ...p,
                            [product.id]: { ...p[product.id], comment: e.target.value },
                          }))
                        }
                      />
                      <button
                        className="btn-secondary py-2 px-4 text-xs"
                        onClick={() => handleSubmitReview(product.id)}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shopping Cart */}
        {user.cart && user.cart.length > 0 && (
          <div className="rounded-2xl bg-[#111114] border border-violet-500/20 p-6 space-y-4 shadow-[0_0_40px_rgba(139,92,246,0.06)]">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
              <div className="h-9 w-9 rounded-xl bg-violet-500/[0.1] flex items-center justify-center">
                <ShoppingCart size={16} className="text-violet-400" />
              </div>
              Current Cart
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20 tabular-nums">
                {user.cart.length} {user.cart.length === 1 ? "item" : "items"}
              </span>
            </h2>
            
            <div className="divide-y divide-[#1e1e24] rounded-xl bg-[#09090b] border border-[#1e1e24] overflow-hidden">
              {user.cart.map((c) => (
                <div key={c.productId} className="flex justify-between items-center px-5 py-3.5 text-sm hover:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white font-semibold">{c.name}</span>
                    <span className="text-[#63637a] text-xs">Qty: {c.quantity}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-white font-bold tabular-nums">${(c.price * c.quantity).toFixed(2)}</span>
                    <button
                      className="p-1.5 text-[#63637a] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      onClick={() => removeFromCart(c.productId)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-[#1e1e24]" />

            <div className="flex justify-between items-center">
              <span className="micro-label text-[#63637a]">Total Amount</span>
              <div className="flex items-center gap-5">
                <span className="font-extrabold text-2xl text-white tabular-nums tracking-tight">
                  ${user.cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}
                </span>
                <button
                  className="btn-primary py-2.5 px-8"
                  onClick={handleCheckoutCart}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="rounded-2xl bg-[#111114] border border-[#1e1e24] p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-[#1e1e24]">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
              <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-[#1e1e24] flex items-center justify-center">
                <History size={16} className="text-[#63637a]" />
              </div>
              Transaction History
            </h2>
            {bought.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-[#63637a] hover:text-red-400 transition-colors flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 hover:bg-red-500/8 rounded-lg"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>
          
          {bought.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-[#1e1e24] flex items-center justify-center">
                <History size={20} className="text-[#3a3a4c]" />
              </div>
              <p className="text-sm text-[#a1a1aa] font-medium">No purchase records</p>
              <p className="text-xs text-[#63637a]">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#1e1e24]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#09090b]">
                    <th className="py-3 px-4 text-[10px] font-bold text-[#63637a] uppercase tracking-wider">Product</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-[#63637a] uppercase tracking-wider">Date</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-[#63637a] uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e24]">
                  {bought.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="text-white font-semibold">{item.name}</p>
                        <p className="text-[10px] text-[#63637a] font-mono mt-0.5">Qty: {item.quantity} × ${item.price}</p>
                      </td>
                      <td className="py-3.5 px-4 text-[#a1a1aa] text-xs">
                        {new Date(item.date).toLocaleDateString()}
                        <span className="text-[#3a3a4c] ml-1.5">
                          {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* --- RECEIPT MODAL --- */}
      {receiptData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[100] backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm">
            <button 
              onClick={() => setReceiptData(null)}
              className="absolute -top-12 right-0 h-8 w-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#a1a1aa] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="bg-white text-black rounded-2xl overflow-hidden shadow-2xl">
              <div ref={receiptRef} className="p-8 space-y-6 bg-white relative">
                <div className="flex justify-between items-start">
                  <div className="bg-emerald-50 p-2.5 rounded-xl">
                    <CheckCircle className="text-emerald-600" size={24} />
                  </div>
                  <div className="text-right">
                    <h2 className="text-lg font-black uppercase tracking-tight">Receipt</h2>
                    <p className="text-[10px] text-neutral-400 font-mono">ID: {receiptData.txId}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-y border-dashed border-neutral-200 py-4 space-y-2.5">
                    {receiptData.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm items-center">
                        <div className="flex flex-col">
                          <span className="text-neutral-800 font-bold">{item.name}</span>
                          <span className="text-neutral-400 text-[10px] uppercase">Qty: {item.quantity}</span>
                        </div>
                        <span className="font-mono font-semibold">${item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Paid</span>
                    <span className="text-2xl font-black tracking-tight">${receiptData.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 py-4 border-t border-neutral-100">
                  <QRCodeCanvas 
                    value={`TX:${receiptData.txId}|AMT:${receiptData.total}|DT:${receiptData.date}`} 
                    size={72} 
                    level="M"
                  />
                  <p className="text-[9px] text-neutral-400 font-mono text-center uppercase">Authorized Transaction<br/>{receiptData.date}</p>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                <button 
                  onClick={downloadPDF}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg"
                >
                  <Download size={16} /> Save as PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOPUP MODAL --- */}
      {showTopupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[110] backdrop-blur-md" onClick={() => setShowTopupModal(false)}>
          <div className="w-full max-w-md mx-4 rounded-2xl overflow-hidden border border-red-500/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="bg-[#111114] p-6 space-y-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Wallet className="text-red-400" size={22} />
                </div>
                <h2 className="text-lg font-bold text-white">Insufficient Balance</h2>
                <p className="text-sm text-[#a1a1aa]">
                  You need <span className="text-red-400 font-mono font-bold">${topupAmount.toFixed(2)}</span> more to complete this purchase.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const amt = Number(formData.get("amount"));
                  const card = formData.get("cardNumber");

                  if (amt <= 0) return alert("Enter a valid amount");
                  if (!card || card.toString().length < 16) return alert("Please enter a valid 16-digit card number");
                  
                  deposit(amt);
                  setShowTopupModal(false);
                }}
                className="space-y-4 text-left"
              >
                <div className="space-y-1.5">
                  <label className="micro-label text-[#63637a] ml-0.5">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="input-field font-mono"
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      const matches = val.match(/\d{4,16}/g);
                      const match = matches && matches[0] || '';
                      const parts = [];
                      for (let i=0, len=match.length; i<len; i+=4) {
                          parts.push(match.substring(i, i+4));
                      }
                      if (parts.length) e.target.value = parts.join(' ');
                      else e.target.value = val;
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="micro-label text-[#63637a] ml-0.5">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input-field font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="micro-label text-[#63637a] ml-0.5">CVC</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={3}
                      className="input-field font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="micro-label text-[#63637a] ml-0.5">Deposit Amount ($)</label>
                  <input
                    type="number"
                    name="amount"
                    className="input-field font-mono"
                    defaultValue={topupAmount.toFixed(2)}
                    min={0.01}
                    step="0.01"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full py-3 mt-1"
                >
                  Confirm Payment
                </button>
              </form>

              <button
                className="w-full text-xs text-[#63637a] hover:text-white transition-colors text-center py-1"
                onClick={() => setShowTopupModal(false)}
              >
                Cancel and go back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {modalOpen && selectedProduct && (
        <PurchaseModal
          productName={selectedProduct.analysis.name}
          unitPrice={selectedProduct.price}
          onConfirm={handleConfirmBuyNow}
          onClose={() => setModalOpen(false)}
        />
      )}
    </main>
  );
}

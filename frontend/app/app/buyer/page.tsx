"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProducts } from "@/lib/productStore";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ReviewList, { Review } from "@/components/ReviewList";
import PurchaseModal from "@/components/PurchaseModal";
import { Star, History, Trash2, CheckCircle, Download, X, ShoppingCart } from "lucide-react";
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
  const [reviewsDB, setReviewsDB] = useState<Record<string, Review[]>>({});
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

  // 1. Handle Hydration & Local Storage
  useEffect(() => {
    setIsMounted(true);
    setProducts(getProducts());

    const savedReviews = localStorage.getItem("reviews_db");
    if (savedReviews) setReviewsDB(JSON.parse(savedReviews));

    const savedBought = localStorage.getItem("purchase_history");
    if (savedBought) setBought(JSON.parse(savedBought));
  }, []);

  // 2. Handle Auth Redirects (Only after mount)
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

    const review: Review = {
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
      <main className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-400 text-sm tracking-widest animate-pulse">AUTHENTICATING...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-neutral-950 relative overflow-y-auto overflow-x-hidden">
      {/* Background Effects */}
      <div className="bg-grid absolute inset-0 pointer-events-none" />
      <div className="bg-glow-orb pointer-events-none" />
      <div className="bg-glow-orb delay pointer-events-none" />
      <div className="scanline pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="glass glow rounded-xl p-6 flex justify-between items-center sticky top-0 z-40 backdrop-blur-xl">
          <h1 className="text-2xl font-bold tracking-tight text-white">Buyer Dashboard</h1>
          <div className="text-right">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-indigo-400 font-mono">Balance: ${user.balance.toFixed(2)}</p>
          </div>
        </header>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {products.map((product) => {
            const reviews = reviewsDB[product.id] || [];
            const avg = reviews.length > 0
                ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                : 0;

            return (
              <div key={product.id} className="space-y-4 group">
                <ProductCard
                  id={product.id}
                  image={product.image}
                  analysis={product.analysis}
                  price={product.price}
                  confidence={product.analysis.confidence}
                  actions={
                    <div className="flex gap-2 pt-2">
                      <button
                        className="flex-1 py-2.5 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors border border-neutral-700"
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
                        className="flex-1 py-2.5 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20"
                        onClick={() => handleBuyNow(product)}
                      >
                        Buy Now
                      </button>
                    </div>
                  }
                />

                {/* Reviews Section */}
                <div className="glass rounded-xl p-4 space-y-4 border border-white/5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-neutral-300">Reviews</h3>
                    <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-neutral-400">{avg.toFixed(1)} ({reviews.length})</span>
                    </div>
                  </div>

                  <ReviewList reviews={reviews} />

                  <div className="pt-4 border-t border-neutral-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">Rate:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          className={`cursor-pointer transition-colors ${
                            (newReview[product.id]?.rating || 0) >= star
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-neutral-700 hover:text-yellow-400/50"
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
                        className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder:text-neutral-600 transition-colors"
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
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase rounded-lg transition-colors border border-neutral-700"
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

        {/* Shopping Cart - Rendered Safely */}
        {user.cart && user.cart.length > 0 && (
          <div className="glass rounded-xl p-6 space-y-4 border border-indigo-500/30 shadow-2xl shadow-indigo-900/10 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-medium flex items-center gap-3 text-white">
              <ShoppingCart size={20} className="text-indigo-400" />
              Current Cart
              <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm">{user.cart.length}</span>
            </h2>
            
            <div className="divide-y divide-neutral-800/50 bg-neutral-900/30 rounded-lg px-4">
              {user.cart.map((c) => (
                <div key={c.productId} className="flex justify-between items-center py-3 text-sm group">
                  <div className="flex flex-col">
                      <span className="text-neutral-200 font-medium">{c.name}</span>
                      <span className="text-neutral-500 text-xs">Qty: {c.quantity}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-white font-mono font-bold">${(c.price * c.quantity).toFixed(2)}</span>
                    <button
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-all"
                      onClick={() => removeFromCart(c.productId)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-neutral-800">
                <div className="text-sm text-neutral-400 uppercase tracking-widest">Total Amount</div>
                <div className="flex items-center gap-6">
                    <span className="font-bold text-2xl text-white tracking-tight">${user.cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}</span>
                    <button
                    className="py-2.5 px-8 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20 transition-all transform active:scale-95"
                    onClick={handleCheckoutCart}
                    >
                    Checkout
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
            <h2 className="text-lg font-medium flex items-center gap-2 text-neutral-200">
              <History size={20} className="text-neutral-400" /> Transaction History
            </h2>
            {bought.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1 text-xs uppercase font-bold tracking-wider px-2 py-1 hover:bg-white/5 rounded"
              >
                <Trash2 size={14} /> Clear Log
              </button>
            )}
          </div>
          
          {bought.length === 0 ? (
            <div className="py-8 text-center text-neutral-600 flex flex-col items-center gap-2">
                <History size={32} className="opacity-20" />
                <p className="text-sm italic">No purchase records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-neutral-500 border-b border-neutral-800/50">
                    <th className="py-2 font-medium pl-2">Product Detail</th>
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium text-right pr-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {bought.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2">
                        <p className="text-neutral-200 font-medium">{item.name}</p>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">Qty: {item.quantity} × ${item.price}</p>
                      </td>
                      <td className="py-3 text-neutral-400 text-xs">
                        {new Date(item.date).toLocaleDateString()} <span className="text-neutral-600">{new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="py-3 pr-2 text-right font-mono text-green-400">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[100] backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm">
            {/* Close Button Outside */}
            <button 
                onClick={() => setReceiptData(null)}
                className="absolute -top-12 right-0 p-2 text-neutral-400 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            <div className="bg-white text-black rounded-3xl overflow-hidden shadow-2xl">
                <div ref={receiptRef} className="p-8 space-y-6 bg-white relative">
                <div className="flex justify-between items-start">
                    <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="text-green-600" size={28} />
                    </div>
                    <div className="text-right">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">Receipt</h2>
                    <p className="text-[10px] text-neutral-400 font-mono">ID: {receiptData.txId}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="border-y border-dashed border-neutral-300 py-4 space-y-2">
                    {receiptData.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm items-center">
                        <div className="flex flex-col">
                            <span className="text-neutral-800 font-bold">{item.name}</span>
                            <span className="text-neutral-400 text-[10px] uppercase">Qty: {item.quantity}</span>
                        </div>
                        <span className="font-mono font-medium">${item.totalPrice.toFixed(2)}</span>
                        </div>
                    ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-neutral-400 uppercase">Total Paid</span>
                    <span className="text-3xl font-black tracking-tighter">${receiptData.total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3 py-4 border-t border-neutral-100">
                    <QRCodeCanvas 
                        value={`TX:${receiptData.txId}|AMT:${receiptData.total}|DT:${receiptData.date}`} 
                        size={80} 
                        level="M"
                    />
                    <p className="text-[10px] text-neutral-400 font-mono text-center uppercase">Authorized Transaction<br/>{receiptData.date}</p>
                </div>
                </div>

                <div className="p-4 bg-neutral-100 border-t border-neutral-200">
                <button 
                    onClick={downloadPDF}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg"
                >
                    <Download size={18} /> Save as PDF
                </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TOPUP MODAL --- */}
      {showTopupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[110] backdrop-blur-sm animate-in fade-in">
          <div className="glass rounded-xl p-6 w-96 space-y-4 text-center border border-red-500/50 shadow-2xl shadow-red-900/20">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-red-500/10 rounded-full">
                <ShoppingCart className="text-red-400" size={24} />
              </div>
              <h2 className="text-lg font-semibold text-white">Insufficient Balance</h2>
              <p className="text-sm text-neutral-400">
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
              className="space-y-4 pt-2 text-left"
            >
              {/* Card Number Input */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-neutral-500 font-bold ml-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full p-2.5 rounded-lg bg-neutral-950 text-white border border-neutral-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm"
                    onChange={(e) => {
                      // Basic auto-formatting for card spaces
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold ml-1">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-2.5 rounded-lg bg-neutral-950 text-white border border-neutral-800 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold ml-1">CVC</label>
                  <input
                    type="password"
                    placeholder="***"
                    maxLength={3}
                    className="w-full p-2.5 rounded-lg bg-neutral-950 text-white border border-neutral-800 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-neutral-500 font-bold ml-1">Deposit Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  className="w-full p-2.5 rounded-lg bg-neutral-950 text-white border border-neutral-800 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                  defaultValue={topupAmount.toFixed(2)}
                  min={0.01}
                  step="0.01"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 mt-2"
              >
                Confirm Payment
              </button>
            </form>

            <button
              className="text-xs text-neutral-500 hover:text-white transition-colors pt-2"
              onClick={() => setShowTopupModal(false)}
            >
              Cancel and go back
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
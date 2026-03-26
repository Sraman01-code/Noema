"use client";

import { useState, useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";

type Props = {
  productName: string;
  unitPrice: number;
  onConfirm: (quantity: number, totalPrice: number) => void;
  onClose: () => void;
  maxQuantity?: number;
};

export default function PurchaseModal({
  productName,
  unitPrice,
  onConfirm,
  onClose,
  maxQuantity = 99,
}: Props) {
  const [quantity, setQuantity] = useState(1);

  const totalPrice = unitPrice * quantity;

  useEffect(() => {
    if (quantity < 1) setQuantity(1);
    if (quantity > maxQuantity) setQuantity(maxQuantity);
  }, [quantity, maxQuantity]);

  const handleConfirm = () => {
    if (quantity < 1) return;
    onConfirm(quantity, totalPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden border border-[#1e1e24] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        <div className="bg-[#111114] p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="micro-label text-violet-400 mb-1.5">Purchase</p>
              <h2 className="text-lg font-bold text-white leading-tight">{productName}</h2>
            </div>
            <button
              className="h-8 w-8 rounded-lg bg-white/[0.04] border border-[#1e1e24] flex items-center justify-center text-[#63637a] hover:text-white hover:border-[#2a2a34] transition-all"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          {/* Price info */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-[#1e1e24]">
            <span className="text-sm text-[#a1a1aa]">Unit Price</span>
            <span className="text-sm font-bold text-white tabular-nums">${unitPrice.toFixed(2)}</span>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="micro-label text-[#63637a] ml-1">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-10 w-10 rounded-xl bg-white/[0.04] border border-[#1e1e24] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:border-violet-500/30 transition-all"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1 h-10 bg-[#09090b] border border-[#1e1e24] rounded-xl px-4 text-center text-white font-bold tabular-nums text-lg outline-none focus:border-violet-500/50 transition-colors"
              />
              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                className="h-10 w-10 rounded-xl bg-white/[0.04] border border-[#1e1e24] flex items-center justify-center text-[#a1a1aa] hover:text-white hover:border-violet-500/30 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-[#1e1e24]" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#a1a1aa]">Total</span>
            <span className="text-2xl font-extrabold text-white tabular-nums tracking-tight">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          {/* Confirm */}
          <button
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
              quantity < 1
                ? "bg-[#1e1e24] text-[#63637a] cursor-not-allowed"
                : "btn-primary w-full py-3"
            }`}
            onClick={handleConfirm}
            disabled={quantity < 1}
          >
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
}

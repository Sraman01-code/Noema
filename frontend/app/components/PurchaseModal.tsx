"use client";

import { useState, useEffect } from "react";

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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md space-y-4 relative">
        <button
          className="absolute top-3 right-3 text-neutral-500 hover:text-red-400 text-lg font-bold"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold">{productName}</h2>
        <p className="text-sm text-neutral-400">Unit Price: ${unitPrice.toFixed(2)}</p>

        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm text-neutral-400">Quantity:</label>
          <input
            type="number"
            min={1}
            max={maxQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 bg-neutral-800 rounded-md px-2 py-1 text-sm text-white"
          />
        </div>

        <div className="text-sm text-indigo-400 font-medium">
          Total: ${totalPrice.toFixed(2)}
        </div>

        <button
          className={`w-full py-2 rounded-lg text-black font-medium transition ${
            quantity < 1
              ? "bg-neutral-700 cursor-not-allowed"
              : "bg-indigo-400 hover:opacity-90"
          }`}
          onClick={handleConfirm}
          disabled={quantity < 1}
        >
          Confirm Purchase
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

type PurchasedProduct = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  date: string;
};

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<PurchasedProduct[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const savedBought = localStorage.getItem("purchase_history");
    if (savedBought) setPurchases(JSON.parse(savedBought));
  }, [user, router]);

  if (!user) return null;

  // Show only the latest purchase for receipt
  const latestPurchase = purchases.slice(-1);
  const totalPaid = latestPurchase.reduce((sum, p) => sum + p.totalPrice, 0);

  // Fake transaction ID and payment method
  const transactionId = crypto.randomUUID().slice(0, 8);
  const paymentMethod = "Credit Card";

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white flex flex-col items-center print:bg-white print:text-black print:p-0 print:items-start">
      <div className="glass rounded-xl p-6 w-full max-w-md space-y-4 print:rounded-none print:w-full print:p-4">
        <h1 className="text-xl font-semibold text-center print:text-black">
          Purchase Receipt
        </h1>

        <p className="text-sm text-neutral-400 print:text-black">
          Buyer: {user.name} ({user.email})
        </p>
        <p className="text-sm text-neutral-400 print:text-black">
          Date: {new Date().toLocaleString()}
        </p>
        <p className="text-sm text-neutral-400 print:text-black">
          Payment Method: {paymentMethod}
        </p>
        <p className="text-sm text-neutral-400 print:text-black">
          Transaction ID: {transactionId}
        </p>

        <div className="border-t border-neutral-700 pt-2 space-y-2 print:border-black print:pt-1">
          {latestPurchase.map((p) => (
            <div key={p.productId} className="flex justify-between print:flex print:justify-between">
              <span>{p.name} × {p.quantity}</span>
              <span>₹{p.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-700 pt-2 flex justify-between font-semibold print:border-black print:pt-1">
          <span>Total Paid</span>
          <span>₹{totalPaid.toFixed(2)}</span>
        </div>

        <div className="flex justify-center pt-4 print:justify-start print:pt-2">
          <QRCodeCanvas
            value={`Buyer:${user.id}|Amount:${totalPaid}|TX:${transactionId}`}
            size={128}
            fgColor="#4f46e5"
          />
        </div>

        <button
          className="w-full py-2 bg-indigo-500 text-black rounded-lg mt-4 print:hidden"
          onClick={() => router.push("/buyer")}
        >
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}

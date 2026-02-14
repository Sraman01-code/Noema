"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { formatBalance } from "@/lib/money";

export default function AuthPage() {
  const { user, hydrated, loginAs } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<"buyer" | "seller" | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) return;
    if (user.isGuest) return;

    router.replace(user.role === "buyer" ? "/buyer" : "/seller");
  }, [user, hydrated, router]);

  const handleGuestLogin = async (role: "buyer" | "seller") => {
    setLoading(role);
    await loginAs(role);
    setLoading(null);
  };

  if (!hydrated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center relative overflow-hidden">
      <div className="bg-grid absolute inset-0" />
      <div className="bg-glow-orb" />
      <div className="bg-glow-orb delay" />
      <div className="scanline" />

      <div className="glass glow rounded-2xl p-8 w-full max-w-sm space-y-6 relative z-10 text-center">
        <p className="text-xs tracking-[0.25em] text-indigo-400">
          DEMO MODE
        </p>

        <h1 className="text-xl font-semibold">
          Try Noëma instantly
        </h1>

        <p className="text-sm text-neutral-400">
          Explore the marketplace with a temporary guest account.
        </p>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleGuestLogin("buyer")}
            disabled={loading !== null}
            className={`w-full py-2 rounded-lg font-medium transition ${
              loading === "buyer"
                ? "bg-neutral-700"
                : "bg-white text-black hover:opacity-90"
            }`}
          >
            {loading === "buyer"
              ? "Entering…"
              : `Continue as Guest Buyer (${formatBalance(25)})`}
          </button>

          <button
            onClick={() => handleGuestLogin("seller")}
            disabled={loading !== null}
            className={`w-full py-2 rounded-lg transition ${
              loading === "seller"
                ? "bg-neutral-800 opacity-60"
                : "border border-neutral-700 hover:border-indigo-400"
            }`}
          >
            {loading === "seller"
              ? "Entering…"
              : `Continue as Guest Seller (${formatBalance(20)})`}
          </button>
        </div>

        <div className="pt-4 text-xs text-neutral-400 space-y-1">
          <p>Want full access?</p>
          <div className="flex justify-center gap-4">
            <a href="/auth/login" className="text-indigo-400 hover:underline">
              Log in
            </a>
            <a href="/auth/signup" className="text-indigo-400 hover:underline">
              Create account
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

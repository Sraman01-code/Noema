"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 relative z-20">
      <div className="flex gap-6">
        <Link href="/marketplace" className="font-bold hover:text-indigo-400 transition">Marketplace</Link>
        <Link href="/marketplace" className="hover:text-indigo-400 transition">Browse</Link>

        {user?.role === "seller" && (
          <Link href="/seller" className="hover:text-indigo-400 transition">Seller Panel</Link>
        )}
      </div>

      <div className="flex gap-4 items-center">
        {!user && (
          <Link href="/auth">
            <button className="px-3 py-1 rounded-lg border border-neutral-700 text-sm hover:border-indigo-400 hover:text-indigo-300 transition pulse">
              Login / Sign Up
            </button>
          </Link>
        )}

        {user && (
          <>
            <span className="text-sm opacity-70">
              {user.name} (${user.balance})
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 rounded-lg border border-red-600 text-red-400 hover:bg-red-600/20 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Store, Wallet } from "lucide-react";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-xl">
      {/* Top accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      <div className="border-b border-[#1e1e24]/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link href="/marketplace" className="flex items-center gap-3 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20 group-hover:shadow-violet-500/40 transition-all duration-300">
                <Store size={16} className="text-white" />
                <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span
                className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-violet-300 bg-clip-text text-transparent"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                NOEMA
              </span>
            </Link>

            <div className="hidden sm:flex items-center gap-0.5">
              <Link
                href="/marketplace"
                className="px-3.5 py-2 text-[13px] font-medium text-[#a1a1aa] hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
              >
                Marketplace
              </Link>

              {user?.role === "buyer" && (
                <Link
                  href="/buyer"
                  className="px-3.5 py-2 text-[13px] font-medium text-[#a1a1aa] hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                >
                  Dashboard
                </Link>
              )}

              {user?.role === "seller" && (
                <Link
                  href="/seller"
                  className="px-3.5 py-2 text-[13px] font-medium text-[#a1a1aa] hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
                >
                  Seller Studio
                </Link>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {!user && (
              <Link href="/auth">
                <button className="relative px-5 py-2 text-sm font-semibold rounded-xl text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/25 active:scale-[0.97] group">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">Sign In</span>
                </button>
              </Link>
            )}

            {user && (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2.5 pl-3 pr-1.5 py-1 rounded-xl bg-white/[0.04] border border-[#1e1e24] hover:border-[#2a2a34] transition-colors">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[11px] font-semibold text-white leading-none">{user.name}</span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[#a78bfa] leading-none">
                      <Wallet size={9} />
                      ${user.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-inner">
                    {user.name?.charAt(0) || "U"}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-3 py-2 text-[11px] font-semibold rounded-lg text-[#63637a] hover:text-red-400 hover:bg-red-500/8 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

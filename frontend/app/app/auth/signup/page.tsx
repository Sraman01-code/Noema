"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { formatBalance } from "@/lib/money";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<"buyer" | "seller" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!role) return alert("Select a role");
    if (!email || !password) return alert("Missing fields");

    setLoading(true);
    const res = await register(email, password, role);
    setLoading(false);

    if (!res.success) {
      alert(res.message);
      return;
    }

    router.push(role === "buyer" ? "/buyer" : "/seller");
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900 rounded-xl p-6 space-y-6">
        <h1 className="text-xl font-semibold text-center">
          Create Account
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="space-y-3">
          <button
            onClick={() => setRole("buyer")}
            className={`w-full py-3 rounded-lg border ${
              role === "buyer"
                ? "border-white"
                : "border-neutral-700"
            }`}
          >
            Register as Buyer ({formatBalance(25)} deposit)
          </button>

          <button
            onClick={() => setRole("seller")}
            className={`w-full py-3 rounded-lg border ${
              role === "seller"
                ? "border-white"
                : "border-neutral-700"
            }`}
          >
            Register as Seller ({formatBalance(20)} deposit)
          </button>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-2 bg-indigo-400 text-black rounded-lg"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </div>
    </main>
  );
}

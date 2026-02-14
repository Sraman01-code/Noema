"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.isGuest) return;

    router.replace(user.role === "buyer" ? "/buyer" : "/seller");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);

    if (!res.success) {
      setError(res.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="glass glow rounded-xl p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-lg font-semibold text-center">Log in</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
        />

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-white text-black font-medium hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}

"use client";

import { ShieldCheck } from "lucide-react";

export default function SecurityBadge() {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-400">
      <ShieldCheck size={16} className="text-green-500" />
      Encrypted Session
    </div>
  );
}

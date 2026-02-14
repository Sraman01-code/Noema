"use client";

import { UploadCloud } from "lucide-react";

export default function UploadDropzone({ onSelect }: { onSelect: (file: File) => void }) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      onSelect(e.target.files[0]);
    }
  }

  return (
    <label className="border border-dashed border-neutral-700 rounded-xl p-10 text-center hover:border-neutral-500 transition cursor-pointer block">
      <UploadCloud className="mx-auto mb-4 opacity-70" size={36} />
      <p className="text-sm text-neutral-400">Click to upload product image</p>
      <input type="file" accept="image/*" hidden onChange={handleChange} />
    </label>
  );
}

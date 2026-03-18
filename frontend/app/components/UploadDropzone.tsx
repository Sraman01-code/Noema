"use client";

import { UploadCloud } from "lucide-react";
import { useState } from "react";

export default function UploadDropzone({
  onUpload,
}: {
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUpload(data.url);
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="border border-dashed border-neutral-700 rounded-xl p-10 text-center hover:border-neutral-500 transition cursor-pointer block">
      <UploadCloud className="mx-auto mb-4 opacity-70" size={36} />
      <p className="text-sm text-neutral-400">
        {uploading ? "Uploading…" : "Click to upload product image"}
      </p>
      <input type="file" accept="image/*" hidden onChange={handleChange} />
    </label>
  );
}

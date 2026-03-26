"use client";

import { UploadCloud, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function UploadDropzone({
  onUpload,
}: {
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploaded(false);

    try {
      const res = await fetch(`${apiBaseUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUpload(data.url);
      setUploaded(true);
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label
      className={`block rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
        uploaded
          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
          : "border-[#1e1e24] bg-[#09090b] hover:border-violet-500/30 hover:bg-violet-500/[0.03]"
      }`}
    >
      {uploaded ? (
        <CheckCircle className="mx-auto mb-3 text-emerald-400" size={32} />
      ) : (
        <UploadCloud className="mx-auto mb-3 text-[#63637a]" size={32} />
      )}
      <p className="text-sm font-medium text-[#a1a1aa]">
        {uploading
          ? "Uploading…"
          : uploaded
          ? "Image uploaded — click to replace"
          : "Click to upload product image"}
      </p>
      <p className="text-[10px] text-[#63637a] mt-1.5">PNG, JPG up to 10MB</p>
      <input type="file" accept="image/*" hidden onChange={handleChange} />
    </label>
  );
}

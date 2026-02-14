"use client";

export default function CategoryBreadCrumbs({ categories }: { categories: string[] }) {
  return (
    <div className="text-xs text-neutral-400 flex gap-1 flex-wrap">
      {categories.map((cat, idx) => (
        <span key={idx}>
          {cat}
          {idx < categories.length - 1 && " → "}
        </span>
      ))}
    </div>
  );
}

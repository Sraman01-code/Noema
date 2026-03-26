"use client";

import { ProductAnalysis } from "@/lib/types";

type Props = {
  data: ProductAnalysis;
  onChange: (data: ProductAnalysis) => void;
  autoPrice?: number | null;
  onPriceChange?: (price: number) => void;
};

export default function AttributeEditor({ data, onChange, autoPrice, onPriceChange }: Props) {
  function updateField<K extends keyof ProductAnalysis>(key: K, value: ProductAnalysis[K]) {
    if (key === "category" && typeof value === "string") {
      const categoryPath = value
        .split(/>|\/+/)
        .map((part) => part.trim())
        .filter(Boolean);

      onChange({
        ...data,
        category: value,
        categoryPath: categoryPath.length > 0 ? categoryPath : data.categoryPath,
      });
      return;
    }

    onChange({ ...data, [key]: value });
  }

  function updateAttribute(key: keyof ProductAnalysis["attributes"], value: string) {
    onChange({
      ...data,
      attributes: {
        ...data.attributes,
        [key]: value,
      },
    });
  }

  return (
    <div className="rounded-xl bg-[#09090b] border border-[#1e1e24] p-5 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-violet-500" />
        Edit Listing Details
      </h3>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="micro-label text-[#63637a] ml-0.5">Product Name</label>
          <input
            className="input-field"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Product name"
          />
        </div>

        <div className="space-y-1.5">
          <label className="micro-label text-[#63637a] ml-0.5">Category</label>
          <input
            className="input-field"
            value={data.category}
            onChange={(e) => updateField("category", e.target.value)}
            placeholder="Category"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="micro-label text-[#63637a] ml-0.5">Color</label>
          <input
            className="input-field"
            value={data.attributes.color}
            onChange={(e) => updateAttribute("color", e.target.value)}
            placeholder="Color"
          />
        </div>
        <div className="space-y-1.5">
          <label className="micro-label text-[#63637a] ml-0.5">Material</label>
          <input
            className="input-field"
            value={data.attributes.material}
            onChange={(e) => updateAttribute("material", e.target.value)}
            placeholder="Material"
          />
        </div>
        <div className="space-y-1.5">
          <label className="micro-label text-[#63637a] ml-0.5">Condition</label>
          <input
            className="input-field"
            value={data.attributes.condition}
            onChange={(e) => updateAttribute("condition", e.target.value)}
            placeholder="Condition"
          />
        </div>
      </div>

      {autoPrice != null && onPriceChange && (
        <div className="space-y-1.5 pt-1">
          <label className="micro-label text-[#63637a] ml-0.5">Price ($)</label>
          <input
            type="number"
            value={autoPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="input-field font-mono"
          />
        </div>
      )}
    </div>
  );
}

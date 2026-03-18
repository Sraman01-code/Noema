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
    <div className="bg-neutral-900 rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-medium">Edit Listing Details</h3>

      <input
        className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm"
        value={data.name}
        onChange={(e) => updateField("name", e.target.value)}
        placeholder="Product name"
      />

      <input
        className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm"
        value={data.category}
        onChange={(e) => updateField("category", e.target.value)}
        placeholder="Category"
      />

      <div className="grid grid-cols-3 gap-3">
        <input
          className="bg-neutral-800 rounded-md px-3 py-2 text-sm"
          value={data.attributes.color}
          onChange={(e) => updateAttribute("color", e.target.value)}
          placeholder="Color"
        />
        <input
          className="bg-neutral-800 rounded-md px-3 py-2 text-sm"
          value={data.attributes.material}
          onChange={(e) => updateAttribute("material", e.target.value)}
          placeholder="Material"
        />
        <input
          className="bg-neutral-800 rounded-md px-3 py-2 text-sm"
          value={data.attributes.condition}
          onChange={(e) => updateAttribute("condition", e.target.value)}
          placeholder="Condition"
        />
      </div>

      {autoPrice != null && onPriceChange && (
        <div className="mt-3">
          <label className="text-xs text-neutral-400">Price ($)</label>
          <input
            type="number"
            value={autoPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full bg-neutral-800 rounded-md px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );
}

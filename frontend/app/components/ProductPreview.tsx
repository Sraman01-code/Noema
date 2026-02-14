"use client";

import { ProductAnalysis } from "@/lib/types";

type Props = {
  data: ProductAnalysis | null;
  loading: boolean;
  suggestedPrice?: number | null;
};

export default function ProductPreview({ data, loading, suggestedPrice }: Props) {
  if (loading) {
    return (
      <div className="bg-neutral-900 rounded-xl p-6 flex items-center justify-center">
        <p className="text-neutral-400">Analyzing product…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-neutral-900 rounded-xl p-6 flex items-center justify-center">
        <p className="text-neutral-600">Upload an image and run analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">{data.name}</h2>
      <p className="text-sm text-neutral-400">{data.category}</p>

      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        <span>Color: {data.attributes.color}</span>
        <span>Material: {data.attributes.material}</span>
        <span>Condition: {data.attributes.condition}</span>
      </div>

      <div className="mt-4">
        <div className="text-xs text-neutral-500 mb-1">Detection Confidence</div>
        <div className="w-full bg-neutral-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${data.confidence * 100}%` }}
          />
        </div>
      </div>

      {suggestedPrice != null && (
        <div className="mt-4 text-sm text-indigo-400 font-medium">
          Suggested Price: ${suggestedPrice.toFixed(2)}
        </div>
      )}
    </div>
  );
}

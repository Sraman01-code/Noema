"use client";

import { useState } from "react";
import { Review } from "@/lib/types";
import ReviewForm from "@/components/ReviewForm";

type Props = {
  productId: string;
  initialReviews: Review[];
};

export default function ProductReviews({
  productId,
  initialReviews,
}: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  function handleAddReview(input: {
    productId: string;
    rating: number;
    comment: string;
  }) {
    const newReview: Review = {
      id: crypto.randomUUID(),
      productId: input.productId,
      userId: "u1", // TEMP: replace with auth later
      rating: input.rating,
      comment: input.comment,
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-medium mb-3">
        Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No reviews yet.
        </p>
      ) : (
        <div className="space-y-3 mb-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-neutral-900 p-4 rounded-lg"
            >
              <div className="text-sm text-yellow-400 mb-1">
                ⭐ {r.rating}
              </div>
              <p className="text-sm text-neutral-200">
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      <ReviewForm
        productId={productId}
        onSubmit={handleAddReview}
      />
    </section>
  );
}

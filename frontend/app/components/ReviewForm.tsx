"use client";

import { useState } from "react";

type ReviewFormProps = {
  productId: string;
  onSubmit: (review: {
    productId: string;
    rating: number;
    comment: string;
  }) => void;
};

export default function ReviewForm({
  productId,
  onSubmit,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!comment.trim()) {
      setError("Please write a comment.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    setError(null);

    onSubmit({
      productId,
      rating,
      comment: comment.trim(),
    });

    // reset form
    setRating(5);
    setComment("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 bg-neutral-900 p-4 rounded-xl"
    >
      <h3 className="text-lg font-medium mb-3">
        Leave a review
      </h3>

      {error && (
        <p className="text-sm text-red-400 mb-2">
          {error}
        </p>
      )}

      {/* Rating */}
      <label className="block text-sm mb-1">
        Rating
      </label>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-full mb-3 bg-neutral-800 border border-neutral-700 rounded px-2 py-1"
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r} ⭐
          </option>
        ))}
      </select>

      {/* Comment */}
      <label className="block text-sm mb-1">
        Comment
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full min-h-[80px] bg-neutral-800 border border-neutral-700 rounded px-2 py-1 mb-3"
        placeholder="What did you think?"
      />

      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded text-sm font-medium"
      >
        Submit review
      </button>
    </form>
  );
}

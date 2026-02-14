import { Product } from "./types";

export function searchProducts(products: Product[], query: string) {
  if (!query.trim()) return products;

  const q = query.toLowerCase();

  return products.filter((p) => {
    const { name, category, attributes } = p.analysis;

    return (
      name.toLowerCase().includes(q) ||
      category.toLowerCase().includes(q) ||
      attributes.color.toLowerCase().includes(q) ||
      attributes.material.toLowerCase().includes(q)
    );
  });
}

import { Product } from "@/lib/types";
import { mockProducts } from "./mockData";

const STORAGE_KEY = "products_db";

export function getProducts(): Product[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts));
  return mockProducts;
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product: Product) {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
}

export function removeProduct(productId: string) {
  const products = getProducts().filter((product) => product.id !== productId);
  saveProducts(products);
  return products;
}

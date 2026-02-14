export type CategoryPath = string[]; // ["fashion", "shoes", "running"]

export type ProductAttributes = {
  color: string;
  material: string;
  condition: string;
};

export type ProductAnalysis = {
  name: string;
  category: string; // "Fashion → Shoes → Running"
  categoryPath: CategoryPath;
  attributes: ProductAttributes;
  confidence: number; // 0–1
};

export type Product = {
  id: string;
  image: string;
  analysis: ProductAnalysis;
  price: number;
  sellerId: string;
  createdAt: string;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number; // 1–5
  comment: string;
  createdAt: string;
};

/* 👇 User system */
export type UserRole = "buyer" | "seller";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  cart: CartItem[];

  
  isGuest: boolean;
};

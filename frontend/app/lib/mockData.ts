import { Product, Review } from "./types";

export const mockProducts: Product[] = [
  {
    id: "p1",
    image: "/assets/shoes.jpg",
    price: 89.99,
    sellerId: "s1",
    createdAt: new Date().toISOString(),
    analysis: {
      name: "Running Shoes",
      category: "Fashion → Shoes → Running",
      categoryPath: ["fashion", "shoes", "running"],
      confidence: 0.92,
      attributes: {
        color: "Black",
        material: "Mesh",
        condition: "New",
      },
    },
  },
  {
    id: "p2",
    image: "/assets/jacket.jpg",
    price: 129.0,
    sellerId: "s2",
    createdAt: new Date().toISOString(),
    analysis: {
      name: "Winter Jacket",
      category: "Fashion → Clothing → Jackets",
      categoryPath: ["fashion", "clothing", "jackets"],
      confidence: 0.87,
      attributes: {
        color: "Blue",
        material: "Polyester",
        condition: "New",
      },
    },
  },
  {
    id: "p3",
    image: "/assets/laptop.jpg",
    price: 799.0,
    sellerId: "s3",
    createdAt: new Date().toISOString(),
    analysis: {
      name: "Ultrabook Laptop",
      category: "Electronics → Computers → Laptops",
      categoryPath: ["electronics", "computers", "laptops"],
      confidence: 0.95,
      attributes: {
        color: "Silver",
        material: "Aluminum",
        condition: "Refurbished",
      },
    },
  },
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    productId: "p1",
    userId: "u1",
    rating: 5,
    comment: "Comfortable and great quality.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r2",
    productId: "p1",
    userId: "u2",
    rating: 4,
    comment: "Good shoes, delivery was fast.",
    createdAt: new Date().toISOString(),
  },
];

import { ProductAnalysis } from "./types";

export async function fakeAnalyzeProduct(): Promise<ProductAnalysis> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "Running Shoes",
        category: "Fashion → Shoes → Running",
        categoryPath: ["fashion", "shoes", "running"],
        attributes: {
          color: "Black",
          material: "Mesh",
          condition: "New",
        },
        confidence: 0.92,
      });
    }, 1200);
  });
}

export async function fakePriceSuggestion(
  analysis: ProductAnalysis
): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let basePrice = 50;

      if (analysis.attributes.material === "Leather") basePrice += 30;
      if (analysis.attributes.condition === "New") basePrice += 20;

      resolve(Math.round(basePrice));
    }, 500);
  });
}

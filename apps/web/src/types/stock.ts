import type { Article, StockLocation } from "../api";

export type InventoryComputedLine = {
  articleId: string;
  article: Article;
  locationId: string;
  location: StockLocation;
  theoretical: number;
  counted: number;
  good: number;
  repair: number;
  outOfService: number;
  gap: number;
  justification: string;
  countedAt?: string;
};

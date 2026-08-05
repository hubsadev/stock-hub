const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3200";

export type DashboardSummary = {
  articles: number;
  ruptures: number;
  movementsToday: number;
  equipmentAssigned: number;
};

export type Article = {
  id: string;
  code: string;
  designation: string;
  category: string;
  unit: string;
  trackingMode: "QUANTITY" | "INDIVIDUAL";
  minimumStock: number;
  referencePrice: string | number | null;
  active: boolean;
};

export type StockLevel = {
  id: string;
  quantity: number;
  article: Article;
  location: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API ${path} failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getDashboardSummary() {
  return request<DashboardSummary>("/dashboard-summary");
}

export function getArticles() {
  return request<Article[]>("/articles");
}

export function getStockLevels() {
  return request<StockLevel[]>("/stock-levels");
}
export type StockUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  active: boolean;
};

export function getUsers() {
  return request<StockUser[]>("/users");
}
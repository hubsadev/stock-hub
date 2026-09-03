export type ReferentialImportType =
  | "article"
  | "supplier"
  | "client"
  | "project"
  | "site"
  | "employee"
  | "location"
  | "teamService";

export type ReferentialImportRow = Record<string, any> & { errors: string[] };
export type ArticleImportRow = ReferentialImportRow;
export type InventoryImportRow = {
  articleCode: string;
  designation: string;
  location: string;
  theoretical: string;
  counted: string;
  good: string;
  repair: string;
  outOfService: string;
  justification: string;
  errors: string[];
};

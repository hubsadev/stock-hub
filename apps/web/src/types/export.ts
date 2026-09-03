export type ExcelColumnType = "text" | "number" | "currency" | "date";

export type ExcelExportColumn = {
  key: string;
  header: string;
  type?: ExcelColumnType;
  width?: number;
};

export type ExcelCellValue = string | number | Date | null | undefined;
export type ExcelExportRow = Record<string, ExcelCellValue>;

export type StockExportScope = "location" | "global";
export type InventoryExportScope = "location" | "global";

import type {
  ExcelCellValue,
  ExcelExportColumn,
  ExcelExportRow,
} from "../types/export";
import { formatDate } from "../utils/format";

export const stockHubExcelBlue = "3746F5";
export const stockHubExcelBorder = "CBD5E1";
export const stockHubExcelStripe = "F8FAFC";

export function csvValue(value: unknown) {
  const text = String(value ?? "").replace(/"/g, '""');
  return /[";\n\r]/.test(text) ? '"' + text + '"' : text;
}

export function toCsv(rows: Array<Array<unknown>>) {
  return rows.map((row) => row.map(csvValue).join(";")).join("\r\n");
}

export function downloadCsv(filename: string, rows: Array<Array<unknown>>) {
  const blob = new Blob(["\ufeff" + toCsv(rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function excelCellText(value: ExcelCellValue) {
  if (value instanceof Date) return formatDate(value);
  return String(value ?? "");
}

export function autoExcelColumnWidth(
  column: ExcelExportColumn,
  rows: ExcelExportRow[],
) {
  const contentWidth = rows.reduce(
    (max, row) => Math.max(max, excelCellText(row[column.key]).length + 2),
    column.header.length + 2,
  );
  return Math.min(Math.max(column.width ?? contentWidth, 12), 42);
}

export async function exportWorkbook(input: {
  filename: string;
  sheetName: string;
  columns: ExcelExportColumn[];
  rows: ExcelExportRow[];
}) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Stock Hub";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet(input.sheetName.slice(0, 31));
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.columns = input.columns.map((column) => ({
    key: column.key,
    header: column.header,
    width: autoExcelColumnWidth(column, input.rows),
  }));

  input.rows.forEach((row) => worksheet.addRow(row));

  const header = worksheet.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF" + stockHubExcelBlue },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
      left: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
      bottom: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
      right: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
    };
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF" + stockHubExcelStripe },
        };
      });
    }
    row.eachCell((cell, columnNumber) => {
      const column = input.columns[columnNumber - 1];
      cell.border = {
        top: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
        left: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
        bottom: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
        right: { style: "thin", color: { argb: "FF" + stockHubExcelBorder } },
      };
      if (rowNumber === 1) return;
      cell.alignment = {
        vertical: "middle",
        horizontal:
          column?.type === "number" || column?.type === "currency"
            ? "right"
            : column?.type === "date"
              ? "center"
              : "left",
      };
      if (column?.type === "currency") cell.numFmt = '#,##0.00';
      if (column?.type === "number") cell.numFmt = '#,##0';
      if (column?.type === "date") cell.numFmt = "dd/mm/yyyy";
    });
  });

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: input.columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = input.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportDateValue(value: string | Date | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

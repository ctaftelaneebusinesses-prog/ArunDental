// Builds a .csv file and triggers a browser download. No library needed —
// Excel opens .csv files directly, which is all "download as Excel sheet"
// needs in practice.
type Cell = string | number | null | undefined;

function escapeCell(value: Cell): string {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(filename: string, rows: Cell[][]): void {
  // Leading BOM so Excel reads the file as UTF-8 instead of guessing wrong.
  const csv = "﻿" + rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

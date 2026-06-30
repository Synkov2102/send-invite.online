export function sanitizeExcelCell(value: string) {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }

  return value;
}

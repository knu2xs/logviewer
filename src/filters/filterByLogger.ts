import type { ParsedLogRow } from '../core/models';

export function filterByLogger(rows: ParsedLogRow[], selectedLoggers: string[]): ParsedLogRow[] {
  if (selectedLoggers.length === 0) {
    return rows;
  }

  const loggerSet = new Set(selectedLoggers);

  return rows.filter((row) => loggerSet.has(row.logger));
}
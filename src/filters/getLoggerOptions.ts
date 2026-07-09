import type { ParsedLogRow } from '../core/models';

export function getLoggerOptions(rows: ParsedLogRow[]): string[] {
  return [...new Set(rows.map((row) => row.logger))].sort((left, right) => {
    const byName = left.localeCompare(right, undefined, { sensitivity: 'base' });

    return byName !== 0
      ? byName
      : left.localeCompare(right, undefined, { sensitivity: 'case', caseFirst: 'upper' });
  });
}
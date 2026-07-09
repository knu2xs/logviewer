import { SEVERITY_RANK, type ParsedLogRow, type SeverityValue } from '../core/models';

function normalizeSeverity(level: string): SeverityValue {
  const normalizedLevel = level.trim().toUpperCase();

  if (normalizedLevel in SEVERITY_RANK) {
    return normalizedLevel as SeverityValue;
  }

  return 'UNKNOWN';
}

export function filterBySeverity(rows: ParsedLogRow[], minimumLevel: SeverityValue): ParsedLogRow[] {
  if (minimumLevel === 'NOTSET') {
    return rows;
  }

  const minimumRank = SEVERITY_RANK[minimumLevel];

  return rows.filter((row) => {
    const severity = normalizeSeverity(row.level);

    if (severity === 'UNKNOWN') {
      return false;
    }

    return SEVERITY_RANK[severity] >= minimumRank;
  });
}

export { normalizeSeverity };
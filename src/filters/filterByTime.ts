import type { ParsedLogRow, TimeFilter } from '../core/models';

const TIME_FILTER_WINDOW_MS: Record<Exclude<TimeFilter, 'ALL' | 'CUSTOM'>, number> = {
  LAST_5_MINUTES: 5 * 60 * 1000,
  LAST_15_MINUTES: 15 * 60 * 1000,
  LAST_30_MINUTES: 30 * 60 * 1000,
  LAST_HOUR: 60 * 60 * 1000,
  LAST_6_HOURS: 6 * 60 * 60 * 1000,
  LAST_12_HOURS: 12 * 60 * 60 * 1000,
  LAST_24_HOURS: 24 * 60 * 60 * 1000,
};

export function getLatestTimestamp(rows: ParsedLogRow[]): Date | null {
  if (rows.length === 0) {
    return null;
  }

  return new Date(Math.max(...rows.map((row) => row.timestamp.getTime())));
}

export function filterByTime(
  rows: ParsedLogRow[],
  timeFilter: TimeFilter,
  latestTimestamp: Date | null,
  customStart: Date | null,
  customEnd: Date | null,
): ParsedLogRow[] {
  if (rows.length === 0 || timeFilter === 'ALL') {
    return rows;
  }

  if (timeFilter === 'CUSTOM') {
    if (!customStart || !customEnd || customStart > customEnd) {
      return rows;
    }

    return rows.filter((row) => row.timestamp >= customStart && row.timestamp <= customEnd);
  }

  if (!latestTimestamp) {
    return rows;
  }

  const rangeStart = new Date(latestTimestamp.getTime() - TIME_FILTER_WINDOW_MS[timeFilter]);

  return rows.filter((row) => row.timestamp >= rangeStart && row.timestamp <= latestTimestamp);
}
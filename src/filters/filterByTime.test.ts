import { describe, expect, it } from 'vitest';

import type { ParsedLogRow } from '../core/models';
import { filterByTime, getLatestTimestamp } from './filterByTime';

function createRow(id: string, timestamp: string): ParsedLogRow {
  return {
    id,
    sessionId: 'session-1',
    lineNumber: 1,
    timestamp: new Date(timestamp),
    logger: 'Portal.Security',
    level: 'INFO',
    message: 'Token accepted',
    sourceFile: 'sample.log',
    rawLine: '',
  };
}

describe('filterByTime', () => {
  const rows = [
    createRow('1', '2026-07-09T13:30:00'),
    createRow('2', '2026-07-09T14:15:00'),
    createRow('3', '2026-07-09T15:00:00'),
  ];

  it('returns rows within the last hour relative to the newest timestamp', () => {
    const latestTimestamp = getLatestTimestamp(rows);
    const result = filterByTime(rows, 'LAST_HOUR', latestTimestamp, null, null);

    expect(result.map((row) => row.id)).toEqual(['2', '3']);
  });

  it('returns rows within a valid custom range', () => {
    const result = filterByTime(
      rows,
      'CUSTOM',
      getLatestTimestamp(rows),
      new Date('2026-07-09T14:00:00'),
      new Date('2026-07-09T14:30:00'),
    );

    expect(result.map((row) => row.id)).toEqual(['2']);
  });

  it('returns the current rows unchanged when the custom range is invalid', () => {
    const result = filterByTime(
      rows,
      'CUSTOM',
      getLatestTimestamp(rows),
      new Date('2026-07-09T15:30:00'),
      new Date('2026-07-09T14:30:00'),
    );

    expect(result.map((row) => row.id)).toEqual(['1', '2', '3']);
  });
});
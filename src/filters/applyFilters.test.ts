import { describe, expect, it } from 'vitest';

import type { FilterState, ParsedLogRow } from '../core/models';
import { applyFilters } from './applyFilters';

function createRow(overrides: Partial<ParsedLogRow>): ParsedLogRow {
  return {
    id: 'row',
    sessionId: 'session-1',
    lineNumber: 1,
    timestamp: new Date('2026-07-09T14:00:00'),
    logger: 'Portal.Security',
    source: '',
    level: 'INFO',
    message: 'Token accepted',
    sourceFile: 'sample.log',
    rawLine: '',
    ...overrides,
  };
}

const defaultFilters: FilterState = {
  searchText: '',
  selectedSources: [],
  minimumLevel: 'NOTSET',
  timeFilter: 'ALL',
  customStart: null,
  customEnd: null,
};

describe('applyFilters', () => {
  const rows = [
    createRow({
      id: '1',
      logger: 'Portal.Security',
      source: 'Portal',
      level: 'INFO',
      message: 'Token accepted',
      timestamp: new Date('2026-07-09T14:00:00'),
    }),
    createRow({
      id: '2',
      logger: 'Portal.Security',
      source: 'Portal',
      level: 'ERROR',
      message: 'Token validation failed',
      timestamp: new Date('2026-07-09T14:15:00'),
    }),
    createRow({
      id: '3',
      logger: 'Portal.Indexer',
      source: 'Portal',
      level: 'WARNING',
      message: 'Indexer token cache warm',
      timestamp: new Date('2026-07-09T14:30:00'),
    }),
    createRow({
      id: '4',
      logger: 'ArcGIS.Server',
      source: 'Server',
      level: 'TRACE',
      message: 'Verbose transport update',
      timestamp: new Date('2026-07-09T15:00:00'),
    }),
  ];
  const latestTimestamp = new Date('2026-07-09T15:00:00');

  it('filters messages case-insensitively', () => {
    const result = applyFilters(rows, { ...defaultFilters, searchText: 'TOKEN' }, latestTimestamp);

    expect(result.map((row) => row.id)).toEqual(['1', '2', '3']);
  });

  it('filters by selected sources', () => {
    const result = applyFilters(
      rows,
      { ...defaultFilters, selectedSources: ['Portal.Security'] },
      latestTimestamp,
    );

    expect(result.map((row) => row.id)).toEqual(['1', '2']);
  });

  it('filters by source field values', () => {
    const result = applyFilters(
      rows,
      { ...defaultFilters, selectedSources: ['Portal'] },
      latestTimestamp,
    );

    expect(result.map((row) => row.id)).toEqual(['1', '2', '3']);
  });

  it('filters by minimum severity and hides unknown levels above NOTSET', () => {
    const result = applyFilters(
      rows,
      { ...defaultFilters, minimumLevel: 'WARNING' },
      latestTimestamp,
    );

    expect(result.map((row) => row.id)).toEqual(['2', '3']);
  });

  it('applies time filters relative to the latest dataset timestamp', () => {
    const result = applyFilters(
      rows,
      { ...defaultFilters, timeFilter: 'LAST_HOUR' },
      latestTimestamp,
    );

    expect(result.map((row) => row.id)).toEqual(['1', '2', '3', '4']);
  });

  it('applies combined filters together', () => {
    const result = applyFilters(
      rows,
      {
        ...defaultFilters,
        searchText: 'failed',
        selectedSources: ['Portal.Security'],
        minimumLevel: 'INFO',
        timeFilter: 'LAST_HOUR',
      },
      latestTimestamp,
    );

    expect(result.map((row) => row.id)).toEqual(['2']);
  });

  it('returns the original rows reference when no filters are active', () => {
    const result = applyFilters(rows, defaultFilters, latestTimestamp);

    expect(result).toBe(rows);
  });
});

import { describe, expect, it } from 'vitest';

import type { ParsedLogRow } from '../core/models';
import { getLoggerOptions } from './getLoggerOptions';

function createRow(logger: string): ParsedLogRow {
  return {
    id: logger,
    sessionId: 'session-1',
    lineNumber: 1,
    timestamp: new Date('2026-07-09T08:15:21'),
    logger,
    source: '',
    level: 'INFO',
    message: 'test',
    sourceFile: 'sample.log',
    rawLine: '',
  };
}

describe('getLoggerOptions', () => {
  it('returns unique logger values sorted alphabetically while preserving original casing', () => {
    const rows = [
      createRow('portal.Security'),
      createRow('ArcGIS.Server'),
      createRow('Portal.Security'),
      createRow('ArcGIS.Server'),
    ];

    expect(getLoggerOptions(rows)).toEqual(['ArcGIS.Server', 'Portal.Security', 'portal.Security']);
  });
});

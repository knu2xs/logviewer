import { describe, expect, it } from 'vitest';

import { parseLogImportContent, parseLogImportLine } from './logImportParser';

describe('logImportParser', () => {
  it('parses pipe-delimited lines with second precision', () => {
    const result = parseLogImportLine(
      '2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token',
      1,
      'session-1',
      'sample.log',
    );

    if (!result) {
      throw new Error('Expected parsed row');
    }

    expect(result.lineNumber).toBe(1);
    expect(result.sourceFile).toBe('sample.log');
    expect(result.logger).toBe('Portal.Security');
    expect(result.level).toBe('ERROR');
    expect(result.message).toBe('Unable to validate token');
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('parses pipe-delimited lines with millisecond timestamps', () => {
    const result = parseLogImportLine(
      '2026-07-09 10:38:56,927 | everett_attributerules | INFO | Configuration loaded',
      1,
      'session-1',
      'sample.log',
    );

    if (!result) {
      throw new Error('Expected parsed row');
    }

    expect(result.timestamp.getMilliseconds()).toBe(927);
  });

  it('ignores blank lines when parsing single-line input', () => {
    const result = parseLogImportLine('', 5, 'session-1', 'sample.log');

    expect(result).toBeNull();
  });

  it('parses content into rows and errors while ignoring trailing newline noise', () => {
    const result = parseLogImportContent(
      '2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token\n',
      'session-1',
      'sample.log',
    );

    expect(result.totalLines).toBe(1);
    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('handles empty content without errors', () => {
    const result = parseLogImportContent('', 'session-1', 'sample.log');

    expect(result.totalLines).toBe(0);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('appends continuation lines to the previous message and drops blank lines', () => {
    const result = parseLogImportContent(
      [
        '2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token',
        'Failed to execute (AddAttributeRule).',
        '',
        '2026-07-09 08:15:22,125 | Portal.Security | INFO | Token validation started',
      ].join('\n'),
      'session-1',
      'sample.log',
    );

    expect(result.totalLines).toBe(4);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0]?.message).toBe('Unable to validate token\nFailed to execute (AddAttributeRule).');
  });
});
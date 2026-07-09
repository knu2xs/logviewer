import { describe, expect, it } from 'vitest';

import { getSeverityOptions } from './getSeverityOptions';

describe('getSeverityOptions', () => {
  it('returns pipe-delimited options by default', () => {
    expect(getSeverityOptions('Python Pipe Delimited').map((option) => option.label)).toEqual([
      'NOTSET',
      'DEBUG',
      'INFO',
      'WARNING',
      'ERROR',
      'CRITICAL',
    ]);
  });

  it('returns ArcGIS Server levels', () => {
    expect(getSeverityOptions('ArcGIS Server').map((option) => option.label)).toEqual([
      'NOTSET',
      'Debug',
      'Verbose',
      'Info',
      'Warning',
      'Severe',
    ]);
  });

  it('returns ArcGIS Portal levels', () => {
    expect(getSeverityOptions('ArcGIS Portal').map((option) => option.label)).toEqual([
      'NOTSET',
      'Verbose',
      'Fine',
      'Info',
      'Warning',
      'Severe',
    ]);
  });
});

export const SEVERITY_VALUES = ['NOTSET', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'UNKNOWN'] as const;

export type SeverityValue = (typeof SEVERITY_VALUES)[number];

export const SEVERITY_RANK: Record<SeverityValue, number> = {
  NOTSET: 0,
  DEBUG: 10,
  INFO: 20,
  WARNING: 30,
  ERROR: 40,
  CRITICAL: 50,
  UNKNOWN: -1,
};
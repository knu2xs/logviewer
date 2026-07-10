export const SEVERITY_VALUES = [
  'NOTSET',
  'DEBUG',
  'VERBOSE',
  'FINEST',
  'FINER',
  'FINE',
  'CONFIG',
  'INFO',
  'WARNING',
  'ERROR',
  'SEVERE',
  'CRITICAL',
  'UNKNOWN',
] as const;

export type SeverityValue = (typeof SEVERITY_VALUES)[number];

export const SEVERITY_RANK: Record<SeverityValue, number> = {
  NOTSET: 0,
  DEBUG: 10,
  VERBOSE: 10,
  FINEST: 5,
  FINER: 7,
  FINE: 10,
  CONFIG: 15,
  INFO: 20,
  WARNING: 30,
  ERROR: 40,
  SEVERE: 40,
  CRITICAL: 50,
  UNKNOWN: -1,
};

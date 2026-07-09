export const TIME_FILTER_VALUES = [
  'ALL',
  'LAST_5_MINUTES',
  'LAST_15_MINUTES',
  'LAST_30_MINUTES',
  'LAST_HOUR',
  'LAST_6_HOURS',
  'LAST_12_HOURS',
  'LAST_24_HOURS',
  'CUSTOM',
] as const;

export type TimeFilter = (typeof TIME_FILTER_VALUES)[number];
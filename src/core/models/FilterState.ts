import type { SeverityValue } from './SeverityValue';
import type { TimeFilter } from './TimeFilter';

export interface FilterState {
  searchText: string;
  selectedLoggers: string[];
  minimumLevel: SeverityValue;
  timeFilter: TimeFilter;
  customStart: Date | null;
  customEnd: Date | null;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchText: '',
  selectedLoggers: [],
  minimumLevel: 'NOTSET',
  timeFilter: 'ALL',
  customStart: null,
  customEnd: null,
};
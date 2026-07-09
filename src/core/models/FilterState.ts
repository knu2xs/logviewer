import type { SeverityValue } from './SeverityValue';
import type { TimeFilter } from './TimeFilter';

export interface FilterState {
  searchText: string;
  selectedSources: string[];
  minimumLevel: SeverityValue;
  timeFilter: TimeFilter;
  customStart: Date | null;
  customEnd: Date | null;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  searchText: '',
  selectedSources: [],
  minimumLevel: 'NOTSET',
  timeFilter: 'ALL',
  customStart: null,
  customEnd: null,
};

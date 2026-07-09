import type { FilterState, ParsedLogRow } from '../core/models';

import { filterByLogger } from './filterByLogger';
import { filterByMessage } from './filterByMessage';
import { filterBySeverity } from './filterBySeverity';
import { filterByTime, getLatestTimestamp } from './filterByTime';

export function applyFilters(
  rows: ParsedLogRow[],
  filterState: FilterState,
  latestTimestamp = getLatestTimestamp(rows),
): ParsedLogRow[] {
  const hasSearch = filterState.searchText.trim() !== '';
  const hasSourceFilter = filterState.selectedSources.length > 0;
  const hasSeverityFilter = filterState.minimumLevel !== 'NOTSET';
  const hasTimeFilter = filterState.timeFilter !== 'ALL';

  if (!hasSearch && !hasSourceFilter && !hasSeverityFilter && !hasTimeFilter) {
    return rows;
  }

  return filterByMessage(
    filterBySeverity(
      filterByLogger(
        filterByTime(
          rows,
          filterState.timeFilter,
          latestTimestamp,
          filterState.customStart,
          filterState.customEnd,
        ),
        filterState.selectedSources,
      ),
      filterState.minimumLevel,
    ),
    filterState.searchText,
  );
}

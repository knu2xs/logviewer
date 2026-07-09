import { create } from 'zustand';

import {
  DEFAULT_FILTER_STATE,
  type FilterState,
  type SeverityValue,
  type TimeFilter,
} from '../core/models';

export interface LogFilterState {
  filters: FilterState;
  customRangeDraftStart: Date | null;
  customRangeDraftEnd: Date | null;
  customRangeError: string | null;
  setSearchText: (searchText: string) => void;
  clearSearchText: () => void;
  setSelectedSources: (selectedSources: string[]) => void;
  setMinimumLevel: (minimumLevel: SeverityValue) => void;
  setTimeFilter: (timeFilter: TimeFilter) => void;
  setCustomRange: (customStart: Date | null, customEnd: Date | null) => void;
  resetFilters: () => void;
}

function createDefaultFilters(): FilterState {
  return {
    ...DEFAULT_FILTER_STATE,
  };
}

export const useLogFilterStore = create<LogFilterState>((set) => ({
  filters: createDefaultFilters(),
  customRangeDraftStart: null,
  customRangeDraftEnd: null,
  customRangeError: null,
  setSearchText: (searchText) =>
    set((state) => ({
      filters: {
        ...state.filters,
        searchText,
      },
    })),
  clearSearchText: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        searchText: '',
      },
    })),
  setSelectedSources: (selectedSources) =>
    set((state) => ({
      filters: {
        ...state.filters,
        selectedSources: [...new Set(selectedSources)],
      },
    })),
  setMinimumLevel: (minimumLevel) =>
    set((state) => ({
      filters: {
        ...state.filters,
        minimumLevel,
      },
    })),
  setTimeFilter: (timeFilter) =>
    set((state) => ({
      customRangeError: null,
      filters: {
        ...state.filters,
        timeFilter,
      },
    })),
  setCustomRange: (customStart, customEnd) =>
    set((state) => {
      const nextState = {
        customRangeDraftStart: customStart,
        customRangeDraftEnd: customEnd,
        customRangeError: null,
        filters: {
          ...state.filters,
          timeFilter: 'CUSTOM' as const,
        },
      };

      if (!customStart || !customEnd) {
        return nextState;
      }

      if (customStart > customEnd) {
        return {
          ...nextState,
          customRangeError: 'Start date/time must be before end date/time.',
        };
      }

      return {
        ...nextState,
        filters: {
          ...nextState.filters,
          customStart,
          customEnd,
        },
      };
    }),
  resetFilters: () =>
    set({
      filters: createDefaultFilters(),
      customRangeDraftStart: null,
      customRangeDraftEnd: null,
      customRangeError: null,
    }),
}));

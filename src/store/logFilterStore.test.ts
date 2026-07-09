import { beforeEach, describe, expect, it } from 'vitest';

import { useLogFilterStore } from './logFilterStore';

describe('useLogFilterStore', () => {
  beforeEach(() => {
    useLogFilterStore.getState().resetFilters();
  });

  it('starts with the default filter state', () => {
    expect(useLogFilterStore.getState().filters).toEqual({
      searchText: '',
      selectedLoggers: [],
      minimumLevel: 'NOTSET',
      timeFilter: 'ALL',
      customStart: null,
      customEnd: null,
    });
  });

  it('updates filter values and resets them to defaults', () => {
    const state = useLogFilterStore.getState();
    const start = new Date('2026-07-09T09:00:00');
    const end = new Date('2026-07-09T10:00:00');

    state.setSearchText('token');
    state.setSelectedLoggers(['Portal.Security', 'Portal.Security']);
    state.setMinimumLevel('ERROR');
    state.setCustomRange(start, end);

    expect(useLogFilterStore.getState().filters).toEqual({
      searchText: 'token',
      selectedLoggers: ['Portal.Security'],
      minimumLevel: 'ERROR',
      timeFilter: 'CUSTOM',
      customStart: start,
      customEnd: end,
    });

    state.resetFilters();

    expect(useLogFilterStore.getState().filters).toEqual({
      searchText: '',
      selectedLoggers: [],
      minimumLevel: 'NOTSET',
      timeFilter: 'ALL',
      customStart: null,
      customEnd: null,
    });
  });

  it('preserves the last valid custom range when the next draft range is invalid', () => {
    const state = useLogFilterStore.getState();
    const validStart = new Date('2026-07-09T09:00:00');
    const validEnd = new Date('2026-07-09T10:00:00');
    const invalidStart = new Date('2026-07-09T11:00:00');

    state.setCustomRange(validStart, validEnd);
    state.setCustomRange(invalidStart, validEnd);

    expect(useLogFilterStore.getState().filters.customStart).toEqual(validStart);
    expect(useLogFilterStore.getState().filters.customEnd).toEqual(validEnd);
    expect(useLogFilterStore.getState().customRangeDraftStart).toEqual(invalidStart);
    expect(useLogFilterStore.getState().customRangeDraftEnd).toEqual(validEnd);
    expect(useLogFilterStore.getState().customRangeError).toBe('Start date/time must be before end date/time.');
  });

  it('clears custom range drafts and errors on reset for empty-result recovery', () => {
    const state = useLogFilterStore.getState();
    const validStart = new Date('2026-07-09T09:00:00');
    const validEnd = new Date('2026-07-09T10:00:00');
    const invalidStart = new Date('2026-07-09T11:00:00');

    state.setCustomRange(validStart, validEnd);
    state.setCustomRange(invalidStart, validEnd);
    state.resetFilters();

    expect(useLogFilterStore.getState().customRangeDraftStart).toBeNull();
    expect(useLogFilterStore.getState().customRangeDraftEnd).toBeNull();
    expect(useLogFilterStore.getState().customRangeError).toBeNull();
  });
});
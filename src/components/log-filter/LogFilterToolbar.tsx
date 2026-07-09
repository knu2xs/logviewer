import { ActionIcon, MultiSelect, Select, Stack, TextInput } from '@mantine/core';

import type { FilterState, SeverityValue } from '../../core/models';
import { LogTimeFilter } from './LogTimeFilter';

const FILTER_COMBOBOX_PROPS = {
  zIndex: 2000,
};

const SEVERITY_OPTIONS: Array<{ label: string; value: SeverityValue }> = [
  { label: 'NOTSET', value: 'NOTSET' },
  { label: 'DEBUG', value: 'DEBUG' },
  { label: 'INFO', value: 'INFO' },
  { label: 'WARNING', value: 'WARNING' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'CRITICAL', value: 'CRITICAL' },
];

interface LogFilterToolbarProps {
  filters: FilterState;
  loggerOptions: string[];
  customRangeDraftStart: Date | null;
  customRangeDraftEnd: Date | null;
  customRangeError: string | null;
  onSearchTextChange: (value: string) => void;
  onClearSearch: () => void;
  onSelectedLoggersChange: (value: string[]) => void;
  onMinimumLevelChange: (value: SeverityValue) => void;
  onTimeFilterChange: (value: FilterState['timeFilter']) => void;
  onCustomRangeChange: (customStart: Date | null, customEnd: Date | null) => void;
}

export function LogFilterToolbar({
  filters,
  loggerOptions,
  customRangeDraftStart,
  customRangeDraftEnd,
  customRangeError,
  onSearchTextChange,
  onClearSearch,
  onSelectedLoggersChange,
  onMinimumLevelChange,
  onTimeFilterChange,
  onCustomRangeChange,
}: LogFilterToolbarProps) {
  return (
    <Stack gap="md" className="log-filter-toolbar">
      <TextInput
        label="Search messages"
        placeholder="Search messages..."
        value={filters.searchText}
        onChange={(event) => onSearchTextChange(event.currentTarget.value)}
        rightSection={
          filters.searchText ? (
            <ActionIcon variant="subtle" aria-label="Clear search" onClick={onClearSearch}>
              <span style={{ fontWeight: 700 }}>
                ×
              </span>
            </ActionIcon>
          ) : null
        }
      />

      <div className="log-filter-controls-grid">
        <LogTimeFilter
          value={filters.timeFilter}
          customStart={customRangeDraftStart}
          customEnd={customRangeDraftEnd}
          customRangeError={customRangeError}
          onTimeFilterChange={onTimeFilterChange}
          onCustomRangeChange={onCustomRangeChange}
        />

        <MultiSelect
          label="Logger names"
          placeholder="All Loggers"
          data={loggerOptions}
          value={filters.selectedLoggers}
          onChange={onSelectedLoggersChange}
          comboboxProps={FILTER_COMBOBOX_PROPS}
          clearable
          searchable
        />

        <Select
          label="Minimum severity"
          data={SEVERITY_OPTIONS}
          value={filters.minimumLevel}
          onChange={(nextValue) => onMinimumLevelChange((nextValue as SeverityValue | null) ?? 'NOTSET')}
          comboboxProps={FILTER_COMBOBOX_PROPS}
        />
      </div>
    </Stack>
  );
}
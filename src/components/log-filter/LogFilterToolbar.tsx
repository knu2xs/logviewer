import { ActionIcon, MultiSelect, Select, Stack, TextInput } from '@mantine/core';

import type { FilterState, SeverityValue } from '../../core/models';
import type { SeverityOption } from '../../filters/getSeverityOptions';
import { LogTimeFilter } from './LogTimeFilter';

const FILTER_COMBOBOX_PROPS = {
  zIndex: 2000,
};

interface LogFilterToolbarProps {
  filters: FilterState;
  sourceOptions: string[];
  sourceFilterLabel: string;
  sourceFilterPlaceholder: string;
  severityOptions: SeverityOption[];
  customRangeDraftStart: Date | null;
  customRangeDraftEnd: Date | null;
  customRangeError: string | null;
  onSearchTextChange: (value: string) => void;
  onClearSearch: () => void;
  onSelectedSourcesChange: (value: string[]) => void;
  onMinimumLevelChange: (value: SeverityValue) => void;
  onTimeFilterChange: (value: FilterState['timeFilter']) => void;
  onCustomRangeChange: (customStart: Date | null, customEnd: Date | null) => void;
}

export function LogFilterToolbar({
  filters,
  sourceOptions,
  sourceFilterLabel,
  sourceFilterPlaceholder,
  severityOptions,
  customRangeDraftStart,
  customRangeDraftEnd,
  customRangeError,
  onSearchTextChange,
  onClearSearch,
  onSelectedSourcesChange,
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
              <span style={{ fontWeight: 700 }}>×</span>
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
          label={sourceFilterLabel}
          placeholder={sourceFilterPlaceholder}
          data={sourceOptions}
          value={filters.selectedSources}
          onChange={onSelectedSourcesChange}
          comboboxProps={FILTER_COMBOBOX_PROPS}
          clearable
          searchable
        />

        <Select
          label="Minimum severity"
          data={severityOptions}
          value={filters.minimumLevel}
          onChange={(nextValue) =>
            onMinimumLevelChange((nextValue as SeverityValue | null) ?? 'NOTSET')
          }
          comboboxProps={FILTER_COMBOBOX_PROPS}
        />
      </div>
    </Stack>
  );
}

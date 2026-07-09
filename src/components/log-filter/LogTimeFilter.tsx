import { Group, Select, Text, TextInput } from '@mantine/core';

import type { TimeFilter } from '../../core/models';

const TIME_FILTER_OPTIONS: Array<{ label: string; value: TimeFilter }> = [
  { label: 'All Entries', value: 'ALL' },
  { label: 'Last 5 Minutes', value: 'LAST_5_MINUTES' },
  { label: 'Last 15 Minutes', value: 'LAST_15_MINUTES' },
  { label: 'Last 30 Minutes', value: 'LAST_30_MINUTES' },
  { label: 'Last Hour', value: 'LAST_HOUR' },
  { label: 'Last 6 Hours', value: 'LAST_6_HOURS' },
  { label: 'Last 12 Hours', value: 'LAST_12_HOURS' },
  { label: 'Last 24 Hours', value: 'LAST_24_HOURS' },
  { label: 'Custom Range', value: 'CUSTOM' },
];

interface LogTimeFilterProps {
  value: TimeFilter;
  customStart: Date | null;
  customEnd: Date | null;
  customRangeError: string | null;
  onTimeFilterChange: (value: TimeFilter) => void;
  onCustomRangeChange: (customStart: Date | null, customEnd: Date | null) => void;
}

function formatDateTimeLocal(value: Date | null): string {
  if (!value) {
    return '';
  }

  const pad = (segment: number) => String(segment).padStart(2, '0');

  return [
    value.getFullYear(),
    '-',
    pad(value.getMonth() + 1),
    '-',
    pad(value.getDate()),
    'T',
    pad(value.getHours()),
    ':',
    pad(value.getMinutes()),
  ].join('');
}

function parseDateTimeLocal(value: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function LogTimeFilter({
  value,
  customStart,
  customEnd,
  customRangeError,
  onTimeFilterChange,
  onCustomRangeChange,
}: LogTimeFilterProps) {
  return (
    <Group align="flex-end" gap="md" className="log-filter-time-group">
      <Select
        label="Time window"
        value={value}
        data={TIME_FILTER_OPTIONS}
        onChange={(nextValue) => onTimeFilterChange((nextValue as TimeFilter | null) ?? 'ALL')}
        w={220}
      />

      {value === 'CUSTOM' ? (
        <>
          <TextInput
            label="Start date/time"
            type="datetime-local"
            value={formatDateTimeLocal(customStart)}
            onChange={(event) => onCustomRangeChange(parseDateTimeLocal(event.currentTarget.value), customEnd)}
            error={customRangeError}
          />
          <TextInput
            label="End date/time"
            type="datetime-local"
            value={formatDateTimeLocal(customEnd)}
            onChange={(event) => onCustomRangeChange(customStart, parseDateTimeLocal(event.currentTarget.value))}
            error={customRangeError}
          />
          <Text size="sm" c="dimmed">
            Custom ranges are evaluated against timestamps in the imported dataset.
          </Text>
        </>
      ) : null}
    </Group>
  );
}
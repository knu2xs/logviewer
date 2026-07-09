import { Button, Group, Stack, Text } from '@mantine/core';

import type { FilteredResultSummary } from '../../core/models';

interface FilteredResultsSummaryProps {
  summary: FilteredResultSummary;
  onClearFilters: () => void;
}

export function FilteredResultsSummary({ summary, onClearFilters }: FilteredResultsSummaryProps) {
  return (
    <Group justify="space-between" align="flex-start" className="log-filter-summary">
      <Stack gap={2}>
        <Text fw={600}>
          Showing {summary.visibleCount.toLocaleString()} of {summary.totalCount.toLocaleString()} entries
        </Text>
        <Text size="sm" c="dimmed">
          {summary.latestTimestamp
            ? `Latest log timestamp: ${summary.latestTimestamp.toLocaleString()}`
            : 'No timestamps are available yet.'}
        </Text>
      </Stack>

      {summary.hasActiveFilters ? (
        <Button variant="light" onClick={onClearFilters} aria-label="Clear all filters">
          Clear all filters
        </Button>
      ) : null}
    </Group>
  );
}
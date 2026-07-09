import { Button, Card, Stack, Text, Title } from '@mantine/core';

interface FilteredResultsEmptyStateProps {
  totalCount: number;
  onClearFilters: () => void;
}

export function FilteredResultsEmptyState({ totalCount, onClearFilters }: FilteredResultsEmptyStateProps) {
  return (
    <Card withBorder radius="md" padding="lg" className="log-filter-empty-state">
      <Stack gap="sm">
        <Title order={3} size="h4">
          No results for current filters
        </Title>
        <Text c="dimmed">
          Your current filters hide all {totalCount.toLocaleString()} imported entries. Clear filters to
          restore the dataset instantly.
        </Text>
        <Button variant="filled" onClick={onClearFilters} aria-label="Clear all filters from empty state">
          Clear all filters
        </Button>
      </Stack>
    </Card>
  );
}
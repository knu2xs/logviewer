import React from 'react';
import { Alert, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { LogImportResultsGrid } from '../components/log-import/LogImportResultsGrid';
import { LogImportSummary } from '../components/log-import/LogImportSummary';
import { FilteredResultsSummary } from '../components/log-filter/FilteredResultsSummary';
import { LogFilterToolbar } from '../components/log-filter/LogFilterToolbar';
import type { FilteredResultSummary } from '../core/models';
import { applyFilters } from '../filters/applyFilters';
import { getLoggerOptions } from '../filters/getLoggerOptions';
import { getLatestTimestamp } from '../filters/filterByTime';
import { useLogFilterStore } from '../store/logFilterStore';
import { useLogImportStore } from '../store/logImportStore';

export const HomePage: React.FC = () => {
  const session = useLogImportStore((state) => state.session);
  const errorMessage = useLogImportStore((state) => state.errorMessage);
  const importLogFile = useLogImportStore((state) => state.importLogFile);
  const resetImport = useLogImportStore((state) => state.resetImport);
  const filters = useLogFilterStore((state) => state.filters);
  const setSearchText = useLogFilterStore((state) => state.setSearchText);
  const clearSearchText = useLogFilterStore((state) => state.clearSearchText);
  const setSelectedLoggers = useLogFilterStore((state) => state.setSelectedLoggers);
  const setMinimumLevel = useLogFilterStore((state) => state.setMinimumLevel);
  const setTimeFilter = useLogFilterStore((state) => state.setTimeFilter);
  const setCustomRange = useLogFilterStore((state) => state.setCustomRange);
  const resetFilters = useLogFilterStore((state) => state.resetFilters);
  const customRangeDraftStart = useLogFilterStore((state) => state.customRangeDraftStart);
  const customRangeDraftEnd = useLogFilterStore((state) => state.customRangeDraftEnd);
  const customRangeError = useLogFilterStore((state) => state.customRangeError);
  const [debouncedSearchText] = useDebouncedValue(filters.searchText, 250);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await importLogFile(file);
    event.target.value = '';
  };

  const isImporting = session?.status === 'importing';
  const rows = session?.rows ?? [];
  const latestTimestamp = React.useMemo(() => getLatestTimestamp(rows), [rows]);
  const loggerOptions = React.useMemo(() => getLoggerOptions(rows), [rows]);
  const effectiveFilters = React.useMemo(
    () => ({
      ...filters,
      searchText: debouncedSearchText,
    }),
    [debouncedSearchText, filters],
  );
  const filteredRows = React.useMemo(
    () => applyFilters(rows, effectiveFilters, latestTimestamp),
    [effectiveFilters, latestTimestamp, rows],
  );
  const totalRowCount = rows.length;
  const hasActiveFilters = React.useMemo(
    () =>
      filters.searchText.trim() !== '' ||
      filters.selectedLoggers.length > 0 ||
      filters.minimumLevel !== 'NOTSET' ||
      filters.timeFilter !== 'ALL',
    [filters.minimumLevel, filters.searchText, filters.selectedLoggers, filters.timeFilter],
  );
  const filteredSummary = React.useMemo<FilteredResultSummary>(
    () => ({
      visibleCount: filteredRows.length,
      totalCount: totalRowCount,
      hasActiveFilters,
      isEmptyResult: hasActiveFilters && filteredRows.length === 0 && totalRowCount > 0,
      latestTimestamp,
    }),
    [filteredRows.length, hasActiveFilters, latestTimestamp, totalRowCount],
  );
  const selectedFileName = session?.sourceFileName ?? 'No file selected';
  const emptyStateMessage =
    hasActiveFilters && totalRowCount > 0
      ? 'No log entries match the current filters. Adjust filters above or clear all filters to continue.'
      : 'The import completed but no valid rows were found.';

  return (
    <Stack gap="lg" className="log-import-page">
      <Paper withBorder radius="lg" p="xl" className="log-import-hero">
        <Stack gap="md">
          <div>
            <Title order={2}>Import a log file</Title>
            <Text c="dimmed" mt="xs">
              Open a local log file to inspect parsed rows, malformed lines, and import metadata in
              one place.
            </Text>
          </div>

          <Group align="flex-end" gap="md" className="log-import-actions">
            <label className={`log-import-file-picker${isImporting ? ' is-disabled' : ''}`}>
              <input
                className="log-import-file-input"
                aria-label="Open Log File"
                type="file"
                accept=".log,.txt,text/plain"
                onChange={handleFileChange}
                disabled={isImporting}
              />
              <Button component="span" variant="light" disabled={isImporting}>
                Choose File
              </Button>
              <Text
                size="sm"
                c={session?.sourceFileName ? undefined : 'dimmed'}
                className="log-import-file-name"
              >
                {selectedFileName}
              </Text>
            </label>

            <Button onClick={resetImport} variant="light" disabled={!session && !errorMessage}>
              Clear results
            </Button>
          </Group>

          {errorMessage ? (
            <Alert color="red" title="Import failed">
              {errorMessage}
            </Alert>
          ) : null}
        </Stack>
      </Paper>

      <LogImportSummary session={session} errorMessage={errorMessage} />

      <LogImportResultsGrid
        session={session}
        rows={filteredRows}
        emptyStateMessage={emptyStateMessage}
        filterControls={
          session?.status === 'complete' ? (
            <LogFilterToolbar
              filters={filters}
              loggerOptions={loggerOptions}
              customRangeDraftStart={customRangeDraftStart}
              customRangeDraftEnd={customRangeDraftEnd}
              customRangeError={customRangeError}
              onSearchTextChange={setSearchText}
              onClearSearch={clearSearchText}
              onSelectedLoggersChange={setSelectedLoggers}
              onMinimumLevelChange={setMinimumLevel}
              onTimeFilterChange={setTimeFilter}
              onCustomRangeChange={setCustomRange}
            />
          ) : null
        }
        summaryContent={
          session?.status === 'complete' ? (
            <FilteredResultsSummary summary={filteredSummary} onClearFilters={resetFilters} />
          ) : null
        }
      />
    </Stack>
  );
};

export default HomePage;

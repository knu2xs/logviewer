import React from 'react';
import { Alert, Button, Group, Modal, Paper, Stack, Text, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

import { LogImportResultsGrid } from '../components/log-import/LogImportResultsGrid';
import { LogImportSummary } from '../components/log-import/LogImportSummary';
import { FilteredResultsSummary } from '../components/log-filter/FilteredResultsSummary';
import { LogFilterToolbar } from '../components/log-filter/LogFilterToolbar';
import type { FilteredResultSummary, SourceFormat } from '../core/models';
import { applyFilters } from '../filters/applyFilters';
import { getLoggerOptions } from '../filters/getLoggerOptions';
import { getLatestTimestamp } from '../filters/filterByTime';
import { getSeverityOptions } from '../filters/getSeverityOptions';
import { useLogFilterStore } from '../store/logFilterStore';
import { useLogImportStore } from '../store/logImportStore';

function shouldUseSourceFilterLabel(sourceFormat: SourceFormat | null | undefined): boolean {
  return sourceFormat === 'ArcGIS Portal' || sourceFormat === 'ArcGIS Server';
}

export const HomePage: React.FC = () => {
  const session = useLogImportStore((state) => state.session);
  const errorMessage = useLogImportStore((state) => state.errorMessage);
  const importLogFile = useLogImportStore((state) => state.importLogFile);
  const resetImport = useLogImportStore((state) => state.resetImport);
  const filters = useLogFilterStore((state) => state.filters);
  const setSearchText = useLogFilterStore((state) => state.setSearchText);
  const clearSearchText = useLogFilterStore((state) => state.clearSearchText);
  const setSelectedSources = useLogFilterStore((state) => state.setSelectedSources);
  const setMinimumLevel = useLogFilterStore((state) => state.setMinimumLevel);
  const setTimeFilter = useLogFilterStore((state) => state.setTimeFilter);
  const setCustomRange = useLogFilterStore((state) => state.setCustomRange);
  const resetFilters = useLogFilterStore((state) => state.resetFilters);
  const customRangeDraftStart = useLogFilterStore((state) => state.customRangeDraftStart);
  const customRangeDraftEnd = useLogFilterStore((state) => state.customRangeDraftEnd);
  const customRangeError = useLogFilterStore((state) => state.customRangeError);
  const [dismissedUnrecognizedSessionId, setDismissedUnrecognizedSessionId] = React.useState<
    string | null
  >(null);
  const [debouncedSearchText] = useDebouncedValue(filters.searchText, 250);
  const rows = React.useMemo(() => session?.rows ?? [], [session]);
  const severityOptions = React.useMemo(
    () => getSeverityOptions(session?.sourceFormat),
    [session?.sourceFormat],
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await importLogFile(file);
    event.target.value = '';
  };

  const isImporting = session?.status === 'importing';
  const latestTimestamp = React.useMemo(() => getLatestTimestamp(rows), [rows]);
  const sourceOptions = React.useMemo(() => {
    const useSourceField = shouldUseSourceFilterLabel(session?.sourceFormat);

    if (useSourceField) {
      return getLoggerOptions(rows.map((row) => ({ ...row, logger: row.source || '' })));
    }

    return getLoggerOptions(rows);
  }, [rows, session?.sourceFormat]);
  const sourceFilterLabel = shouldUseSourceFilterLabel(session?.sourceFormat)
    ? 'Source'
    : 'Logger names';
  const sourceFilterPlaceholder = shouldUseSourceFilterLabel(session?.sourceFormat)
    ? 'All Sources'
    : 'All Loggers';
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
      filters.selectedSources.length > 0 ||
      filters.minimumLevel !== 'NOTSET' ||
      filters.timeFilter !== 'ALL',
    [filters.minimumLevel, filters.searchText, filters.selectedSources, filters.timeFilter],
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
  const hasNoParsedRows =
    session?.status === 'complete' && session.totalLines > 0 && session.rows.length === 0;
  const isUnrecognizedFormatModalOpen =
    Boolean(hasNoParsedRows) && session !== null && dismissedUnrecognizedSessionId !== session.id;

  return (
    <Stack gap="lg" className="log-import-page">
      <Modal
        opened={isUnrecognizedFormatModalOpen}
        onClose={() => setDismissedUnrecognizedSessionId(session?.id ?? null)}
        title="Unrecognized Log Format"
        centered
      >
        <Stack gap="xs">
          <Text size="sm">
            The selected file could not be associated with a supported log format because no lines
            were parsed successfully.
          </Text>
          <Text size="sm" c="dimmed">
            Supported formats currently include Python pipe-delimited logs, ArcGIS XML logs, and
            Tomcat logs.
          </Text>
        </Stack>
      </Modal>

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
              sourceOptions={sourceOptions}
              sourceFilterLabel={sourceFilterLabel}
              sourceFilterPlaceholder={sourceFilterPlaceholder}
              severityOptions={severityOptions}
              customRangeDraftStart={customRangeDraftStart}
              customRangeDraftEnd={customRangeDraftEnd}
              customRangeError={customRangeError}
              onSearchTextChange={setSearchText}
              onClearSearch={clearSearchText}
              onSelectedSourcesChange={setSelectedSources}
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

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button, Card, Checkbox, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, RowClickedEvent } from 'ag-grid-community';

import type { ImportSession } from '../../core/models/ImportSession';
import type { ParsedLogRow } from '../../core/models/ParsedLogRow';
import { SEVERITY_RANK } from '../../core/models/SeverityValue';
import type { SourceFormat } from '../../core/models/SourceFormat';

ModuleRegistry.registerModules([AllCommunityModule]);

interface LogImportResultsGridProps {
  session: ImportSession | null;
  rows?: ParsedLogRow[];
  emptyStateMessage?: string;
  filterControls?: ReactNode;
  summaryContent?: ReactNode;
}

type ColumnField = 'timestamp' | 'logger' | 'source' | 'level' | 'message';

interface ColumnOption {
  label: string;
  value: ColumnField;
}

const COLUMN_OPTIONS: ColumnOption[] = [
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'Logger', value: 'logger' },
  { label: 'Source', value: 'source' },
  { label: 'Level', value: 'level' },
  { label: 'Message', value: 'message' },
];

const DEFAULT_VISIBLE_COLUMNS: ColumnField[] = COLUMN_OPTIONS.map((option) => option.value);

function getColumnOptionsForFormat(sourceFormat: SourceFormat | null | undefined): ColumnOption[] {
  if (sourceFormat === 'Python Pipe Delimited') {
    return COLUMN_OPTIONS.filter((option) => option.value !== 'source');
  }

  if (sourceFormat === 'ArcGIS Portal' || sourceFormat === 'ArcGIS Server') {
    return COLUMN_OPTIONS.filter((option) => option.value !== 'logger');
  }

  return COLUMN_OPTIONS;
}

type LevelTone = 'debug' | 'info' | 'warning' | 'error';

function getLevelTone(level: string): LevelTone {
  const normalized = level.toUpperCase();

  if (normalized === 'DEBUG' || normalized === 'VERBOSE' || normalized === 'FINE') {
    return 'debug';
  }

  if (normalized === 'INFO') {
    return 'info';
  }

  if (normalized === 'WARNING') {
    return 'warning';
  }

  const severityRank = SEVERITY_RANK[normalized as keyof typeof SEVERITY_RANK];

  if (typeof severityRank === 'number' && severityRank >= SEVERITY_RANK.ERROR) {
    return 'error';
  }

  return 'error';
}

const columnDefs: Array<ColDef<ParsedLogRow> & { field: ColumnField }> = [
  {
    field: 'timestamp',
    headerName: 'Timestamp',
    flex: 1.1,
    minWidth: 180,
    valueFormatter: ({ value }) => (value instanceof Date ? value.toLocaleString() : '—'),
  },
  {
    field: 'logger',
    headerName: 'Logger',
    flex: 0.9,
    minWidth: 160,
    valueFormatter: ({ value }) => value || '—',
  },
  {
    field: 'source',
    headerName: 'Source',
    flex: 0.9,
    minWidth: 160,
    valueFormatter: ({ value }) => value || '—',
  },
  {
    field: 'level',
    headerName: 'Level',
    width: 140,
    cellRenderer: ({ value }: { value: unknown }) => {
      const levelLabel = typeof value === 'string' && value.trim() !== '' ? value : '—';
      const tone = getLevelTone(levelLabel);

      return <span className={`log-level-tag log-level-tag--${tone}`}>{levelLabel}</span>;
    },
  },
  {
    field: 'message',
    headerName: 'Message',
    flex: 2,
    minWidth: 260,
    valueFormatter: ({ value }) => (value ? value : '(blank line)'),
  },
];

export function LogImportResultsGrid({
  session,
  rows,
  emptyStateMessage,
  filterControls,
  summaryContent,
}: LogImportResultsGridProps) {
  const [visibleColumns, setVisibleColumns] = useState<ColumnField[]>(DEFAULT_VISIBLE_COLUMNS);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ParsedLogRow | null>(null);
  const columnOptions = useMemo(
    () => getColumnOptionsForFormat(session?.sourceFormat),
    [session?.sourceFormat],
  );
  const allowedColumnValues = useMemo(
    () => new Set(columnOptions.map((option) => option.value)),
    [columnOptions],
  );
  const defaultVisibleColumns = useMemo(
    () => columnOptions.map((option) => option.value),
    [columnOptions],
  );
  const rowData = rows ?? session?.rows ?? [];
  const showSourceField = session?.sourceFormat !== 'Python Pipe Delimited';
  const showLoggerField =
    session?.sourceFormat !== 'ArcGIS Portal' && session?.sourceFormat !== 'ArcGIS Server';
  const effectiveVisibleColumns = useMemo(() => {
    const normalized = visibleColumns.filter((column) => allowedColumnValues.has(column));

    if (normalized.length === 0) {
      return defaultVisibleColumns;
    }

    return normalized;
  }, [allowedColumnValues, defaultVisibleColumns, visibleColumns]);
  const hasHiddenColumns = effectiveVisibleColumns.length !== columnOptions.length;
  const displayedColumnDefs = useMemo(
    () =>
      columnDefs.map((column) => ({
        ...column,
        hide:
          !allowedColumnValues.has(column.field) || !effectiveVisibleColumns.includes(column.field),
      })),
    [allowedColumnValues, effectiveVisibleColumns],
  );

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isExpanded]);

  if (!session) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Stack gap="xs">
          <Title order={3} size="h4">
            Parsed Logfile
          </Title>
          <Text c="dimmed">Open a log file to see parsed rows here.</Text>
        </Stack>
      </Card>
    );
  }

  if (session.status === 'importing') {
    return (
      <Card withBorder radius="md" padding="lg">
        <Stack gap="xs">
          <Title order={3} size="h4">
            Parsed Logfile
          </Title>
          <Text c="dimmed">Importing the selected file...</Text>
        </Stack>
      </Card>
    );
  }

  const toggleColumn = (columnValue: ColumnField) => {
    setVisibleColumns((current) =>
      current.includes(columnValue)
        ? current.filter((value) => value !== columnValue)
        : [...current, columnValue],
    );
  };

  const resetColumns = () => {
    setVisibleColumns(defaultVisibleColumns);
  };

  const hasRows = rowData.length > 0;
  const closeRowDetails = () => setSelectedRow(null);

  const handleRowClick = (event: RowClickedEvent<ParsedLogRow>) => {
    if (event.data) {
      setSelectedRow(event.data);
    }
  };

  return (
    <Card
      withBorder
      radius="md"
      padding="lg"
      className={
        isExpanded
          ? 'log-import-results-card log-import-results-card--expanded'
          : 'log-import-results-card'
      }
    >
      <Stack
        gap="sm"
        className={
          isExpanded
            ? 'log-import-results-stack log-import-results-stack--expanded'
            : 'log-import-results-stack'
        }
      >
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3} size="h4">
              Parsed Logfile
            </Title>
          </div>
          <Button
            size="xs"
            variant="light"
            onClick={() => setIsExpanded((current) => !current)}
            aria-label={isExpanded ? 'Minimize parsed rows panel' : 'Maximize parsed rows panel'}
          >
            {isExpanded ? 'Minimize' : 'Maximize'}
          </Button>
        </Group>

        {summaryContent ? <div className="log-import-inline-summary">{summaryContent}</div> : null}

        {filterControls ? <div className="log-import-inline-filters">{filterControls}</div> : null}

        {hasRows ? (
          <Stack gap={6} className="log-import-column-visibility">
            <Group justify="space-between" align="center">
              <Text fw={600} size="sm">
                Visible columns
              </Text>
              <Button
                size="xs"
                variant="light"
                onClick={resetColumns}
                disabled={!hasHiddenColumns}
                aria-label="Reset columns"
              >
                Reset columns
              </Button>
            </Group>
            <Group gap="md" className="log-import-column-visibility-options">
              {columnOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={visibleColumns.includes(option.value)}
                  onChange={() => toggleColumn(option.value)}
                  aria-label={`Toggle ${option.label} column`}
                />
              ))}
            </Group>
          </Stack>
        ) : null}

        {hasRows ? (
          <div
            className={isExpanded ? 'log-import-grid log-import-grid--expanded' : 'log-import-grid'}
          >
            <AgGridReact<ParsedLogRow>
              rowData={rowData}
              columnDefs={displayedColumnDefs}
              domLayout="normal"
              defaultColDef={{ sortable: true, resizable: true }}
              onRowClicked={handleRowClick}
              theme={themeQuartz}
              suppressCellFocus
              animateRows={false}
            />
          </div>
        ) : (
          <Text c="dimmed">
            {emptyStateMessage ?? 'The import completed but no valid rows were found.'}
          </Text>
        )}
      </Stack>

      <Modal
        opened={selectedRow !== null}
        onClose={closeRowDetails}
        title="Log Entry Details"
        centered
        size="xl"
        zIndex={3000}
      >
        {selectedRow ? (
          <Stack gap="sm" className="log-entry-modal-content">
            <Text>
              <Text component="span" fw={700}>
                Timestamp:{' '}
              </Text>
              {selectedRow.timestamp.toLocaleString()}
            </Text>
            {showLoggerField ? (
              <Text>
                <Text component="span" fw={700}>
                  Logger:{' '}
                </Text>
                {selectedRow.logger || '—'}
              </Text>
            ) : null}
            {showSourceField ? (
              <Text>
                <Text component="span" fw={700}>
                  Source:{' '}
                </Text>
                {selectedRow.source || '—'}
              </Text>
            ) : null}
            <Text>
              <Text component="span" fw={700}>
                Level:{' '}
              </Text>
              {selectedRow.level || '—'}
            </Text>
            <Text>
              <Text component="span" fw={700}>
                Source File:{' '}
              </Text>
              {selectedRow.sourceFile}
            </Text>
            <Text>
              <Text component="span" fw={700}>
                Source Line:{' '}
              </Text>
              {selectedRow.lineNumber}
            </Text>
            <div className="log-entry-modal-message">
              <Text fw={700} mb={4}>
                Message
              </Text>
              <Text className="log-entry-modal-message-text">
                {selectedRow.message || '(blank line)'}
              </Text>
            </div>
            {selectedRow.attributes && Object.keys(selectedRow.attributes).length > 0 ? (
              <div className="log-entry-modal-message">
                <Text fw={700} mb={4}>
                  XML attributes
                </Text>
                <Stack gap={4}>
                  {Object.entries(selectedRow.attributes).map(([attributeName, attributeValue]) => (
                    <Text key={attributeName} size="sm">
                      <Text component="span" fw={700}>
                        {attributeName}:{' '}
                      </Text>
                      {attributeValue || '—'}
                    </Text>
                  ))}
                </Stack>
              </div>
            ) : null}
          </Stack>
        ) : null}
      </Modal>
    </Card>
  );
}

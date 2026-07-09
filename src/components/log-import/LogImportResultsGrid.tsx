import { useMemo, useState } from 'react';
import { Button, Card, Checkbox, Group, Stack, Text, Title } from '@mantine/core';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';

import type { ImportSession } from '../../core/models/ImportSession';
import type { ParsedLogRow } from '../../core/models/ParsedLogRow';

ModuleRegistry.registerModules([AllCommunityModule]);

interface LogImportResultsGridProps {
  session: ImportSession | null;
  rows?: ParsedLogRow[];
  emptyStateMessage?: string;
}

type ColumnField = 'timestamp' | 'logger' | 'level' | 'message' | 'sourceFile';

interface ColumnOption {
  label: string;
  value: ColumnField;
}

const COLUMN_OPTIONS: ColumnOption[] = [
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'Logger', value: 'logger' },
  { label: 'Level', value: 'level' },
  { label: 'Message', value: 'message' },
  { label: 'Source File', value: 'sourceFile' },
];

const DEFAULT_VISIBLE_COLUMNS: ColumnField[] = COLUMN_OPTIONS.map((option) => option.value);

const columnDefs: Array<ColDef<ParsedLogRow> & { field: ColumnField }> = [
  {
    field: 'timestamp',
    headerName: 'Timestamp',
    flex: 1.1,
    minWidth: 180,
    valueFormatter: ({ value }) => (value instanceof Date ? value.toLocaleString() : '—'),
  },
  { field: 'logger', headerName: 'Logger', flex: 0.9, minWidth: 160, valueFormatter: ({ value }) => value || '—' },
  { field: 'level', headerName: 'Level', width: 120, valueFormatter: ({ value }) => value || '—' },
  {
    field: 'message',
    headerName: 'Message',
    flex: 2,
    minWidth: 260,
    valueFormatter: ({ value }) => (value ? value : '(blank line)'),
  },
  { field: 'sourceFile', headerName: 'Source File', flex: 1, minWidth: 180 },
];

export function LogImportResultsGrid({ session, rows, emptyStateMessage }: LogImportResultsGridProps) {
  const [visibleColumns, setVisibleColumns] = useState<ColumnField[]>(DEFAULT_VISIBLE_COLUMNS);
  const hasHiddenColumns = visibleColumns.length !== COLUMN_OPTIONS.length;

  if (!session) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Stack gap="xs">
          <Title order={3} size="h4">
            Parsed rows
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
            Parsed rows
          </Title>
          <Text c="dimmed">Importing the selected file...</Text>
        </Stack>
      </Card>
    );
  }

  const rowData = rows ?? session.rows;
  const displayedColumnDefs = useMemo(
    () =>
      columnDefs.map((column) => ({
        ...column,
        hide: !visibleColumns.includes(column.field),
      })),
    [visibleColumns],
  );

  const toggleColumn = (columnValue: ColumnField) => {
    setVisibleColumns((current) =>
      current.includes(columnValue)
        ? current.filter((value) => value !== columnValue)
        : [...current, columnValue],
    );
  };

  const resetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  };

  if (rowData.length === 0) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Stack gap="xs">
          <Title order={3} size="h4">
            Parsed rows
          </Title>
          <Text c="dimmed">{emptyStateMessage ?? 'The import completed but no valid rows were found.'}</Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap="sm">
        <div>
          <Title order={3} size="h4">
            Parsed rows
          </Title>
          <Text c="dimmed">Rows are virtualized for large files.</Text>
        </div>

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
            {COLUMN_OPTIONS.map((option) => (
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

        <div className="log-import-grid">
          <AgGridReact<ParsedLogRow>
            rowData={rowData}
            columnDefs={displayedColumnDefs}
            domLayout="normal"
            defaultColDef={{ sortable: true, resizable: true }}
            theme={themeQuartz}
            suppressCellFocus
            animateRows={false}
          />
        </div>
      </Stack>
    </Card>
  );
}
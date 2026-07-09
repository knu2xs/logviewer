import { Card, Stack, Text, Title } from '@mantine/core';
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

const columnDefs: ColDef<ParsedLogRow>[] = [
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

        <div className="log-import-grid">
          <AgGridReact<ParsedLogRow>
            rowData={rowData}
            columnDefs={columnDefs}
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
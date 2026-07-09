import { Alert, Badge, Card, Group, List, Stack, Text, Title } from '@mantine/core';

import type { ImportSession } from '../../core/models/ImportSession';

interface LogImportSummaryProps {
  session: ImportSession | null;
  errorMessage: string | null;
}

function formatTimestamp(value: Date | null): string {
  return value ? value.toLocaleString() : 'Not completed yet';
}

export function LogImportSummary({ session, errorMessage }: LogImportSummaryProps) {
  if (!session) {
    return (
      <Card withBorder radius="md" padding="lg">
        <Stack gap="xs">
          <Title order={3} size="h4">
            Import summary
          </Title>
          <Text c="dimmed">Select a log file to see its import details here.</Text>
        </Stack>
      </Card>
    );
  }

  const statusLabel = session.status === 'failed' ? 'failed' : session.status;
  const continuedRows = session.rows.filter((row) => row.hadContinuationLines === true);

  return (
    <Stack gap="md">
      <Card withBorder radius="md" padding="lg">
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={3} size="h4">
                Import summary
              </Title>
              <Text c="dimmed" size="sm">
                {session.sourceFileName || 'No file selected yet'}
              </Text>
              <Text c="dimmed" size="sm">
                Source format: {session.sourceFormat}
              </Text>
            </div>
            <Badge variant="light" color={statusLabel === 'failed' ? 'red' : 'blue'}>
              {statusLabel}
            </Badge>
          </Group>

          <Group gap="lg">
            <div>
              <Text size="xs" tt="uppercase" c="dimmed">
                Source size
              </Text>
              <Text fw={600}>{session.sourceFileSize.toLocaleString()} bytes</Text>
            </div>
            <div>
              <Text size="xs" tt="uppercase" c="dimmed">
                Started
              </Text>
              <Text fw={600}>{formatTimestamp(session.startedAt)}</Text>
            </div>
            <div>
              <Text size="xs" tt="uppercase" c="dimmed">
                Completed
              </Text>
              <Text fw={600}>{formatTimestamp(session.completedAt)}</Text>
            </div>
          </Group>

          <Group gap="lg">
            <div>
              <Text size="xs" tt="uppercase" c="dimmed">
                Total lines
              </Text>
              <Text fw={600}>{session.totalLines}</Text>
            </div>
            <div>
              <Text size="xs" tt="uppercase" c="dimmed">
                Valid rows
              </Text>
              <Text fw={600}>{session.validEntryCount}</Text>
            </div>
            <div>
              <Text size="xs" tt="uppercase" c="dimmed">
                Parse errors
              </Text>
              <Text fw={600}>{session.parseErrorCount}</Text>
            </div>
          </Group>

          <Text size="sm" c="dimmed">
            Importing a new file resets all active filters to keep results scoped to the latest
            dataset.
          </Text>
        </Stack>
      </Card>

      {errorMessage ? (
        <Alert color="red" title="Import error">
          {errorMessage}
        </Alert>
      ) : null}

      {session.errors.length > 0 ? (
        <Card withBorder radius="md" padding="lg">
          <Stack gap="xs">
            <Title order={4} size="h5">
              Parse errors
            </Title>
            <Text c="dimmed" size="sm">
              {session.errors.length} lines could not be parsed.
            </Text>
          </Stack>
        </Card>
      ) : null}

      {continuedRows.length > 0 ? (
        <Card withBorder radius="md" padding="lg">
          <Stack gap="xs">
            <Title order={4} size="h5">
              Parsing Messages
            </Title>
            <Text c="dimmed" size="sm">
              Parsing checks and normalization notes are summarized here, including wrapped entries
              merged back into a single message.
            </Text>
            <List spacing="xs" size="sm">
              {continuedRows.map((row) => (
                <List.Item key={row.id}>
                  <Text component="span" fw={600}>
                    Line {row.lineNumber}:
                  </Text>{' '}
                  <Text component="span" style={{ whiteSpace: 'pre-wrap' }}>
                    {row.message}
                  </Text>
                </List.Item>
              ))}
            </List>
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}

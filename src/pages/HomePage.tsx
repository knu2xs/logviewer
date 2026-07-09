import React from 'react';
import { Alert, Button, Group, Paper, Stack, Text, Title } from '@mantine/core';

import { LogImportResultsGrid } from '../components/log-import/LogImportResultsGrid';
import { LogImportSummary } from '../components/log-import/LogImportSummary';
import { useLogImportStore } from '../store/logImportStore';

export const HomePage: React.FC = () => {
  const session = useLogImportStore((state) => state.session);
  const errorMessage = useLogImportStore((state) => state.errorMessage);
  const importLogFile = useLogImportStore((state) => state.importLogFile);
  const resetImport = useLogImportStore((state) => state.resetImport);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await importLogFile(file);
    event.target.value = '';
  };

  const isImporting = session?.status === 'importing';

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
            <label className="log-import-file-picker">
              <span className="log-import-file-picker-label">Select file</span>
              <input
                aria-label="Open Log File"
                type="file"
                accept=".log,.txt,text/plain"
                onChange={handleFileChange}
                disabled={isImporting}
              />
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
      <LogImportResultsGrid session={session} />
    </Stack>
  );
};

export default HomePage;

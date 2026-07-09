/**
 * AppShell Component
 *
 * Mantine-based application shell with a header, main content area,
 * and footer. This provides the structural wrapper for the app.
 */

import { AppShell as MantineAppShell, Container, Group, Text, Title } from '@mantine/core';
import type { PropsWithChildren } from 'react';

type AppShellProps = PropsWithChildren;

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <MantineAppShell
      header={{ height: 76 }}
      footer={{ height: 60 }}
      padding="md"
      styles={{
        main: {
          background: 'var(--color-surface)',
        },
      }}
    >
      <MantineAppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" align="center">
            <div>
              <Title order={1} size="h3">
                Log Viewer
              </Title>
              <Text c="dimmed" size="sm">
                Foundation shell
              </Text>
            </div>
            <Text size="sm" c="dimmed">
              Navigation placeholder
            </Text>
          </Group>
        </Container>
      </MantineAppShell.Header>

      <MantineAppShell.Main>
        <Container size="xl">{children}</Container>
      </MantineAppShell.Main>

      <MantineAppShell.Footer>
        <Container size="xl" h="100%">
          <Group h="100%" justify="center" align="center">
            <Text size="sm" c="dimmed">
              &copy; 2026 Log Viewer. All rights reserved.
            </Text>
          </Group>
        </Container>
      </MantineAppShell.Footer>
    </MantineAppShell>
  );
};

export default AppShell;

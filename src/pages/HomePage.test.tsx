import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it } from 'vitest';

import { HomePage } from './HomePage';
import { useLogImportStore } from '../store/logImportStore';

describe('HomePage', () => {
  beforeEach(() => {
    useLogImportStore.setState({
      session: null,
      errorMessage: null,
    });
  });

  it('renders the log import entry points and empty-state panels', () => {
    const html = renderToStaticMarkup(
      <MantineProvider defaultColorScheme="light">
        <HomePage />
      </MantineProvider>,
    );

    expect(html).toContain('Import a log file');
    expect(html).toContain('Open a local log file to inspect parsed rows');
    expect(html).toContain('Open Log File');
    expect(html).toContain('Import summary');
    expect(html).toContain('Parsed rows');
  });
});
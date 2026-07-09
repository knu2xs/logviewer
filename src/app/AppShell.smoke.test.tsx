import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import App from '../App';

describe('App shell smoke test', () => {
  it('renders the application shell with header, main content, and footer', () => {
    const html = renderToStaticMarkup(
      <MantineProvider defaultColorScheme="light">
        <App />
      </MantineProvider>,
    );

    expect(html).toContain('<header');
    expect(html).toContain('<main');
    expect(html).toContain('<footer');
    expect(html).toContain('Log Viewer');
    expect(html).toContain('Welcome to Log Viewer');
  });
});

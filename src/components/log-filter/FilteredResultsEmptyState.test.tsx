import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { FilteredResultsEmptyState } from './FilteredResultsEmptyState';

describe('FilteredResultsEmptyState', () => {
  it('renders recovery guidance and clear action', () => {
    const onClearFilters = vi.fn();

    const html = renderToStaticMarkup(
      <MantineProvider defaultColorScheme="light">
        <FilteredResultsEmptyState totalCount={1234} onClearFilters={onClearFilters} />
      </MantineProvider>,
    );

    expect(html).toContain('No results for current filters');
    expect(html).toContain('hide all 1,234 imported entries');
    expect(html).toContain('Clear all filters');
  });
});

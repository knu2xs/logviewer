import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { FilteredResultsSummary } from './FilteredResultsSummary';

describe('FilteredResultsSummary', () => {
  it('renders visible and total counts with clear action for active filters', () => {
    const onClearFilters = vi.fn();

    const html = renderToStaticMarkup(
      <MantineProvider defaultColorScheme="light">
        <FilteredResultsSummary
          summary={{
            visibleCount: 12,
            totalCount: 1200,
            hasActiveFilters: true,
            isEmptyResult: false,
            latestTimestamp: new Date('2026-07-09T15:00:00'),
          }}
          onClearFilters={onClearFilters}
        />
      </MantineProvider>,
    );

    expect(html).toContain('Showing 12 of 1,200 entries');
    expect(html).toContain('Latest log timestamp');
    expect(html).toContain('Clear all filters');
  });
});

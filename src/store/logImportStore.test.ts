import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLogImportStore } from './logImportStore';

function createMockFile(content: string, name = 'sample.log'): File {
  return new File([content], name, { type: 'text/plain' });
}

describe('useLogImportStore', () => {
  beforeEach(() => {
    useLogImportStore.setState({
      session: null,
      errorMessage: null,
    });
  });

  it('imports a valid file and stores rows', async () => {
    await useLogImportStore.getState().importLogFile(
      createMockFile('2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token'),
    );

    const state = useLogImportStore.getState();

    expect(state.errorMessage).toBeNull();
    expect(state.session?.status).toBe('complete');
    expect(state.session?.sourceFileName).toBe('sample.log');
    expect(state.session?.rows).toHaveLength(1);
    expect(state.session?.errors).toHaveLength(0);
    expect(state.session?.validEntryCount).toBe(1);
  });

  it('appends continuation lines without blocking valid rows', async () => {
    await useLogImportStore.getState().importLogFile(
      createMockFile(
        [
          '2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token',
          'Failed to execute (AddAttributeRule).',
          '',
          '2026-07-09 08:15:22,125 | Portal.Security | INFO | Token validation started',
        ].join('\n'),
      ),
    );

    const state = useLogImportStore.getState();

    expect(state.session?.rows).toHaveLength(2);
    expect(state.session?.errors).toHaveLength(0);
    expect(state.session?.parseErrorCount).toBe(0);
    expect(state.session?.validEntryCount).toBe(2);
    expect(state.session?.rows[0]?.message).toBe('Unable to validate token\nFailed to execute (AddAttributeRule).');
  });

  it('handles empty files as successful empty imports', async () => {
    await useLogImportStore.getState().importLogFile(createMockFile(''));

    const state = useLogImportStore.getState();

    expect(state.session?.status).toBe('complete');
    expect(state.session?.totalLines).toBe(0);
    expect(state.session?.rows).toHaveLength(0);
    expect(state.session?.errors).toHaveLength(0);
  });

  it('records file read failures', async () => {
    const failingFile = {
      name: 'broken.log',
      size: 12,
      text: vi.fn(() => Promise.reject(new Error('boom'))),
    } as unknown as File;

    await useLogImportStore.getState().importLogFile(failingFile);

    const state = useLogImportStore.getState();

    expect(state.session?.status).toBe('failed');
    expect(state.errorMessage).toBe('boom');
  });

  it('resets the current import session', async () => {
    await useLogImportStore.getState().importLogFile(
      createMockFile('2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token'),
    );

    useLogImportStore.getState().resetImport();

    expect(useLogImportStore.getState().session).toBeNull();
    expect(useLogImportStore.getState().errorMessage).toBeNull();
  });
});
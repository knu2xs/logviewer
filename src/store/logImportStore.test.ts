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
    await useLogImportStore
      .getState()
      .importLogFile(
        createMockFile('2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token'),
      );

    const state = useLogImportStore.getState();

    expect(state.errorMessage).toBeNull();
    expect(state.session?.status).toBe('complete');
    expect(state.session?.sourceFileName).toBe('sample.log');
    expect(state.session?.sourceFormat).toBe('Python Pipe Delimited');
    expect(state.session?.rows).toHaveLength(1);
    expect(state.session?.errors).toHaveLength(0);
    expect(state.session?.validEntryCount).toBe(1);
  });

  it('appends continuation lines without blocking valid rows', async () => {
    await useLogImportStore
      .getState()
      .importLogFile(
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
    expect(state.session?.rows[0]?.message).toBe(
      'Unable to validate token\nFailed to execute (AddAttributeRule).',
    );
  });

  it('detects ArcGIS Portal imports and stores the source format', async () => {
    await useLogImportStore
      .getState()
      .importLogFile(
        createMockFile(
          '<Msg time="2026-07-08T13:16:10,748" type="INFO" code="217039" source="Portal" process="39264" thread="1" methodName="" machine="ESRI-AKVMBDOUSN.ESRI.COM" user="" elapsed="0.0" requestID="">Log Service started.</Msg>',
          'portal.log',
        ),
      );

    const state = useLogImportStore.getState();

    expect(state.session?.sourceFormat).toBe('ArcGIS Portal');
    expect(state.session?.rows[0]?.attributes?.source).toBe('Portal');
  });

  it('detects Tomcat imports and stores logger/source fields', async () => {
    await useLogImportStore
      .getState()
      .importLogFile(
        createMockFile(
          [
            'Jul 01, 2026 3:30:01 PM org.apache.catalina.startup.VersionLoggerListener log',
            'INFO: Server version name:   Apache Tomcat/10.1.34',
          ].join('\n'),
          'tomcat.log',
        ),
      );

    const state = useLogImportStore.getState();

    expect(state.session?.sourceFormat).toBe('Tomcat');
    expect(state.session?.rows[0]?.logger).toBe(
      'org.apache.catalina.startup.VersionLoggerListener',
    );
    expect(state.session?.rows[0]?.source).toBe('log');
    expect(state.session?.rows[0]?.level).toBe('INFO');
  });

  it('re-imports as a fresh session when selecting another file', async () => {
    const state = useLogImportStore.getState();

    await state.importLogFile(
      createMockFile(
        '2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token',
        'pipe.log',
      ),
    );

    const firstSession = useLogImportStore.getState().session;

    await state.importLogFile(
      createMockFile(
        [
          'Jul 01, 2026 3:30:01 PM org.apache.catalina.startup.VersionLoggerListener log',
          'INFO: Server version name:   Apache Tomcat/10.1.34',
        ].join('\n'),
        'tomcat.log',
      ),
    );

    const secondSession = useLogImportStore.getState().session;

    expect(firstSession?.sourceFormat).toBe('Python Pipe Delimited');
    expect(firstSession?.sourceFileName).toBe('pipe.log');
    expect(firstSession?.rows).toHaveLength(1);

    expect(secondSession?.sourceFormat).toBe('Tomcat');
    expect(secondSession?.sourceFileName).toBe('tomcat.log');
    expect(secondSession?.rows).toHaveLength(1);
    expect(secondSession?.rows[0]?.logger).toBe(
      'org.apache.catalina.startup.VersionLoggerListener',
    );
    expect(secondSession?.id).not.toBe(firstSession?.id);
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
    await useLogImportStore
      .getState()
      .importLogFile(
        createMockFile('2026-07-09 08:15:21 | Portal.Security | ERROR | Unable to validate token'),
      );

    useLogImportStore.getState().resetImport();

    expect(useLogImportStore.getState().session).toBeNull();
    expect(useLogImportStore.getState().errorMessage).toBeNull();
  });
});

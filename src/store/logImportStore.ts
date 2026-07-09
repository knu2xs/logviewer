import { create } from 'zustand';

import { parseLogImportContent } from '../core/parsers/logImportParser';
import type { ImportSession, ImportSessionStatus } from '../core/models/ImportSession';
import { useLogFilterStore } from './logFilterStore';

export interface LogImportState {
  session: ImportSession | null;
  errorMessage: string | null;
  importLogFile: (file: File) => Promise<void>;
  resetImport: () => void;
}

function createSessionId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `import-${Date.now()}`;
}

function createEmptySession(id: string): ImportSession {
  return {
    id,
    sourceFileName: '',
    sourceFileSize: 0,
    sourceFormat: 'Unknown',
    startedAt: new Date(),
    completedAt: null,
    status: 'idle',
    totalLines: 0,
    validEntryCount: 0,
    parseErrorCount: 0,
    rows: [],
    errors: [],
  };
}

function finalizeSession(
  session: ImportSession,
  updates: Partial<
    Pick<
      ImportSession,
      | 'status'
      | 'completedAt'
      | 'totalLines'
      | 'validEntryCount'
      | 'parseErrorCount'
      | 'rows'
      | 'errors'
      | 'sourceFormat'
    >
  >,
): ImportSession {
  return {
    ...session,
    ...updates,
  };
}

export const useLogImportStore = create<LogImportState>((set) => ({
  session: null,
  errorMessage: null,
  importLogFile: async (file: File) => {
    const sessionId = createSessionId();
    const startedAt = new Date();

    useLogFilterStore.getState().resetFilters();

    set({
      errorMessage: null,
      session: {
        ...createEmptySession(sessionId),
        sourceFileName: file.name,
        sourceFileSize: file.size,
        sourceFormat: 'Unknown',
        startedAt,
        status: 'importing',
      },
    });

    try {
      const content = await file.text();
      const parsed = parseLogImportContent(content, sessionId, file.name);
      const completedAt = new Date();

      set((state) => ({
        session: finalizeSession(state.session ?? createEmptySession(sessionId), {
          status: 'complete',
          completedAt,
          totalLines: parsed.totalLines,
          validEntryCount: parsed.rows.length,
          parseErrorCount: parsed.errors.length,
          rows: parsed.rows,
          errors: parsed.errors,
          sourceFormat: parsed.sourceFormat,
        }),
      }));
    } catch (error) {
      const completedAt = new Date();
      const message = error instanceof Error ? error.message : 'Unable to read the selected file.';

      set((state) => ({
        errorMessage: message,
        session: finalizeSession(state.session ?? createEmptySession(sessionId), {
          status: 'failed',
          completedAt,
        }),
      }));
    }
  },
  resetImport: () =>
    set({
      session: null,
      errorMessage: null,
    }),
}));

export type { ImportSessionStatus };

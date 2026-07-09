import type { ParseError } from './ParseError';
import type { ParsedLogRow } from './ParsedLogRow';

export type ImportSessionStatus = 'idle' | 'importing' | 'complete' | 'failed';

export interface ImportSession {
  id: string;
  sourceFileName: string;
  sourceFileSize: number;
  startedAt: Date;
  completedAt: Date | null;
  status: ImportSessionStatus;
  totalLines: number;
  validEntryCount: number;
  parseErrorCount: number;
  rows: ParsedLogRow[];
  errors: ParseError[];
}
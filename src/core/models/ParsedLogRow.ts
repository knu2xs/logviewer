export interface ParsedLogRow {
  id: string;
  sessionId: string;
  lineNumber: number;
  timestamp: Date;
  logger: string;
  source: string;
  level: string;
  message: string;
  sourceFile: string;
  rawLine: string;
  hadContinuationLines?: boolean;
  attributes?: Record<string, string>;
}

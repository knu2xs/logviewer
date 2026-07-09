export interface ParsedLogRow {
  id: string;
  sessionId: string;
  lineNumber: number;
  timestamp: Date;
  logger: string;
  level: string;
  message: string;
  sourceFile: string;
  rawLine: string;
}
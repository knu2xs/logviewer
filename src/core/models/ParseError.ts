export interface ParseError {
  id: string;
  sessionId: string;
  lineNumber: number;
  rawLine: string;
  reason: string;
}
import type { ParseError } from '../models/ParseError';
import type { ParsedLogRow } from '../models/ParsedLogRow';

export interface LogImportParseResult {
  rows: ParsedLogRow[];
  errors: ParseError[];
  totalLines: number;
}

interface ParsedFields {
  timestamp: Date;
  logger: string;
  level: string;
  message: string;
}

const LOG_LINE_PATTERN =
  /^(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:[.,]\d{1,3})?)\s*\|\s*(?<logger>[^|]+?)\s*\|\s*(?<level>[^|]+?)\s*\|\s*(?<message>.+)$/;

function createIdentifier(prefix: string, sessionId: string, lineNumber: number): string {
  return `${prefix}-${sessionId}-${lineNumber}`;
}

function parseTimestamp(timestampText: string): Date | null {
  const match = timestampText.trim().match(
    /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2}) (?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:[.,](?<millisecond>\d{1,3}))?$/,
  );

  if (!match?.groups) {
    return null;
  }

  const year = Number(match.groups.year);
  const month = Number(match.groups.month) - 1;
  const day = Number(match.groups.day);
  const hour = Number(match.groups.hour);
  const minute = Number(match.groups.minute);
  const second = Number(match.groups.second);
  const millisecond = Number((match.groups.millisecond ?? '0').padEnd(3, '0'));

  const date = new Date(year, month, day, hour, minute, second, millisecond);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    return null;
  }

  return date;
}

function parseFields(line: string): ParsedFields | null {
  const match = line.match(LOG_LINE_PATTERN);

  if (!match?.groups) {
    return null;
  }

  const timestamp = parseTimestamp(match.groups.timestamp);

  if (!timestamp) {
    return null;
  }

  return {
    timestamp,
    logger: match.groups.logger.trim(),
    level: match.groups.level.trim(),
    message: match.groups.message.trim(),
  };
}

function appendContinuationLine(row: ParsedLogRow, line: string): ParsedLogRow {
  return {
    ...row,
    message: `${row.message}\n${line}`,
    rawLine: `${row.rawLine}\n${line}`,
  };
}

function splitLines(content: string): string[] {
  if (content.trim() === '') {
    return [];
  }

  const lines = content.replace(/\r\n/g, '\n').split('\n');

  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

export function parseLogImportLine(
  line: string,
  lineNumber: number,
  sessionId: string,
  sourceFileName: string,
): ParsedLogRow | null {
  const parsed = parseFields(line);

  if (!parsed) {
    return null;
  }

  return {
    id: createIdentifier('row', sessionId, lineNumber),
    sessionId,
    lineNumber,
    timestamp: parsed.timestamp,
    logger: parsed.logger,
    level: parsed.level,
    message: parsed.message,
    sourceFile: sourceFileName,
    rawLine: line,
  };
}

export function parseLogImportContent(
  content: string,
  sessionId: string,
  sourceFileName: string,
): LogImportParseResult {
  const lines = splitLines(content);
  const rows: ParsedLogRow[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      return;
    }

    const parsedLine = parseLogImportLine(line, lineNumber, sessionId, sourceFileName);

    if (parsedLine) {
      rows.push(parsedLine);
      return;
    }

    const previousRow = rows.at(-1);

    if (!previousRow) {
      return;
    }

    rows[rows.length - 1] = appendContinuationLine(previousRow, line);
  });

  return {
    rows,
    errors: [],
    totalLines: lines.length,
  };
}
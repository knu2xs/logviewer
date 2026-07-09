import type { ParseError } from '../models/ParseError';
import type { ParsedLogRow } from '../models/ParsedLogRow';
import type { SourceFormat } from '../models/SourceFormat';

export interface LogImportParseResult {
  rows: ParsedLogRow[];
  errors: ParseError[];
  totalLines: number;
  sourceFormat: SourceFormat;
}

interface ParsedFields {
  timestamp: Date;
  logger: string;
  source: string;
  level: string;
  message: string;
  attributes: Record<string, string>;
}

const PIPE_LINE_PATTERN =
  /^(?<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:[.,]\d{1,3})?)\s*\|\s*(?<logger>[^|]+?)\s*\|\s*(?<level>[^|]+?)\s*\|\s*(?<message>.+)$/;
const XML_START_PATTERN = /^<Msg\b(?<attributes>[^>]*)>/;
const XML_LINE_PATTERN = /^<Msg\b(?<attributes>[^>]*)>(?<message>[\s\S]*?)<\/Msg>\s*$/;
const XML_ATTRIBUTE_PATTERN = /([\w:-]+)="([^"]*)"/g;

function createIdentifier(prefix: string, sessionId: string, lineNumber: number): string {
  return `${prefix}-${sessionId}-${lineNumber}`;
}

function parseTimestamp(timestampText: string): Date | null {
  const match = timestampText
    .trim()
    .match(
      /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})[ T](?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:[.,](?<millisecond>\d{1,3}))?$/,
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

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseXmlAttributes(attributeText: string): Record<string, string> {
  const attributes: Record<string, string> = {};

  for (const match of attributeText.matchAll(XML_ATTRIBUTE_PATTERN)) {
    const [, attributeName, attributeValue] = match;
    attributes[attributeName] = decodeXmlEntities(attributeValue);
  }

  return attributes;
}

function parsePipeDelimitedFields(line: string): ParsedFields | null {
  const match = line.match(PIPE_LINE_PATTERN);

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
    source: '',
    level: match.groups.level.trim(),
    message: match.groups.message.trim(),
    attributes: {},
  };
}

function parseXmlFields(line: string): ParsedFields | null {
  const match = line.match(XML_LINE_PATTERN);

  if (!match?.groups) {
    return null;
  }

  const attributes = parseXmlAttributes(match.groups.attributes);
  const timestamp = parseTimestamp(attributes.time ?? '');

  if (!timestamp) {
    return null;
  }

  return {
    timestamp,
    logger: '',
    source: attributes.source?.trim() || '—',
    level: attributes.type?.trim() || '—',
    message: decodeXmlEntities(match.groups.message.trim()),
    attributes,
  };
}

function parseFields(line: string): ParsedFields | null {
  return parseXmlFields(line) ?? parsePipeDelimitedFields(line);
}

function parseXmlBlock(block: string): ParsedFields | null {
  return parseXmlFields(block);
}

function shouldSkipBeforeXmlBlock(line: string, nextLine: string | undefined): boolean {
  if (!nextLine) {
    return false;
  }

  if (!XML_START_PATTERN.test(nextLine.trim())) {
    return false;
  }

  return /^Line\s+\d+:/i.test(line.trim());
}

function appendContinuationLine(row: ParsedLogRow, line: string): ParsedLogRow {
  return {
    ...row,
    hadContinuationLines: true,
    message: `${row.message}\n${line}`,
    rawLine: `${row.rawLine}\n${line}`,
  };
}

function detectSourceFormat(lines: string[]): SourceFormat {
  let sawXmlLine = false;
  let sawPipeLine = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      continue;
    }

    const xmlMatch = trimmedLine.match(XML_START_PATTERN);

    if (xmlMatch?.groups) {
      sawXmlLine = true;
      const attributes = parseXmlAttributes(xmlMatch.groups.attributes);
      const source = attributes.source?.trim().toLowerCase() ?? '';

      if (source.includes('portal')) {
        return 'ArcGIS Portal';
      }

      if (source.includes('server')) {
        return 'ArcGIS Server';
      }
    }

    if (PIPE_LINE_PATTERN.test(trimmedLine)) {
      sawPipeLine = true;
    }
  }

  if (sawXmlLine) {
    return 'Unknown';
  }

  return sawPipeLine ? 'Python Pipe Delimited' : 'Python Pipe Delimited';
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
    source: parsed.source,
    level: parsed.level,
    message: parsed.message,
    sourceFile: sourceFileName,
    rawLine: line,
    hadContinuationLines: false,
    attributes: parsed.attributes,
  };
}

export function parseLogImportContent(
  content: string,
  sessionId: string,
  sourceFileName: string,
): LogImportParseResult {
  const lines = splitLines(content);
  const sourceFormat = detectSourceFormat(lines);
  const rows: ParsedLogRow[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      continue;
    }

    if (XML_START_PATTERN.test(trimmedLine)) {
      const blockLines = [line];
      let blockEndIndex = index;

      while (
        blockEndIndex + 1 < lines.length &&
        !blockLines[blockLines.length - 1].trim().endsWith('</Msg>')
      ) {
        blockEndIndex += 1;
        blockLines.push(lines[blockEndIndex]);
      }

      const parsedBlock = parseXmlBlock(blockLines.join('\n'));

      if (parsedBlock) {
        rows.push({
          id: createIdentifier('row', sessionId, lineNumber),
          sessionId,
          lineNumber,
          timestamp: parsedBlock.timestamp,
          logger: parsedBlock.logger,
          source: parsedBlock.source,
          level: parsedBlock.level,
          message: parsedBlock.message,
          sourceFile: sourceFileName,
          rawLine: blockLines.join('\n'),
          hadContinuationLines: false,
          attributes: parsedBlock.attributes,
        });

        index = blockEndIndex;
        continue;
      }

      const previousRow = rows.at(-1);

      if (previousRow) {
        rows[rows.length - 1] = appendContinuationLine(previousRow, blockLines.join('\n'));
      }

      index = blockEndIndex;
      continue;
    }

    const parsedLine = parseLogImportLine(line, lineNumber, sessionId, sourceFileName);

    if (parsedLine) {
      rows.push(parsedLine);
      continue;
    }

    if (shouldSkipBeforeXmlBlock(line, lines[index + 1])) {
      continue;
    }

    const previousRow = rows.at(-1);

    if (!previousRow) {
      continue;
    }

    rows[rows.length - 1] = appendContinuationLine(previousRow, line);
  }

  return {
    rows,
    errors: [],
    totalLines: lines.length,
    sourceFormat,
  };
}

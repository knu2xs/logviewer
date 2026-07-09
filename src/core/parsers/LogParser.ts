/**
 * LogParser Interface
 *
 * Defines the contract for log parsing implementations.
 * All log parsers should implement this interface to provide
 * a consistent way to parse individual log lines into LogEntry objects.
 *
 * Future implementations will support:
 * - Plain text logs
 * - JSON logs
 * - Structured logs (Bunyan, Pino format)
 * - Apache/Nginx access logs
 * - Application-specific log formats
 */

import type { LogEntry } from '../models/LogEntry';

/**
 * LogParser Interface
 *
 * Defines how different log formats are parsed into the standard LogEntry structure.
 * Implementations should validate input and handle format-specific parsing logic.
 *
 * @interface LogParser
 */
export interface LogParser {
  /**
   * Human-readable name of this parser
   * Examples: "JSON Parser", "Plain Text Parser", "Bunyan Parser"
   */
  readonly name: string;

  /**
   * Determine if this parser can handle a given log sample
   *
   * @param sample - Sample of log content to test
   * @returns true if this parser recognizes the format, false otherwise
   */
  canParse(sample: string): boolean;

  /**
   * Parse a single log line into a LogEntry object
   *
   * @param line - A single line of log content
   * @param fileName - Name of the source file being parsed
   * @returns A LogEntry object if parsing succeeds, null if the line cannot be parsed
   */
  parse(line: string, fileName: string): LogEntry | null;
}

/**
 * LogEntry Model
 *
 * Defines the structure of a single log entry in the application.
 * This interface represents the core data structure for log viewing functionality.
 *
 * Future implementations will parse various log formats into this structure,
 * enabling consistent handling of logs regardless of their source format.
 */

/**
 * LogEntry Interface
 *
 * Represents a single log entry with standardized properties.
 * All log parsing implementations should produce LogEntry objects
 * that conform to this interface.
 *
 * @interface LogEntry
 * @property {Date} timestamp - When the log entry was created
 * @property {string} logger - Name of the logger that created this entry
 * @property {string} level - Log severity level (DEBUG, INFO, WARN, ERROR, FATAL, etc.)
 * @property {string} message - The log message content
 * @property {string} sourceFile - Source file or module that generated the log
 */
export interface LogEntry {
  /** Timestamp when the log entry was created */
  timestamp: Date;

  /** Name of the logger that created this entry */
  logger: string;

  /** Log level/severity (DEBUG, INFO, WARN, ERROR, FATAL, etc.) */
  level: string;

  /** The main log message content */
  message: string;

  /** Source file or module that generated the log */
  sourceFile: string;
}

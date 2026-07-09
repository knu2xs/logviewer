# Domain Model Specification: Project Foundation

**Date**: 2026-07-09 | **Feature**: Project Foundation | **Phase**: Phase 1 Design

## Overview

This document defines the complete data model and domain entities for the Log Viewer application foundation. These entities form the contract between all components, features, and parsing implementations.

---

## Entity: LogEntry

### Purpose

Represent a single log entry from any log source format, providing a unified structure for parsing, displaying, and analyzing logs.

### Definition

```typescript
export interface LogEntry {
  timestamp: Date; // When the log entry was created
  logger: string; // Name of the logger that produced this entry
  level: string; // Severity level (DEBUG, INFO, WARN, ERROR, FATAL, etc.)
  message: string; // The log message content
  sourceFile: string; // Source file or module that generated the log
}
```

### Property Specifications

#### timestamp: Date

- **Type**: JavaScript Date object
- **Purpose**: Temporal ordering and filtering of log entries
- **Constraints**:
  - Must be valid Date (not NaN)
  - Must represent actual log creation time (not parse time)
  - May be UTC, local time, or with timezone (parsers handle conversion)
- **Example**: `new Date('2026-07-09T14:30:45.123Z')`

#### logger: string

- **Type**: String
- **Purpose**: Identify which logger or component produced the entry
- **Constraints**:
  - Non-empty string (minimum 1 character)
  - May contain dots for hierarchical names (e.g., "com.example.service.auth")
  - UTF-8 encoding
- **Example Values**: `"com.example.UserService"`, `"app.middleware"`, `"auth"`

#### level: string

- **Type**: String
- **Purpose**: Indicate severity level for filtering and highlighting
- **Constraints**:
  - Non-empty string
  - Standardized levels recommended: DEBUG, INFO, WARN, ERROR, FATAL
  - May include custom levels: TRACE, VERBOSE, NOTICE, CRITICAL, ALERT
  - Comparison should be case-insensitive for filtering
- **Example Values**: `"DEBUG"`, `"INFO"`, `"WARN"`, `"ERROR"`, `"FATAL"`

#### message: string

- **Type**: String
- **Purpose**: The actual log message content
- **Constraints**:
  - May be empty string (valid for structured logs with only context)
  - UTF-8 encoding with support for multi-line strings
  - May contain special characters, ANSI codes, or escape sequences
  - Parsers should preserve original message as-is
- **Example**: `"User authentication failed for username: admin"`, `""`

#### sourceFile: string

- **Type**: String
- **Purpose**: Identify where in the codebase the log was generated
- **Constraints**:
  - Non-empty string
  - May be file path (e.g., `"src/services/auth.ts"`) or class name (e.g., `"AuthService"`)
  - May include line numbers: `"auth.ts:42"`
  - Parsers extract from stack traces, annotations, or file context
- **Example Values**: `"src/auth/login.ts:42"`, `"com.example.AuthService"`, `"middleware.js"`

### Validation Rules

```typescript
function validateLogEntry(entry: LogEntry): boolean {
  return (
    entry.timestamp instanceof Date &&
    !isNaN(entry.timestamp.getTime()) &&
    typeof entry.logger === 'string' &&
    entry.logger.length > 0 &&
    typeof entry.level === 'string' &&
    entry.level.length > 0 &&
    typeof entry.message === 'string' && // may be empty
    typeof entry.sourceFile === 'string' &&
    entry.sourceFile.length > 0
  );
}
```

### Factory/Creation Pattern

```typescript
// Factory function for creating LogEntry objects
function createLogEntry(
  timestamp: Date,
  logger: string,
  level: string,
  message: string,
  sourceFile: string,
): LogEntry {
  return { timestamp, logger, level, message, sourceFile };
}

// Example from parsed content
const entry: LogEntry = {
  timestamp: new Date('2026-07-09T14:30:45.123Z'),
  logger: 'app.service',
  level: 'ERROR',
  message: 'Failed to process request',
  sourceFile: 'service.ts:89',
};
```

### Serialization

#### JSON Format

```json
{
  "timestamp": "2026-07-09T14:30:45.123Z",
  "logger": "app.service",
  "level": "ERROR",
  "message": "Failed to process request",
  "sourceFile": "service.ts:89"
}
```

#### Storage Considerations

- `timestamp` serializes as ISO 8601 string
- Deserialize back to Date when loading
- All properties are required (no optionals)

### Relationships

- **Produced by**: LogParser implementations parse various formats into LogEntry objects
- **Consumed by**:
  - Display components render individual entries
  - Search/filter features query collections of entries
  - Analytics features aggregate entries
- **Stored in**: Application state (future feature), database (future feature)

### Immutability

LogEntry objects should be treated as immutable. Once created, properties should not be changed. This enables:

- Safe sharing across components
- Predictable behavior in state management
- Easier debugging and testing

---

## Entity: LogParser Interface

### Purpose

Define the contract for all log parsing implementations, enabling extensible support for various log formats.

### Definition

```typescript
export interface LogParser {
  readonly name: string;
  canParse(sample: string): boolean;
  parse(line: string, fileName: string): LogEntry | null;
}
```

### Method Specifications

#### name: string (readonly property)

- **Type**: String constant
- **Purpose**: Human-readable identifier for this parser
- **Constraints**:
  - Must be non-empty
  - Should be descriptive: "JSON Parser", "Plain Text Parser", "Bunyan Format"
  - Readonly to prevent accidental mutation
- **Example**: `"JSON Log Parser"`, `"Bunyan Parser"`, `"Plain Text Parser"`

#### canParse(sample: string): boolean

- **Type**: Method
- **Purpose**: Detect if this parser can handle a given log format
- **Parameters**:
  - `sample`: String snippet from log file (typically first few lines or first 1KB)
- **Returns**: `true` if parser recognizes the format, `false` otherwise
- **Behavior**:
  - Deterministic: same input always produces same output
  - Should check for format indicators (JSON start, field structure, etc.)
  - Should not throw exceptions (return false instead)
  - Lightweight, should not parse entire content
- **Implementation Strategy**:
  ```typescript
  // Example for JSON parser
  canParse(sample: string): boolean {
    try {
      const lines = sample.split('\n').slice(0, 5);
      return lines.some(line => {
        try {
          JSON.parse(line);
          return true;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }
  ```

#### parse(line: string, fileName: string): LogEntry | null

- **Type**: Method
- **Purpose**: Parse a single log line into a LogEntry object
- **Parameters**:
  - `line`: A single line from the log file
  - `fileName`: Name of the source file being parsed (for sourceFile property)
- **Returns**:
  - LogEntry object if parsing succeeds
  - `null` if the line cannot be parsed (not an error condition)
- **Behavior**:
  - Never throws exceptions (graceful degradation)
  - Returns null for unparseable lines (e.g., blank lines, stack trace continuation)
  - Must extract all required LogEntry properties from line
  - Must handle malformed input gracefully
- **Implementation Strategy**:
  ```typescript
  // Example for JSON parser
  parse(line: string, fileName: string): LogEntry | null {
    const trimmed = line.trim();
    if (!trimmed) return null; // Skip blank lines

    try {
      const obj = JSON.parse(trimmed);
      if (!isValidLogObject(obj)) return null;

      return {
        timestamp: new Date(obj.timestamp),
        logger: obj.logger || 'unknown',
        level: obj.level || 'INFO',
        message: obj.message || '',
        sourceFile: fileName
      };
    } catch {
      return null; // Invalid JSON, skip
    }
  }
  ```

### Validation Rules

```typescript
function validateLogParser(parser: LogParser): boolean {
  return (
    typeof parser.name === 'string' &&
    parser.name.length > 0 &&
    typeof parser.canParse === 'function' &&
    typeof parser.parse === 'function'
  );
}
```

### Error Handling Strategy

**Key Principle**: Parsers should fail gracefully and never throw.

```typescript
// ✅ CORRECT: Return null for unparseable lines
const result = parser.parse('not a valid log line', 'app.log');
if (result === null) {
  // Line was skipped, continue to next line
}

// ❌ INCORRECT: Throwing exceptions
const result = parser.parse('not a valid log line', 'app.log'); // throws Error
```

### Implementation Requirements

All LogParser implementations must:

1. Provide a unique, descriptive `name`
2. Implement format detection in `canParse()` that's fast and deterministic
3. Implement line-by-line parsing in `parse()` that handles malformed input
4. Return complete LogEntry objects with all required properties
5. Set `sourceFile` from the fileName parameter
6. Never throw exceptions (use null return for unparseable lines)

### Extensibility

Future parsers can extend this interface:

```typescript
// Example: Enhanced parser with configuration
interface ConfigurableLogParser extends LogParser {
  configure(options: ParserOptions): void;
}

interface ParserOptions {
  timezone?: string;
  dateFormat?: string;
  fieldsMapping?: Record<string, string>;
}
```

---

## Entity: AppState (Application Metadata)

### Purpose

Store basic application metadata and configuration in the global Zustand store.

### Definition

```typescript
export interface AppState {
  appName: string; // Application display name
  version: string; // Application version (SemVer)
}
```

### Property Specifications

#### appName: string

- **Type**: String
- **Purpose**: Application display name used in UI
- **Constraints**:
  - Non-empty string
  - Max 100 characters recommended
  - No newlines or special control characters
- **Default Value**: `"Log Viewer"`
- **Example**: `"Log Viewer"`, `"Enterprise Log Analyzer"`

#### version: string

- **Type**: String (SemVer format)
- **Purpose**: Application version for compatibility and user information
- **Format**: `MAJOR.MINOR.PATCH` (e.g., `"1.0.0"`)
- **Constraints**:
  - Must follow Semantic Versioning 2.0.0
  - Three numeric components separated by dots
  - Optional pre-release and build metadata (e.g., `"1.0.0-beta.1"`, `"1.0.0+build.123"`)
- **Default Value**: `"1.0.0"`
- **Example**: `"1.0.0"`, `"1.2.3"`, `"2.0.0-alpha"`, `"1.0.0+20130313144700"`

### Validation Rules

```typescript
function validateAppState(state: AppState): boolean {
  const semverPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\\+[a-zA-Z0-9.]+)?$/;
  return (
    typeof state.appName === 'string' &&
    state.appName.length > 0 &&
    state.appName.length <= 100 &&
    typeof state.version === 'string' &&
    semverPattern.test(state.version)
  );
}
```

### Store Integration

AppState is stored in the global Zustand store alongside UI state:

```typescript
interface AppStoreState extends AppState {
  // UI state properties
  darkMode: boolean;
  isLoading: boolean;

  // Actions
  setDarkMode: (enabled: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  // AppState (application metadata)
  appName: 'Log Viewer',
  version: '1.0.0',

  // UI state
  darkMode: false,
  isLoading: false,

  // Actions
  setDarkMode: (enabled) => set({ darkMode: enabled }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
```

### Usage Patterns

```typescript
// In components - access AppState
const appName = useAppStore((state) => state.appName);
const version = useAppStore((state) => state.version);

// Display in header or footer
<header>
  <h1>{appName}</h1>
  <span>v{version}</span>
</header>
```

### Future Extensions

AppState can be extended with additional properties as the application grows:

```typescript
interface ExtendedAppState extends AppState {
  environment: 'development' | 'staging' | 'production';
  buildDate: string;
  commitHash: string;
  features: {
    search: boolean;
    filters: boolean;
    export: boolean;
  };
}
```

---

## Summary Table

| Entity    | Purpose          | Key Properties                                | Status     |
| --------- | ---------------- | --------------------------------------------- | ---------- |
| LogEntry  | Single log entry | timestamp, logger, level, message, sourceFile | Defined ✅ |
| LogParser | Parsing contract | name, canParse(), parse()                     | Defined ✅ |
| AppState  | App metadata     | appName, version                              | Defined ✅ |

---

## Type Exports

**File**: `src/core/models/LogEntry.ts`

```typescript
export interface LogEntry { ... }
```

**File**: `src/core/parsers/LogParser.ts`

```typescript
export interface LogParser { ... }
```

**File**: `src/store/appStore.ts`

```typescript
export interface AppState { ... }
export const useAppStore: Store<AppStoreState>;
```

---

**Model Status**: ✅ COMPLETE - All entities defined and validated

**Next Steps**: Create contracts/ documentation and quickstart.md

**Prepared by**: Speckit Planning Agent | **Date**: 2026-07-09

# LogParser Contract

**Date**: 2026-07-09 | **Version**: 1.0.0

## Contract Overview

This contract specifies the formal interface and behavior requirements for the `LogParser` interface in the Log Viewer application.

## Interface Definition

```typescript
export interface LogParser {
  readonly name: string;
  canParse(sample: string): boolean;
  parse(line: string, fileName: string): LogEntry | null;
}
```

## Property Contracts

### name: string (readonly)

**Contract**:

- Type: String constant
- Readonly: Cannot be reassigned after initialization
- Nullable: No (required)
- Min Length: 1 character
- Max Length: 100 characters (recommended)
- Format: UTF-8 encoding
- Semantics: Human-readable identifier for this parser

**Examples**:

```typescript
const parser1 = {
  name: 'JSON Log Parser', // ✅ Good
  // ...
};

const parser2 = {
  name: 'Plain Text Parser', // ✅ Good
  // ...
};

// ❌ Do not allow mutation:
parser1.name = 'New Name'; // Readonly - prevents this
```

**Constraints**:

- Non-empty, non-null string
- Should be unique within application context
- Should describe the format it parses
- Naming convention: `[Format] Parser`

## Method Contracts

### canParse(sample: string): boolean

**Signature**:

```typescript
canParse(sample: string): boolean
```

**Contract**:

- Input: `sample` - String containing log content snippet (typically first few lines or 1KB)
- Output: `boolean` - `true` if parser recognizes format, `false` otherwise
- Exceptions: **Must not throw** - return `false` on error
- Determinism: **Must be deterministic** - same input always returns same result
- Performance: **Must be fast** - should complete in <10ms
- Side Effects: **Must not have side effects** - should not modify any state

**Semantics**:

- Detect if the sample matches this parser's expected format
- Should check for format indicators (JSON start, field patterns, delimiters, etc.)
- Should not attempt full parsing (use `parse()` for that)
- Should be "confident" - reduce false positives

**Examples**:

```typescript
// JSON Parser
class JsonParser implements LogParser {
  readonly name = 'JSON Parser';

  canParse(sample: string): boolean {
    try {
      const lines = sample.split('\n').slice(0, 5);
      // Check if any line is valid JSON with log-like structure
      return lines.some((line) => {
        if (!line.trim()) return false;
        try {
          const obj = JSON.parse(line);
          return this.hasLogFields(obj);
        } catch {
          return false;
        }
      });
    } catch {
      return false; // Never throw
    }
  }

  private hasLogFields(obj: any): boolean {
    // Check for common log fields
    return (
      obj &&
      (typeof obj.timestamp === 'string' ||
        typeof obj.time === 'string' ||
        typeof obj.level === 'string' ||
        typeof obj.message === 'string')
    );
  }

  parse(line: string, fileName: string): LogEntry | null {
    // ... implementation
  }
}
```

```typescript
// Plain Text Parser with Timestamp
class PlainTextParser implements LogParser {
  readonly name = 'Plain Text Parser';
  private readonly timestampPattern = /^\\d{4}-\\d{2}-\\d{2}/; // YYYY-MM-DD start

  canParse(sample: string): boolean {
    try {
      const lines = sample.split('\n').slice(0, 5);
      // Check if lines look like timestamp-prefixed logs
      return lines.some((line) => this.timestampPattern.test(line.trim()));
    } catch {
      return false; // Never throw
    }
  }

  parse(line: string, fileName: string): LogEntry | null {
    // ... implementation
  }
}
```

**Error Handling**:

```typescript
// ✅ CORRECT: Return false on error
canParse(sample: string): boolean {
  try {
    // ... detection logic
  } catch (error) {
    return false; // Graceful degradation
  }
}

// ❌ INCORRECT: Throwing exception
canParse(sample: string): boolean {
  // ... detection logic
  throw new Error('Parse failed'); // Never do this
}
```

**Constraints**:

- Must not throw exceptions
- Must return boolean (never undefined)
- Must be deterministic
- Must complete quickly (<10ms)
- Should handle null/undefined/empty string gracefully

### parse(line: string, fileName: string): LogEntry | null

**Signature**:

```typescript
parse(line: string, fileName: string): LogEntry | null
```

**Contracts**:

#### Input Contract

- **line**: Single line from log file (string)
  - May be empty string
  - May contain any UTF-8 characters
  - May be partial line (parser should handle)
- **fileName**: Name/path of source file (string)
  - Used to populate `sourceFile` in LogEntry
  - May be full path or just filename
  - Never null/undefined

#### Output Contract

- **Returns**:
  - `LogEntry` object if parsing succeeds (all required fields valid)
  - `null` if parsing fails (no LogEntry created)
  - **Never throws exceptions**
  - **Never returns undefined**

#### Semantics

- Parse a single line of log content into a structured LogEntry
- Extract: timestamp, logger, level, message from line
- Set: sourceFile from fileName parameter
- Handle unparseable lines gracefully (return null)
- Preserve message content exactly as appears in line

#### Error Handling Strategy

**Key Principle**: Parsers fail gracefully, never throw.

```typescript
parse(line: string, fileName: string): LogEntry | null {
  // ✅ CORRECT PATTERNS

  const trimmed = line.trim();
  if (!trimmed) return null; // Skip blank lines

  if (!this.looks LikeOurFormat(trimmed)) {
    return null; // Skip lines we can't parse
  }

  try {
    const entry = this.parseLogLine(trimmed);
    if (!this.isValidLogEntry(entry)) {
      return null; // Entry missing required fields
    }
    return entry;
  } catch (error) {
    return null; // Parsing error - skip line
  }
}

// ❌ INCORRECT PATTERNS
parse(line: string, fileName: string): LogEntry | null {
  // Don't throw on invalid input:
  throw new Error('Invalid line format'); // ❌ WRONG

  // Don't return undefined:
  return undefined; // ❌ WRONG

  // Don't return partial objects:
  return { timestamp: new Date(), message: 'test' }; // ❌ WRONG - missing required fields
}
```

#### Validation

Output must satisfy LogEntry contract:

```typescript
parse(line: string, fileName: string): LogEntry | null {
  // ... parsing logic

  const entry: LogEntry = {
    timestamp: new Date('2026-07-09T14:30:45.123Z'), // ✅ Valid Date
    logger: 'app.service', // ✅ Non-empty string
    level: 'ERROR', // ✅ Non-empty string
    message: 'Error message', // ✅ String (may be empty)
    sourceFile: fileName // ✅ Non-empty string (from parameter)
  };

  return entry;
}
```

## Implementation Pattern

Recommended structure for implementing LogParser:

```typescript
export class MyLogParser implements LogParser {
  readonly name = 'My Log Parser';
  private readonly linePattern =
    /^(?<timestamp>.*?) (?<level>\\w+) \\[(?<logger>[^\\]]+)\\] (?<message>.*)$/;

  canParse(sample: string): boolean {
    try {
      const lines = sample.split('\n').slice(0, 5);
      return lines.some((line) => this.linePattern.test(line.trim()));
    } catch {
      return false;
    }
  }

  parse(line: string, fileName: string): LogEntry | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    try {
      const match = this.linePattern.exec(trimmed);
      if (!match || !match.groups) return null;

      const { timestamp, level, logger, message } = match.groups;

      // Validate required fields exist
      if (!timestamp || !level || !logger) return null;

      // Parse timestamp - handle errors gracefully
      let parsedTime: Date;
      try {
        parsedTime = new Date(timestamp);
        if (isNaN(parsedTime.getTime())) {
          return null; // Invalid date
        }
      } catch {
        return null; // Date parsing failed
      }

      // Return complete LogEntry
      return {
        timestamp: parsedTime,
        logger: logger.trim(),
        level: level.toUpperCase(),
        message: message || '',
        sourceFile: fileName,
      };
    } catch {
      return null; // Parsing error - skip line
    }
  }
}
```

## Error Handling Examples

### Example 1: Invalid Line Format

```typescript
parser.parse('not a valid log line', 'app.log');
// Returns: null
// Behavior: Line is skipped, processing continues
```

### Example 2: Missing Required Field

```typescript
parser.parse('2026-07-09 [logger] no level provided', 'app.log');
// Returns: null (if level is missing)
// Behavior: Line is skipped, processing continues
```

### Example 3: Malformed Timestamp

```typescript
parser.parse('invalid-date ERROR [logger] message', 'app.log');
// Returns: null
// Behavior: Line is skipped, processing continues
```

### Example 4: Blank Line

```typescript
parser.parse('', 'app.log');
// Returns: null
// Behavior: Line is skipped, processing continues
```

## Parser Discovery & Selection

When parsing a log file:

1. Sample first 1KB (or first 10 lines) of file
2. Call `canParse(sample)` on all available parsers
3. Select parser with highest confidence (first match wins)
4. Process entire file line-by-line with selected parser
5. For each line:
   - Call `parse(line, fileName)`
   - If returns LogEntry: add to results
   - If returns null: skip line, continue
6. Return array of successfully parsed LogEntry objects

## Contracts Summary

| Aspect         | Requirement                          | Rationale                 |
| -------------- | ------------------------------------ | ------------------------- |
| `name`         | Non-empty, readable string           | Identify parser in UI     |
| `canParse()`   | Deterministic, fast, no throw        | Format detection          |
| `parse()`      | Return LogEntry or null, never throw | Graceful parsing          |
| Error handling | Return null, never throw             | Robust, fail-safe parsing |
| Validation     | Validate all LogEntry fields         | Contract compliance       |

---

## Testing Contract

Parsers must pass these test scenarios:

1. **Format Detection**: `canParse()` correctly identifies supported formats
2. **Valid Input**: `parse()` correctly parses valid log lines
3. **Invalid Input**: `parse()` returns null for unparseable lines
4. **Empty Input**: `parse()` returns null for blank lines
5. **Malformed Data**: `parse()` returns null (never throws)
6. **Missing Fields**: `parse()` returns null when required fields missing
7. **All LogEntry Fields**: Returned LogEntry has all required properties valid

---

**Contract Status**: ✅ APPROVED | **Version**: 1.0.0 | **Date**: 2026-07-09

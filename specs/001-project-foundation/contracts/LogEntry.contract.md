# LogEntry Contract

**Date**: 2026-07-09 | **Version**: 1.0.0

## Contract Overview

This contract specifies the formal interface and behavior requirements for the `LogEntry` type in the Log Viewer application.

## Interface Definition

```typescript
export interface LogEntry {
  timestamp: Date;
  logger: string;
  level: string;
  message: string;
  sourceFile: string;
}
```

## Property Contracts

### timestamp: Date

**Contract**:

- Type: JavaScript `Date` object
- Nullable: No (required)
- Serialization: ISO 8601 string (`toISOString()`)
- Validation: Must pass `Date instanceof Date && !isNaN(date.getTime())`
- Semantics: Represents the moment the log entry was created
- Timezone: May be UTC, local, or with timezone info (parser's responsibility to normalize)

**Examples**:

```javascript
const valid = new Date('2026-07-09T14:30:45.123Z');
const valid2 = new Date(1625857845000);
const invalid = new Date('not a date'); // NaN
```

**Constraints**:

- Must be a valid Date (not NaN)
- Recommend UTC for consistency
- Should be between 1970 and 3000 (sanity check)

### logger: string

**Contract**:

- Type: String
- Nullable: No (required)
- Min Length: 1 character
- Max Length: 255 characters (recommended)
- Format: UTF-8 encoding
- Pattern: No newlines or control characters (except \t)
- Semantics: Identifies the logger/component that produced this entry

**Examples**:

```typescript
const valid = 'com.example.auth.LoginService';
const valid2 = 'app.middleware';
const valid3 = 'auth';
const invalid = ''; // Empty string not allowed
```

**Constraints**:

- Non-empty string
- Hierarchical names use dots (e.g., `com.example.service`)
- Should match pattern: `^[a-zA-Z0-9._-]+$` (alphanumeric, dots, underscores, hyphens)

### level: string

**Contract**:

- Type: String
- Nullable: No (required)
- Min Length: 1 character
- Max Length: 16 characters (recommended)
- Case-Insensitive: Filtering should be case-insensitive
- Format: UTF-8 encoding
- Semantics: Severity level for filtering and highlighting

**Standard Levels** (Recommended):

```
DEBUG   - Detailed information for debugging
INFO    - Informational messages
WARN    - Warning messages for potentially problematic situations
ERROR   - Error messages for error events
FATAL   - Fatal messages for very severe error events
```

**Custom Levels** (Permitted):

```
TRACE, VERBOSE, NOTICE, CRITICAL, ALERT, EMERGENCY
```

**Examples**:

```typescript
const valid = 'DEBUG';
const valid2 = 'INFO';
const valid3 = 'CUSTOM_LEVEL';
const invalid = ''; // Empty not allowed
```

**Constraints**:

- Non-empty string
- Typically uppercase (but not enforced)
- No newlines or control characters

### message: string

**Contract**:

- Type: String
- Nullable: No (but may be empty)
- Max Length: No hard limit, but recommend <10KB for performance
- Format: UTF-8 encoding
- Special Characters: Allowed (including ANSI codes, special chars)
- Multi-line: Supported (may contain \n)
- Semantics: The actual log message content

**Examples**:

```typescript
const valid = 'User authentication failed for username: admin';
const valid2 = ''; // Empty string allowed for structured logs
const valid3 = 'Error:\nStack trace line 1\nStack trace line 2';
const valid4 = 'Message with \u001b[31mANSI codes\u001b[0m'; // Color codes
```

**Constraints**:

- UTF-8 encoding
- Parser should preserve message as-is
- May contain multi-line content
- No validation of content (accept any valid UTF-8)

### sourceFile: string

**Contract**:

- Type: String
- Nullable: No (required)
- Min Length: 1 character
- Max Length: 255 characters (recommended)
- Format: UTF-8 encoding
- Semantics: File path or module name where log was generated

**Examples**:

```typescript
const valid = 'src/services/auth.ts';
const valid2 = 'src/auth/login.ts:42'; // With line number
const valid3 = 'com.example.AuthService';
const valid4 = 'middleware.js';
const invalid = ''; // Empty not allowed
```

**Formats**:

- File path: `src/services/auth.ts` or `src/auth/login.ts:42`
- Class name: `com.example.AuthService`
- Module name: `middleware.js`

**Constraints**:

- Non-empty string
- Should be extractable from log content or stack trace
- Parser extracts from fileName parameter if not in content

## JSON Serialization Contract

### Format

```json
{
  "timestamp": "2026-07-09T14:30:45.123Z",
  "logger": "com.example.auth",
  "level": "ERROR",
  "message": "Authentication failed",
  "sourceFile": "auth.ts:42"
}
```

### Serialization Rules

1. `timestamp` serializes as ISO 8601 string via `toISOString()`
2. All other properties serialize as-is
3. No additional properties allowed
4. All properties are required (no optional properties)

### Deserialization Rules

1. Parse `timestamp` string back to Date object: `new Date(obj.timestamp)`
2. Validate timestamp is valid Date
3. Validate all other properties meet contract constraints
4. Reject if any required property missing

## Example Instances

### Example 1: Standard Application Log

```typescript
{
  timestamp: new Date('2026-07-09T14:30:45.123Z'),
  logger: 'com.example.auth.LoginService',
  level: 'INFO',
  message: 'User login successful',
  sourceFile: 'src/auth/login.ts:145'
}
```

### Example 2: Error with Stack Trace

```typescript
{
  timestamp: new Date('2026-07-09T14:30:46.456Z'),
  logger: 'com.example.database',
  level: 'ERROR',
  message: 'Database connection failed: Connection timeout\nStack trace:\n  at connect (db.ts:52)\n  at init (app.ts:23)',
  sourceFile: 'src/database/connection.ts:52'
}
```

### Example 3: Structured Log Entry

```typescript
{
  timestamp: new Date('2026-07-09T14:30:47.789Z'),
  logger: 'api.request',
  level: 'DEBUG',
  message: '',  // Empty message is allowed
  sourceFile: 'middleware.ts:89'
}
```

### Example 4: Custom Level

```typescript
{
  timestamp: new Date('2026-07-09T14:30:48.012Z'),
  logger: 'app.security',
  level: 'CRITICAL_ALERT',
  message: 'Potential security breach detected',
  sourceFile: 'security.ts:200'
}
```

## Immutability Contract

**Guarantee**: LogEntry objects should be treated as immutable.

```typescript
// ✅ Safe usage - treat as immutable
const entry: LogEntry = {/* ... */};
const logger = entry.logger; // Read-only

// ❌ Unsafe - do not mutate
entry.message = 'new message'; // Don't do this
```

## Validation Contract

**Validation Function**:

```typescript
function isValidLogEntry(obj: unknown): obj is LogEntry {
  if (!obj || typeof obj !== 'object') return false;

  const entry = obj as Record<string, unknown>;

  return (
    entry.timestamp instanceof Date &&
    !isNaN(entry.timestamp.getTime()) &&
    typeof entry.logger === 'string' &&
    entry.logger.length > 0 &&
    typeof entry.level === 'string' &&
    entry.level.length > 0 &&
    typeof entry.message === 'string' &&
    typeof entry.sourceFile === 'string' &&
    entry.sourceFile.length > 0
  );
}
```

## Usage Contract

**Guarantee**: When you receive a LogEntry from a LogParser, all properties are valid and accessible.

```typescript
const parser: LogParser = new MyParser();
const entry = parser.parse('log line', 'file.log');

if (entry) {
  // ✅ All properties guaranteed to be valid
  console.log(entry.timestamp); // Date - guaranteed valid
  console.log(entry.logger); // string - guaranteed non-empty
  console.log(entry.level); // string - guaranteed non-empty
  console.log(entry.message); // string - may be empty but valid
  console.log(entry.sourceFile); // string - guaranteed non-empty
}
```

## Future Versioning

**Version 1.0**: Current version (as defined above)

**Planned Changes** (v2.0):

- Possible addition of `metadata: Record<string, unknown>` for arbitrary structured data
- Possible addition of `tags: string[]` for categorization
- Changes will be announced with migration guide

**Backward Compatibility**:

- Version 1.0 LogEntry objects will remain compatible with v2.0 parsers
- New properties will be optional in v2.0

---

**Contract Status**: ✅ APPROVED | **Version**: 1.0.0 | **Date**: 2026-07-09

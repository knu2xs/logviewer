# Data Model: Log Import

## Entities

### ImportSession

Represents one selected-file import operation from start to finish.

Fields:

- `id`: unique session identifier
- `sourceFileName`: display name of the selected file
- `sourceFileSize`: byte size of the selected file
- `startedAt`: timestamp when import started
- `completedAt`: timestamp when import ended
- `status`: `idle`, `importing`, `complete`, or `failed`
- `totalLines`: total lines read from the file
- `validEntryCount`: number of successfully parsed rows
- `parseErrorCount`: number of malformed lines recorded
- `rows`: ordered list of `ParsedLogRow` records
- `errors`: ordered list of `ParseError` records

Validation rules:

- `sourceFileName` must be present for a completed session.
- `totalLines` must be greater than or equal to the sum of valid entries and parse errors.
- `rows` and `errors` must both belong to the same `id`.

### ParsedLogRow

Represents one successfully parsed and displayable log line.

Fields:

- `id`: unique row identifier
- `sessionId`: owning import session identifier
- `lineNumber`: 1-based line number in the source file
- `timestamp`: parsed `Date` value
- `logger`: logger name
- `level`: log severity level
- `message`: log message text
- `sourceFile`: selected file name or file path shown in the UI
- `rawLine`: original source line retained for diagnostics

Validation rules:

- `timestamp`, `logger`, `level`, and `message` must be present after parsing.
- `lineNumber` must be positive.
- `sessionId` must reference the owning import session.

### ParseError

Represents one line that could not be parsed.

Fields:

- `id`: unique error identifier
- `sessionId`: owning import session identifier
- `lineNumber`: 1-based line number in the source file
- `rawLine`: original source line
- `reason`: human-readable parse failure reason

Validation rules:

- `reason` must explain why the line could not be interpreted.
- `lineNumber` must be positive.
- `sessionId` must reference the owning import session.

### LogEntry

Existing core contract for a parsed log record.

Fields:

- `timestamp`
- `logger`
- `level`
- `message`
- `sourceFile`

Relationships:

- `ParsedLogRow` is the UI/session representation of a `LogEntry`.
- `ImportSession` owns many `ParsedLogRow` and `ParseError` records.

## State Transitions

- `idle` -> `importing` when a file is selected and parsing begins.
- `importing` -> `complete` when parsing finishes and at least one line has been processed.
- `importing` -> `failed` only for unrecoverable file-read failures.
- Empty files complete successfully with zero rows and zero parse errors.
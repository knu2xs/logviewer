# Research Notes: Log Import

## 1. Local file ingestion

- Decision: Use the browser File API for user-selected files and read content in memory for the duration of the import.
- Rationale: The feature is a local inspection workflow, so persistence is unnecessary and the browser already exposes a reliable file-selection mechanism.
- Alternatives considered: Server-side upload/retrieval was rejected because it adds network dependency and storage concerns that are out of scope.

## 2. Parsing strategy

- Decision: Parse the file line by line with a tolerant parser that accepts the supported delimited log shapes and records malformed lines as errors without stopping the import.
- Rationale: The spec requires valid rows to survive malformed input, and the accepted clarification means the parser must handle both the base pipe-delimited form and the comma-millisecond timestamp variant.
- Alternatives considered: A strict fail-fast parser was rejected because it would hide valid rows in mixed files. A multi-parser registry was deferred because v1 only needs the import slice, not format discovery.

## 3. Results presentation

- Decision: Render imported rows in AG Grid with summary counts and empty-state messaging.
- Rationale: AG Grid is already available in the repository and provides built-in virtualization, which fits the large-file requirement without custom table plumbing.
- Alternatives considered: A custom table built with plain Mantine components was rejected for this slice because it would require extra work to reach the same responsiveness for 10,000+ rows.

## 4. State model

- Decision: Model each import as a single session containing the selected file metadata, parsed rows, parse errors, and aggregate counts.
- Rationale: The spec explicitly keeps row data and parse error data together, and a session object makes the UI state easy to reason about.
- Alternatives considered: Separate disconnected row/error stores were rejected because they make mixed-file handling harder to track and test.

## 5. Verification strategy

- Decision: Use Vitest for parser and data-shaping logic and Playwright for browser-visible smoke coverage of the import flow.
- Rationale: The constitution already requires repeatable automated validation at the smallest useful level, and these two layers cover both logic and user-visible behavior.
- Alternatives considered: Manual-only validation was rejected because it does not satisfy the project quality gate. End-to-end-only validation was rejected because it would make line parsing failures harder to diagnose.
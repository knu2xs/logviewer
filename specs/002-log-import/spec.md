# Feature Specification: Log Import

**Feature Branch**: `002-log-import`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User story: "As a user, I want to open a log file so I can inspect its contents."

## Clarifications

### Session 2026-07-09

- Q: Which input format should v1 support? → A: Support both the pipe-delimited format already stated in the spec and the comma-timestamp example lines.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Import and Inspect Log File (Priority: P1)

As a user, I want to open a log file and inspect its contents so that I can review the parsed entries in a structured view.

**Why this priority**: This is the first meaningful product slice after the foundation. It proves the app can ingest real log data and present it for inspection.

**Independent Test**: Select a valid log file and confirm parsed rows appear in the grid, empty files show an empty state, and malformed lines are reported without blocking valid rows.

**Acceptance Scenarios**:

1. **Given** a valid log file, **When** the user selects the file, **Then** the application parses the file lines and displays the resulting rows
2. **Given** an empty log file, **When** the user selects the file, **Then** the application shows an empty result state without errors
3. **Given** a file containing malformed lines, **When** the user selects the file, **Then** the application displays valid rows and shows parse errors for the malformed lines
4. **Given** a file containing mixed valid and invalid lines, **When** the user selects the file, **Then** the application preserves the valid rows and reports the invalid lines individually

### Edge Cases

- What happens when the selected file is not a supported log file format? The application should still attempt line-by-line parsing and report lines it cannot interpret.
- What happens when a file contains only malformed lines? The application should show parse errors and an empty or partial results state rather than failing the import.
- What happens when the file is very large? The application should continue to import and display results without requiring search or filtering in this slice.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users MUST be able to select a local log file for import
- **FR-002**: The system MUST parse the selected file line by line into displayable rows
- **FR-003**: The system MUST display parsed rows in a tabular or grid-based view
- **FR-004**: The system MUST continue processing valid lines when malformed lines are encountered
- **FR-005**: The system MUST show parse error details for malformed lines, including enough information to identify the line and reason
- **FR-006**: The system MUST handle empty files by showing an empty-state result instead of failing
- **FR-007**: The system MUST keep row data and parse error data associated with the same import session

### Key Entities _(include if feature involves data)_

#### ImportSession

Represents one file import action, including the selected file and the outcome of parsing that file.

#### ParsedLogRow

Represents a successfully parsed log line that can be displayed in the application’s results view.

#### ParseError

Represents a line that could not be parsed, including the line reference and a human-readable reason.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can import a valid log file and see parsed rows on the screen within a few seconds for a typical file
- **SC-002**: Empty files can be imported without errors and show a clear empty-state result
- **SC-003**: 100% of malformed lines are reported as parse errors rather than silently ignored
- **SC-004**: Mixed files display valid rows while also surfacing the malformed lines separately
- **SC-005**: A developer can clone the repository, install dependencies, and verify the import workflow on the first attempt

## Assumptions

- The user selects a local file from their device rather than pasting log text.
- Search, filtering, and statistics are intentionally out of scope for this slice.
- A parser contract already exists or will exist to interpret supported log lines.
- The application can surface parse errors without requiring the user to leave the import screen.
- The first version focuses on inspection and correctness rather than advanced file management.

### Input Log Formats

Supported v1 line shapes:

- `timestamp | logger | level | message`
- `timestamp,mmm | logger | level | message`

Example:

2026-07-09 10:38:56,927 | everett_attributerules | INFO | Starting everett-attributerules attribute rules application.
2026-07-09 10:38:56,927 | everett_attributerules | INFO | Configuration loaded from: d:\projects\everett-attributerules\config\config.yaml
2026-07-09 10:38:56,928 | everett_attributerules | INFO | Output geodatabase: d:\projects\everett-attributerules\data\processed\processed.gdb
2026-07-09 10:38:56,928 | everett_attributerules | INFO | Template geodatabase: d:\projects\everett-attributerules\data\external\ssgensql9.gdb
2026-07-09 10:38:56,928 | everett_attributerules | INFO | Mapping file:        d:\projects\everett-attributerules\data\interim\arcade\AttributeRules_AllRules.xlsx
2026-07-09 10:38:56,929 | everett_attributerules | INFO | Arcade scripts dir:  d:\projects\everett-attributerules\data\interim\arcade\arcade_scripts
2026-07-09 10:38:56,929 | everett_attributerules | INFO | Operation:           ADD
2026-07-09 10:38:56,929 | everett_attributerules | INFO | Skip existing:       True
2026-07-09 10:38:56,929 | everett_attributerules | INFO | Sync triggers on ADD:True
2026-07-09 10:39:34,353 | everett_attributerules.apply_rules | INFO | Reading mapping file: d:\projects\everett-attributerules\data\interim\arcade\AttributeRules_AllRules.xlsx
2026-07-09 10:39:34,695 | everett_attributerules.apply_rules | DEBUG | Read 95 rules from mapping file
2026-07-09 10:44:16,545 | everett_attributerules.apply_rules | INFO | ADD rule: Rule_24 on WCONTROLVALVE
2026-07-09 10:44:16,995 | everett_attributerules.apply_rules | INFO | ✓ Added rule: Rule_24
2026-07-09 10:44:17,445 | everett_attributerules.apply_rules | INFO | Rule 'Rule_25': script uses NextSequenceValue or FeatureSetByName — forcing exclude_from_client_evaluation to True
2026-07-09 10:44:17,445 | everett_attributerules.apply_rules | INFO | ADD rule: Rule_25 on WPRESSURIZEDMAIN
2026-07-09 10:44:17,851 | everett_attributerules.apply_rules | INFO | ✓ Added rule: Rule_25
2026-07-09 10:44:17,851 | everett_attributerules.apply_rules | WARNING | Rule 'Rule_26' [CURRENT_USER]: TABLENAME='*' with editor-tracking method — enable Editor Tracking on each feature class instead of registering an Attribute Rule.
2026-07-09 10:44:17,852 | everett_attributerules.apply_rules | WARNING | Rule 'Rule_27' [TIMESTAMP]: TABLENAME='*' with editor-tracking method — enable Editor Tracking on each feature class instead of registering an Attribute Rule.
2026-07-09 10:44:17,852 | everett_attributerules.apply_rules | INFO | Rule 'Rule_28': FC 'wnetworkstructure_pumps' missing required field(s) ['code', 'feature_id'] — skipping
2026-07-09 10:44:17,852 | everett_attributerules.apply_rules | INFO | Rule 'Rule_28': FC 'wnetworkstructure_hvac' missing required field(s) ['code', 'feature_id'] — skipping
2026-07-09 10:44:17,853 | everett_attributerules.apply_rules | INFO | Rule 'Rule_28': FC 'wnetworkstructure_motors' missing required field(s) ['code', 'feature_id'] — skipping
2026-07-09 10:44:17,853 | everett_attributerules.apply_rules | INFO | Rule 'Rule_28': FC 'wnetworkstructure_electricalsystem' missing required field(s) ['code', 'feature_id'] — skipping
2026-07-09 10:44:17,853 | everett_attributerules.apply_rules | INFO | Rule 'Rule_28': FC 'wnetworkstructure_generators' missing required field(s) ['code', 'feature_id'] — skipping
# Tasks: Log Import

**Input**: Design documents from `/specs/002-log-import/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Include tests because the feature spec includes explicit validation scenarios and the constitution requires repeatable automated verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (for example, US1)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature scaffolding needed for log import work

- [x] T001 [P] Create feature folders for log import code and tests in `src/components/log-import/`, `src/core/models/`, `src/core/parsers/`, `src/store/`, and `tests/e2e/`
- [x] T002 [P] Add log-import export placeholders in `src/core/models/index.ts` and `src/core/parsers/index.ts` so the new feature contracts can be imported consistently

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and parsing infrastructure that must exist before the user story UI can work

**Checkpoint**: Foundation ready - the log import story can now be implemented and tested independently

- [x] T003 [P] Define `ImportSession`, `ParsedLogRow`, and `ParseError` interfaces in `src/core/models/ImportSession.ts`, `src/core/models/ParsedLogRow.ts`, and `src/core/models/ParseError.ts`
- [x] T004 [P] Implement the tolerant log-line parser in `src/core/parsers/logImportParser.ts` to support both clarified line shapes, including the pipe-delimited form and the comma-millisecond timestamp variant, and return parsed rows plus parse errors
- [x] T005 [P] Create the log import session store in `src/store/logImportStore.ts` to track the active file metadata, parsed rows, parse errors, counts, timestamps, and import status
- [x] T006 Update `src/core/models/index.ts` and `src/core/parsers/index.ts` to export the new log import contracts and parser helpers

---

## Phase 3: User Story 1 - Import and Inspect Log File (Priority: P1)

**Goal**: Let a user select a local log file, parse its lines, and inspect valid rows with malformed lines reported separately

**Independent Test**: Select a valid log file and verify parsed rows appear in the grid, select an empty file and confirm the empty state renders, and select a mixed file to confirm valid rows still render while malformed lines are reported

### Tests for User Story 1

- [x] T007 [P] [US1] Add parser unit coverage for valid, empty, and malformed lines in `src/core/parsers/logImportParser.test.ts`
- [x] T008 [P] [US1] Add store state coverage for import start, success, failure, and reset behavior in `src/store/logImportStore.test.ts`
- [x] T009 [P] [US1] Add page smoke coverage for the import flow in `src/pages/HomePage.test.tsx`
- [x] T010 [P] [US1] Add browser smoke coverage for the log import workflow in `tests/e2e/log-import.spec.ts`

### Implementation for User Story 1

- [x] T011 [P] [US1] Replace the placeholder landing content in `src/pages/HomePage.tsx` with the file picker, import actions, and high-level status display
- [x] T012 [P] [US1] Create log import results components in `src/components/log-import/LogImportResultsGrid.tsx` and `src/components/log-import/LogImportSummary.tsx`
- [x] T013 [US1] Wire file selection and parsing into `src/pages/HomePage.tsx` and `src/store/logImportStore.ts` so a selected file produces rows, errors, and summary counts
- [x] T014 [US1] Surface empty-state messaging, malformed-line reporting, file-read error handling, and import metadata such as source file name, size, and timing in `src/pages/HomePage.tsx` and `src/components/log-import/LogImportSummary.tsx`
- [x] T015 [US1] Connect the parsed row data to the grid display in `src/components/log-import/LogImportResultsGrid.tsx` with columns for timestamp, logger, level, message, and source file

**Checkpoint**: User Story 1 should now be fully functional and independently testable

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final updates that improve consistency, documentation, and confidence across the feature slice

- [x] T016 [P] Update `README.md` and `specs/002-log-import/quickstart.md` with the verified import workflow and validation steps
- [x] T017 Run `npm run test`, `npm run test:e2e`, and `npm run build` to validate the completed log import slice
- [x] T018 [P] Add a large-file browser validation scenario in `tests/e2e/log-import.spec.ts` that confirms the grid stays responsive and uses virtualization for 10,000+ lines

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks the user story phase
- **User Story (Phase 3)**: Depends on Foundational completion
- **Polish (Phase 4)**: Depends on the user story being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after the foundational phase is complete and does not depend on any other user story

### Within Each Phase

- Model and parser foundation should be completed before the UI wiring consumes them
- Tests should be written before or alongside the implementation they cover
- Components can be developed in parallel when they touch different files

### Parallel Opportunities

- T001 and T002 can run in parallel because they touch different files
- T003, T004, and T005 can run in parallel once the feature folders exist
- T007, T008, T009, and T010 can run in parallel because they cover different layers and files
- T011 and T012 can run in parallel because they create separate UI components

---

## Parallel Example: User Story 1

```bash
Task: "Add parser unit coverage for valid, empty, and malformed lines in src/core/parsers/logImportParser.test.ts"
Task: "Add store state coverage for import start, success, failure, and reset behavior in src/store/logImportStore.test.ts"
Task: "Add page smoke coverage for the import flow in src/pages/HomePage.test.tsx"
Task: "Add browser smoke coverage for the log import workflow in tests/e2e/log-import.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate the import flow with the documented scenarios

### Incremental Delivery

1. Establish the feature scaffold and data contracts
2. Add the parser and store foundation
3. Wire the file picker, row display, and error reporting
4. Validate the slice with unit tests, browser smoke tests, and build checks

### Parallel Team Strategy

With multiple developers:

1. One developer can create the model and parser foundation
2. Another developer can create the store and UI components
3. A third developer can add and run the tests once the interfaces stabilize

---

## Notes

- [P] tasks can run in parallel when they touch different files and do not depend on incomplete work
- The feature is intentionally limited to log import and inspection; search and filtering remain out of scope
- Keep the user story independently testable so the slice can be demonstrated as soon as the first import flow is working
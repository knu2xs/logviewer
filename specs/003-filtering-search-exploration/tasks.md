# Tasks: Filtering, Search, and Exploration

**Input**: Design documents from `/specs/003-filtering-search-exploration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include Vitest coverage for filter/store/component behavior and Playwright coverage for browser-visible workflows because the specification explicitly requires unit and E2E validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3])
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish prerequisites for the filtering slice before feature code begins.

- [X] T001 Create the filtering architecture ADR in docs/adr/0003-client-side-filtering.md
- [X] T002 Add date-range UI dependency support in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared domain contracts and state foundations that all filtering stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create filter state and result summary contracts in src/core/models/FilterState.ts and src/core/models/FilteredResultSummary.ts
- [X] T004 [P] Create time and severity contracts in src/core/models/TimeFilter.ts and src/core/models/SeverityValue.ts
- [X] T005 Update model exports for the filtering domain in src/core/models/index.ts
- [X] T006 Create the filter state store with default actions in src/store/logFilterStore.ts
- [X] T007 [P] Add store coverage for default state and reset behavior in src/store/logFilterStore.test.ts
- [X] T008 Update import-session reset behavior for new file imports in src/store/logImportStore.ts
- [X] T009 [P] Create logger option derivation utilities and tests in src/filters/getLoggerOptions.ts and src/filters/getLoggerOptions.test.ts

**Checkpoint**: Foundation ready. User story implementation can now begin in priority order or in parallel where noted.

---

## Phase 3: User Story 1 - Narrow Results Quickly (Priority: P1) 🎯 MVP

**Goal**: Deliver combined message, time, logger, severity, and shared result-count filtering so large datasets can be narrowed quickly.

**Independent Test**: Import a dataset, enter message text, choose logger values, set a minimum severity, apply a time window, and confirm only matching rows remain visible while the visible-versus-total count updates.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T010 [P] [US1] Add filter pipeline unit tests for message, logger, severity, time, and combined matching in src/filters/applyFilters.test.ts and src/filters/filterByTime.test.ts
- [X] T011 [US1] Add browser workflow coverage for combined filtering, search clear behavior, and time windows in tests/e2e/filtering-combined.spec.ts

### Implementation for User Story 1

- [X] T012 [P] [US1] Implement message search filtering in src/filters/filterByMessage.ts
- [X] T013 [P] [US1] Implement logger selection filtering in src/filters/filterByLogger.ts
- [X] T014 [P] [US1] Implement severity threshold filtering and unknown-level handling in src/filters/filterBySeverity.ts
- [X] T015 [US1] Implement dataset-anchored relative and custom time filtering in src/filters/filterByTime.ts
- [X] T016 [US1] Compose the shared filtering pipeline in src/filters/applyFilters.ts
- [X] T017 [US1] Build message, logger, severity, and search-clear controls in src/components/log-filter/LogFilterToolbar.tsx
- [X] T018 [US1] Build time window and custom range controls in src/components/log-filter/LogTimeFilter.tsx
- [X] T019 [US1] Wire derived filtered rows, logger options, latest timestamp derivation, and filter counts into src/pages/HomePage.tsx and src/components/log-import/LogImportResultsGrid.tsx
- [X] T020 [US1] Add filtering layout and toolbar styling in src/styles/index.css

**Checkpoint**: User Story 1 should be fully functional and independently testable as the MVP.

---

## Phase 4: User Story 2 - Refine Time Exploration (Priority: P2)

**Goal**: Refine the time filtering experience with clearer range validation and interaction polish for historical datasets.

**Independent Test**: Import a dataset with known timestamps, switch repeatedly between relative and custom time filters, and confirm the UI clearly rejects invalid ranges while preserving the last valid filtered result.

### Tests for User Story 2 ⚠️

- [X] T021 [US2] Add unit tests for invalid custom-range handling and range transitions in src/filters/filterByTime.test.ts and src/store/logFilterStore.test.ts
- [X] T022 [US2] Add browser workflow coverage for custom-range validation in tests/e2e/filtering-time.spec.ts

### Implementation for User Story 2

- [X] T023 [US2] Implement invalid custom-range validation and recovery behavior in src/store/logFilterStore.ts and src/components/log-filter/LogTimeFilter.tsx
- [X] T024 [US2] Add time-filter helper messaging and invalid-range presentation in src/components/log-filter/LogTimeFilter.tsx and src/styles/index.css

**Checkpoint**: User Stories 1 and 2 should both work independently, and time filtering should behave relative to the imported dataset rather than the system clock.

---

## Phase 5: User Story 3 - Recover From Empty Results (Priority: P3)

**Goal**: Keep the interface understandable and recoverable when active filters exclude every entry.

**Independent Test**: Apply filters that exclude all rows, confirm the empty-results state appears, and verify that clearing filters restores the imported dataset without re-importing the file.

### Tests for User Story 3 ⚠️

- [X] T025 [US3] Add component and store tests for empty-results recovery in src/pages/HomePage.test.tsx and src/store/logFilterStore.test.ts
- [X] T026 [US3] Add browser workflow coverage for empty-results recovery and new-import reset behavior in tests/e2e/filtering-empty-state.spec.ts

### Implementation for User Story 3

- [X] T027 [US3] Implement visible-versus-total result summary and clear-filters action in src/components/log-filter/FilteredResultsSummary.tsx
- [X] T028 [US3] Implement the empty-results recovery surface in src/components/log-filter/FilteredResultsEmptyState.tsx
- [X] T029 [US3] Wire empty-results rendering, clear-filters recovery, and new-import reset UX in src/pages/HomePage.tsx and src/components/log-import/LogImportSummary.tsx

**Checkpoint**: All user stories should now be independently functional and the filter UX should be recoverable from empty states.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish cross-story quality work, performance hardening, and documentation alignment.

- [X] T030 [P] Update usage and validation guidance in README.md and specs/003-filtering-search-exploration/quickstart.md
- [X] T031 Optimize filter recomputation and memoization behavior in src/filters/applyFilters.ts and src/pages/HomePage.tsx
- [X] T032 [P] Create or document a 50,000-entry validation fixture or generator in tests/e2e/fixtures and specs/003-filtering-search-exploration/quickstart.md
- [X] T033 [P] Run and document full validation coverage, including the 50,000-entry responsiveness check, in specs/003-filtering-search-exploration/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies and can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user story work
- **User Story 1 (Phase 3)**: Depends on Foundational completion and delivers the MVP
- **User Story 2 (Phase 4)**: Depends on Foundational completion and refines the time-filter experience after the full combined-filter MVP is stable
- **User Story 3 (Phase 5)**: Depends on Foundational completion and should be completed after the main filtering controls exist
- **Polish (Phase 6)**: Depends on the desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2 and has no dependency on other stories
- **User Story 2 (P2)**: Starts after Phase 2 and refines time-range validation and interaction behavior, but remains independently testable
- **User Story 3 (P3)**: Starts after Phase 2 and depends on visible filter state and result summaries, but remains independently testable

### Within Each User Story

- Story tests should be written first and verified failing before implementation
- Pure filter functions should exist before UI wiring that depends on them
- State wiring should exist before page-level rendering and recovery flows
- Each story should be validated independently before moving on

### Parallel Opportunities

- **Setup**: T001 and T002 can proceed independently
- **Foundational**: T003, T004, and T009 can proceed in parallel, followed by T006 and T007 in parallel after exports are ready
- **User Story 1**: T012, T013, and T014 can proceed in parallel before T016 composes the pipeline
- **User Story 2**: T021 can run while T023 is being designed if invalid-range cases are known
- **Polish**: T030, T032, and T033 can run in parallel once implementation is complete

---

## Parallel Example: User Story 1

```bash
# Build the independent filter helpers together:
Task: "Implement message search filtering in src/filters/filterByMessage.ts"
Task: "Implement logger selection filtering in src/filters/filterByLogger.ts"
Task: "Implement severity threshold filtering and unknown-level handling in src/filters/filterBySeverity.ts"
```

## Parallel Example: User Story 2

```bash
# Time-filter validation and implementation can be split across contributors:
Task: "Add unit tests for invalid custom-range handling and range transitions in src/filters/filterByTime.test.ts and src/store/logFilterStore.test.ts"
Task: "Implement invalid custom-range validation and recovery behavior in src/store/logFilterStore.ts and src/components/log-filter/LogTimeFilter.tsx"
```

## Parallel Example: User Story 3

```bash
# Recovery-specific browser validation can be developed alongside summary UI work:
Task: "Add browser workflow coverage for empty-results recovery and new-import reset behavior in tests/e2e/filtering-empty-state.spec.ts"
Task: "Implement visible-versus-total result summary and clear-filters action in src/components/log-filter/FilteredResultsSummary.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm combined message, time, logger, severity, search-clear, and result-count filtering works independently
5. Demo or ship the MVP if ready

### Incremental Delivery

1. Finish Setup + Foundational to establish contracts, state, and reset behavior
2. Deliver User Story 1 as the first meaningful investigation slice
3. Add User Story 2 for custom-range validation refinement and validate independently
4. Add User Story 3 for empty-results recovery and validate independently
5. Finish with polish and full validation

### Parallel Team Strategy

1. One contributor handles ADR and dependency setup while another prepares shared contracts
2. After Foundational completion:
   - Contributor A: User Story 1 filter helpers and toolbar
   - Contributor B: User Story 2 custom-range validation refinement
   - Contributor C: User Story 3 recovery states and browser coverage
3. Merge at each checkpoint with independent validation before moving forward

---

## Notes

- [P] tasks target different files and avoid unnecessary conflicts
- [US1], [US2], and [US3] labels keep every task traceable to a specific user story
- The MVP scope is User Story 1 only
- ADR creation is required before implementation to satisfy the constitution
- Logger option derivation, search-clear behavior, and 50,000-entry validation are explicit deliverables in this task list
- `test-results/` remains generated output and should stay out of committed feature work

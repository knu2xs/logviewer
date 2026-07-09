<!--
Sync Impact Report
- Version: template -> 1.0.0
- Modified principles: initial placeholder principle 1 -> Domain Contracts First; initial placeholder principle 2 -> Mantine Shell Architecture; initial placeholder principle 3 -> Testable by Default; initial placeholder principle 4 -> ADR-Backed Decisions; initial placeholder principle 5 -> Small Vertical Slices
- Added sections: Architecture & Tooling Standards; Delivery & Quality Gates
- Removed sections: template placeholders and example comments
- Templates updated: none required
- Deferred items: none
-->

# Log Viewer Constitution

## Core Principles

### Domain Contracts First

All shared domain concepts MUST be expressed as explicit TypeScript interfaces in `src/core`. `LogEntry`, `LogParser`, and later parser contracts are the source of truth for application data. UI code, tests, and future features consume these contracts rather than duplicating shape assumptions. This keeps parsing and rendering aligned as the application grows.

### Mantine Shell Architecture

The application shell MUST use React, TypeScript, and Mantine for shared layout, theming, and visual consistency. Shell concerns belong in `src/app`, while content belongs in `src/pages`. Shared UI should prefer Mantine components over custom one-off layout code unless there is a clear reason not to. This keeps the experience coherent and the shell easy to evolve.

### Testable by Default

Every meaningful feature MUST be backed by automated verification at the smallest useful level before it is considered complete. Vitest covers unit and shell smoke tests; Playwright covers browser-visible behavior and critical user flows. A feature is not complete if it cannot be validated through repeatable tests. This keeps refactors safe and AI-generated changes honest.

### ADR-Backed Decisions

Any non-trivial architecture choice, parser/plugin strategy, or significant dependency change MUST be captured in `docs/adr` before implementation. This is especially important for parser discovery, registration, and extension behavior. When a decision affects the long-term shape of the system, the ADR is the contract that keeps implementation aligned.

### Small Vertical Slices

Work MUST be delivered as small, vertical slices that preserve a working application. Foundation work establishes the shell, contracts, and tests first; the next feature spec (`002-log-import`) should focus only on file selection, line parsing, and log-entry display without search or filtering. This keeps each story easy to reason about and easy for Copilot to implement correctly.

## Architecture & Tooling Standards

- Use React + TypeScript + Vite as the application stack.
- Keep public dependencies only; avoid private or ad hoc package sources.
- Place shell components in `src/app`, reusable UI in `src/components`, domain contracts in `src/core/models` and `src/core/parsers`, pages in `src/pages`, shared state in `src/store`, and global styles in `src/styles`.
- Maintain a browser-visible header, main content region, and footer in the shell.
- Prefer Mantine for layout and shared UI primitives; use custom CSS only when a requirement cannot be expressed cleanly through Mantine.
- Keep the app buildable with `npm run build` at all times.

## Delivery & Quality Gates

- Before implementing a significant feature, add or update the relevant ADR.
- Keep `npm run lint`, `npm run format`, `npm run build`, `npm run test`, and `npm run test:e2e` green for the current foundation.
- Add or update Vitest smoke coverage when shell or shared-state behavior changes.
- Add or update Playwright smoke coverage when browser-visible behavior changes.
- Treat failing tests as blocking feedback, not as optional follow-up work.
- Preserve incremental, reviewable commits that map cleanly to a spec or task slice.

## Governance

This constitution supersedes informal conventions, templates, and generated code suggestions when they conflict.

Amendments require:

1. Updating this file with a clear version bump and sync impact report.
2. Updating any affected ADRs, docs, tests, or workflow notes.
3. Verifying that the build, lint, unit smoke, and browser smoke checks still pass.

Versioning follows semantic rules: MAJOR for principle removal or redefinition, MINOR for new principles or materially expanded guidance, and PATCH for wording or clarity changes.

Compliance is reviewed during design, implementation, and final validation. If a change cannot be justified against the constitution, it should not ship yet.

**Version**: 1.0.0 | **Ratified**: 2026-07-09 | **Last Amended**: 2026-07-09

# ADR 0001: React + TypeScript Foundation

## Status
Accepted

## Context
The project foundation needs a predictable stack for building a log viewer UI, shared shell layout, and future feature pages. The codebase already uses React, TypeScript, Vite, Mantine, ESLint, Prettier, Vitest, and Playwright.

## Decision
Use React and TypeScript as the application foundation, with Vite for development and production builds. Use Mantine for the UI shell and shared visual system. Use ESLint and Prettier for code quality, Vitest for unit smoke tests and logic tests, and Playwright for browser smoke tests.

## Consequences
- Fast development iteration with Vite HMR.
- Strong typing for domain models and app state.
- A consistent component library and shell structure with Mantine.
- Reliable automated verification at both unit and browser levels.
- Future features can build on a stable, documented baseline.

# Quickstart & Validation Guide

**Date**: 2026-07-09 | **Feature**: Project Foundation | **Phase**: Phase 1 Design

## Overview

This guide provides developers with step-by-step instructions to set up the project foundation and validate that all components are working correctly.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18+ ([download](https://nodejs.org/))
- **npm**: v9+ (included with Node.js)
- **Git**: For cloning and version control
- **VS Code**: Recommended editor (or any TypeScript-capable editor)

**Verify Installation**:

```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show v9.x.x or higher
git --version     # Should show git version info
```

---

## Part 1: Project Setup

### Step 1.1: Clone Repository

```bash
git clone <repository-url> logviewer
cd logviewer
```

### Step 1.2: Install Dependencies

```bash
npm install
```

**Expected Output**:

```
added XXX packages, and audited XXX packages in XXsec
```

### Step 1.3: Verify Installation

Check that all key packages are installed:

```bash
npm ls react zustand vitest
```

**Expected Output**:

```
logviewer@1.0.0
├── react@18.x.x
├── zustand@4.x.x
├── vitest@1.x.x
└── ... other dependencies
```

---

## Part 2: Development Server

### Step 2.1: Start Development Server

```bash
npm run dev
```

**Expected Output**:

```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 2.2: Validate Application Shell

Open http://localhost:5173 in your browser.

**Expected to See**:

- ✅ Page title: "Log Viewer" or similar
- ✅ Header with application title
- ✅ Main content area with welcome message
- ✅ Footer with copyright notice
- ✅ Load/Browse buttons (no functional behavior required yet)

**Screenshot Validation Checklist**:

```
[ ] Header section visible at top
[ ] Main content section in middle (with welcome message)
[ ] Footer section at bottom
[ ] No console errors (open DevTools: F12)
[ ] Page loaded successfully
```

### Step 2.3: Hot Module Replacement (HMR)

Modify `src/pages/HomePage.tsx` - change welcome message and save:

```typescript
<h2>Welcome to Log Viewer - Updated!</h2>
```

**Expected**: Page updates automatically without full refresh (HMR working)

---

## Part 3: Code Quality Validation

### Step 3.1: Run Linting

```bash
npm run lint
```

**Expected Output**:

```
No eslint errors
```

**If errors appear**:

- Fix all reported errors (or fix with --fix flag)
- Re-run `npm run lint` to verify

### Step 3.2: Run Formatting

```bash
npm run format
```

**Expected Output**:

```
[file count] file(s) formatted
```

### Step 3.3: Verify Linting Again

```bash
npm run lint
```

**Expected Output**:

```
No eslint errors
```

---

## Part 4: Build Validation

### Step 4.1: Production Build

```bash
npm run build
```

**Expected Output**:

```
✓ XXX modules transformed. XX files generated (XXX KiB) in XXsec
```

**Expected Result**:

- `dist/` folder created with optimized build
- No errors in console

### Step 4.2: Verify Build Output

```bash
ls -la dist/
```

**Expected Files**:

```
index.html
assets/
  ├── index.xxxxxx.js
  └── index.xxxxxx.css
```

### Step 4.3: Preview Build

```bash
npm run preview
```

**Expected Output**:

```
➜  Local:   http://localhost:4173/
```

Navigate to http://localhost:4173 and verify app shell still displays correctly.

---

## Part 5: Testing Validation

### Step 5.1: Unit Tests with Vitest

```bash
npm run test
```

**Expected Output**:

```
Test Files  [count] passed ([count])
Tests  [count] passed ([count])
Passed time XXsec
```

**Note**: Initial test suite may be minimal - this validates Vitest is configured

### Step 5.2: E2E Tests with Playwright

First, install Playwright browsers (one-time):

```bash
npx playwright install
```

Then run E2E tests:

```bash
npm run test:e2e
```

**Expected Output**:

```
[chromium]  [test count] passed
```

**What tests validate**:

- Application shell renders
- Header is visible
- Main content loads
- Footer is visible

---

## Part 6: Domain Model Validation

### Step 6.1: Verify LogEntry Interface

Create a test file to verify LogEntry imports:

```bash
cat > test-logentry.ts << 'EOF'
import { LogEntry } from './src/core/models/LogEntry';

const entry: LogEntry = {
  timestamp: new Date(),
  logger: 'test.app',
  level: 'INFO',
  message: 'Test message',
  sourceFile: 'test.ts'
};

console.log('✅ LogEntry interface validated:', entry);
EOF
```

Compile with TypeScript:

```bash
npx tsc --noEmit test-logentry.ts
```

**Expected Output**:

- No TypeScript errors
- Successfully compiles

Clean up:

```bash
rm test-logentry.ts
```

### Step 6.2: Verify LogParser Interface

Create another test file:

```bash
cat > test-logparser.ts << 'EOF'
import { LogParser } from './src/core/parsers/LogParser';
import { LogEntry } from './src/core/models/LogEntry';

// Mock implementation to verify interface
class TestParser implements LogParser {
  readonly name = 'Test Parser';

  canParse(sample: string): boolean {
    return true;
  }

  parse(line: string, fileName: string): LogEntry | null {
    if (!line.trim()) return null;

    return {
      timestamp: new Date(),
      logger: 'test',
      level: 'INFO',
      message: line,
      sourceFile: fileName
    };
  }
}

const parser: LogParser = new TestParser();
console.log('✅ LogParser interface validated:', parser.name);
EOF
```

Compile:

```bash
npx tsc --noEmit test-logparser.ts
```

**Expected Output**:

- No TypeScript errors

Clean up:

```bash
rm test-logparser.ts
```

### Step 6.3: Verify Zustand Store

In browser DevTools console (F12 → Console):

```javascript
// Import and test the store
import { useAppStore } from './src/store/appStore.js';

const state = useAppStore.getState();
console.log('App Name:', state.appName);
console.log('Version:', state.version);
console.log('✅ Store validated');
```

**Expected Output**:

```
App Name: Log Viewer
Version: 1.0.0
✅ Store validated
```

---

## Part 7: Complete Validation Checklist

Run this comprehensive validation:

```bash
# 1. Install dependencies
npm install

# 2. Lint all files
npm run lint

# 3. Format all files
npm run format

# 4. Verify no lint errors after format
npm run lint

# 5. Run unit tests
npm run test

# 6. Run E2E tests
npm run test:e2e

# 7. Build production
npm run build

# 8. Verify build output
ls -la dist/
```

### Full Validation Success Criteria

| Step | Command            | Success Criteria                    |
| ---- | ------------------ | ----------------------------------- |
| 1    | `npm install`      | All packages installed, no errors   |
| 2    | `npm run lint`     | Zero ESLint errors                  |
| 3    | `npm run format`   | Files formatted                     |
| 4    | `npm run lint`     | Still zero errors after format      |
| 5    | `npm run test`     | All tests pass                      |
| 6    | `npm run test:e2e` | All E2E tests pass                  |
| 7    | `npm run build`    | Build succeeds, no errors           |
| 8    | `ls dist/`         | dist/ folder contains HTML, JS, CSS |

---

## Part 8: Troubleshooting

### Issue: npm install fails

**Solution**:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: dev server won't start

**Solution**:

```bash
# Kill existing process on port 5173
# On Windows:
netstat -ano | find ":5173"
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :5173
kill -9 <PID>

# Try again
npm run dev
```

### Issue: Tests fail or timeout

**Solution**:

```bash
# Reinstall Playwright browsers
npx playwright install

# Run tests again
npm run test:e2e
```

### Issue: TypeScript errors in editor

**Solution**:

- Restart VS Code
- Verify TypeScript version: `npm ls typescript`
- Run `npm run build` to see full error output

### Issue: App shell not rendering

**Solution**:

- Open browser DevTools (F12)
- Check Console tab for errors
- Verify App.tsx imports AppShell correctly
- Run `npm run lint` to check for syntax errors

---

## Part 9: Next Steps

After successful validation:

1. **Start Development**:

   ```bash
   npm run dev
   ```

   Keep this running in a terminal

2. **Create Feature Branch**:

   ```bash
   git checkout -b 001-project-foundation
   ```

3. **Make Changes**:
   - Modify components in `src/`
   - Add new features in `src/features/`
   - Add new components in `src/components/`

4. **Test Changes**:

   ```bash
   npm run test      # Unit tests
   npm run test:e2e  # E2E tests
   npm run lint      # Code quality
   ```

5. **Commit Changes**:
   ```bash
   npm run format    # Format first
   git add .
   git commit -m "Implement feature"
   git push origin 001-project-foundation
   ```

---

## Quick Reference Commands

```bash
# Development
npm run dev           # Start dev server
npm run preview       # Preview production build

# Code Quality
npm run lint          # Check linting
npm run format        # Format all files

# Building
npm run build         # Production build

# Testing
npm run test          # Run unit tests
npm run test:e2e      # Run E2E tests

# Utilities
npm install           # Install dependencies
npm update            # Update all packages
npm outdated          # Check for outdated packages
```

---

**Quickstart Status**: ✅ Ready for development

**Prepared by**: Speckit Planning Agent | **Date**: 2026-07-09

# AppState Contract

**Date**: 2026-07-09 | **Version**: 1.0.0

## Contract Overview

This contract specifies the formal interface and behavior requirements for the `AppState` type stored in the Zustand global store.

## Interface Definition

```typescript
export interface AppState {
  appName: string;
  version: string;
}
```

## Property Contracts

### appName: string

**Contract**:

- Type: String
- Nullable: No (required, non-empty)
- Min Length: 1 character
- Max Length: 100 characters (recommended)
- Format: UTF-8 encoding
- Default Value: `"Log Viewer"`
- Mutability: Should not change during runtime (but technically mutable via store)
- Semantics: Display name of the application shown to users

**Examples**:

```typescript
const valid1 = 'Log Viewer';
const valid2 = 'Enterprise Log Analyzer';
const valid3 = 'My Log Tool';
const invalid = ''; // Empty string not allowed
```

**Constraints**:

- Non-empty string
- No leading/trailing whitespace
- UTF-8 encoding
- May contain numbers, spaces, special characters

**Usage**:

```typescript
// In components
const appName = useAppStore((state) => state.appName);
<h1>{ appName } < /h1> / / Display in header;
```

### version: string

**Contract**:

- Type: String (Semantic Versioning format)
- Nullable: No (required)
- Format: `MAJOR.MINOR.PATCH` with optional pre-release and metadata
- Default Value: `"1.0.0"`
- Mutability: Should not change during runtime (set at build time)
- Semantics: Application version following SemVer 2.0.0

**SemVer Format**:

```
MAJOR.MINOR.PATCH[-prerelease][+metadata]
^     ^     ^
|     |     └─ Patch version (bug fixes)
|     └─────── Minor version (features, backward compatible)
└───────────── Major version (breaking changes)
```

**Examples**:

```typescript
const valid1 = '1.0.0'; // Standard release
const valid2 = '1.2.3'; // After bug fixes and features
const valid3 = '2.0.0'; // Major version bump
const valid4 = '1.0.0-alpha'; // Pre-release
const valid5 = '1.0.0-beta.1'; // Pre-release with number
const valid6 = '1.0.0+build.123'; // With build metadata
const invalid = '1.0'; // Missing patch version
const invalid2 = 'v1.0.0'; // Should not include 'v' prefix
```

**Validation Pattern**:

```regex
^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$
```

**Constraints**:

- Must match SemVer 2.0.0 specification
- Only numeric components for MAJOR.MINOR.PATCH
- Pre-release and metadata are optional
- Set at build time, not changed at runtime

**Usage**:

```typescript
// In components
const version = useAppStore((state) => state.version);
<footer>v{version}</footer> // Display in footer
```

## AppState in Zustand Store

**Context**: AppState is part of the larger AppStoreState interface:

```typescript
interface AppStoreState extends AppState {
  // UI state
  darkMode: boolean;
  isLoading: boolean;

  // UI actions
  setDarkMode: (enabled: boolean) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  // AppState (immutable application metadata)
  appName: 'Log Viewer',
  version: '1.0.0',

  // UI State (mutable)
  darkMode: false,
  isLoading: false,

  // Actions
  setDarkMode: (enabled) => set({ darkMode: enabled }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
```

## Initialization Contract

**Initial State**:

```typescript
const initialState: AppState = {
  appName: 'Log Viewer',
  version: '1.0.0',
};
```

**Build-Time Configuration**:

```typescript
// In build process or environment variables
const appName = process.env.REACT_APP_NAME || 'Log Viewer';
const version = process.env.REACT_APP_VERSION || '1.0.0';

export const useAppStore = create<AppStoreState>((set) => ({
  appName,
  version,
  // ...
}));
```

## Access Patterns

### Reading AppState

**Pattern 1: Full AppState**

```typescript
function Header() {
  const { appName, version } = useAppStore((state) => ({
    appName: state.appName,
    version: state.version
  }));

  return (
    <header>
      <h1>{appName}</h1>
      <span>v{version}</span>
    </header>
  );
}
```

**Pattern 2: Selective Properties**

```typescript
function Footer() {
  const version = useAppStore((state) => state.version);

  return (
    <footer>
      <p>&copy; 2026 {version}</p>
    </footer>
  );
}
```

**Pattern 3: Direct Store Access** (less recommended)

```typescript
const state = useAppStore.getState();
console.log(state.appName, state.version);
```

### Writing to AppState (Not Recommended)

**Note**: AppState properties should not be modified at runtime. They are set at initialization:

```typescript
// ❌ Do not do this at runtime:
useAppStore.setState({ appName: 'New Name' }); // Don't mutate

// ✅ Set at build time/initialization only:
// Via environment variables or configuration
```

## Validation Contract

**Validation Function**:

```typescript
function isValidAppState(state: unknown): state is AppState {
  if (!state || typeof state !== 'object') return false;

  const s = state as Record<string, unknown>;
  const semverPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/;

  return (
    typeof s.appName === 'string' &&
    s.appName.length > 0 &&
    s.appName.length <= 100 &&
    typeof s.version === 'string' &&
    semverPattern.test(s.version as string)
  );
}
```

## JSON Serialization

**Serialization Format**:

```json
{
  "appName": "Log Viewer",
  "version": "1.0.0"
}
```

**Rules**:

- Both properties serialize as strings
- No additional properties
- All properties required

**Usage Example**:

```typescript
const state = useAppStore.getState();
const json = JSON.stringify({
  appName: state.appName,
  version: state.version,
});
// Result: {"appName":"Log Viewer","version":"1.0.0"}
```

## Example Instances

### Example 1: Development Build

```typescript
{
  appName: 'Log Viewer',
  version: '1.0.0-dev'
}
```

### Example 2: Alpha Release

```typescript
{
  appName: 'Log Viewer',
  version: '1.0.0-alpha.1'
}
```

### Example 3: Production Release

```typescript
{
  appName: 'Log Viewer',
  version: '1.2.3'
}
```

### Example 4: With Build Metadata

```typescript
{
  appName: 'Log Viewer',
  version: '1.2.3+build.2026.07.09'
}
```

## Immutability Contract

**Guarantee**: AppState properties should be treated as effectively immutable (read-only).

```typescript
// ✅ Safe usage - read only
const name = useAppStore((state) => state.appName);

// ❌ Unsafe - do not mutate
useAppStore.setState({ appName: 'New Name' }); // Avoid at runtime
```

## Component Examples

### App Header Component

```typescript
export function AppHeader() {
  const appName = useAppStore((state) => state.appName);

  return (
    <header className="app-header">
      <h1>{appName}</h1>
    </header>
  );
}
```

### App Footer Component

```typescript
export function AppFooter() {
  const { appName, version } = useAppStore((state) => ({
    appName: state.appName,
    version: state.version
  }));

  return (
    <footer className="app-footer">
      <p>&copy; 2026 {appName}</p>
      <span>v{version}</span>
    </footer>
  );
}
```

### About Dialog

```typescript
export function AboutDialog() {
  const { appName, version } = useAppStore((state) => ({
    appName: state.appName,
    version: state.version
  }));

  return (
    <div className="about">
      <h2>About {appName}</h2>
      <p>Version: {version}</p>
      <p>A powerful log viewing and analysis tool.</p>
    </div>
  );
}
```

## Versioning Strategy

### Version Bumping

- **MAJOR**: Breaking API changes, significant UI overhaul
- **MINOR**: New features, enhancements (backward compatible)
- **PATCH**: Bug fixes only

### Pre-release Versions

- Development: `1.0.0-dev`
- Alpha: `1.0.0-alpha.1`
- Beta: `1.0.0-beta.1`
- Release Candidate: `1.0.0-rc.1`

### Build Metadata

- Can be added for specific builds: `1.0.0+build.2026.07.09`
- Should not affect version precedence

## Future Extensions

**Possible v2.0 Additions**:

```typescript
interface AppState {
  appName: string;
  version: string;
  // Possible future additions:
  // environment: 'development' | 'staging' | 'production';
  // buildDate: string;
  // commitHash: string;
}
```

---

**Contract Status**: ✅ APPROVED | **Version**: 1.0.0 | **Date**: 2026-07-09

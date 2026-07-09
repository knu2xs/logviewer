import { beforeEach, describe, expect, it } from 'vitest';

import { useAppStore } from './appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      appName: 'Log Viewer',
      version: '1.0.0',
      darkMode: false,
      isLoading: false,
    });
  });

  it('initializes with the default application state', () => {
    const state = useAppStore.getState();

    expect(state.appName).toBe('Log Viewer');
    expect(state.version).toBe('1.0.0');
    expect(state.darkMode).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('updates dark mode state', () => {
    useAppStore.getState().setDarkMode(true);

    expect(useAppStore.getState().darkMode).toBe(true);
  });

  it('updates loading state', () => {
    useAppStore.getState().setIsLoading(true);

    expect(useAppStore.getState().isLoading).toBe(true);
  });
});

/**
 * Application Store
 *
 * Global state management using Zustand for application-wide state.
 * This store holds state that needs to be accessed across multiple
 * components and features without prop drilling.
 *
 * Organized in slices for different domains:
 * - UI state (theme, layout preferences, etc.)
 * - Application state (app name, version, etc.)
 * - Feature state (search filters, sorting, etc.)
 *
 * For feature-specific state, create separate stores in feature directories.
 */

import { create } from 'zustand';

/**
 * AppState Interface
 *
 * Defines the basic application metadata
 */
export interface AppState {
  /** Application name */
  appName: string;

  /** Application version */
  version: string;
}

/**
 * AppStoreState Interface
 *
 * Defines the shape of the application's global state
 */
interface AppStoreState extends AppState {
  /**
   * UI Domain State
   */

  /** Whether dark mode is enabled */
  darkMode: boolean;

  /** Set the dark mode preference */
  setDarkMode: (enabled: boolean) => void;

  /** Whether the application is currently loading */
  isLoading: boolean;

  /** Set loading state */
  setIsLoading: (loading: boolean) => void;
}

/**
 * Create the global Zustand store
 *
 * This store is initialized with default values and provides
 * both state and action methods for updating state.
 */
export const useAppStore = create<AppStoreState>((set) => ({
  // Application state
  appName: 'Log Viewer',
  version: '1.0.0',

  // UI state
  darkMode: false,
  setDarkMode: (enabled: boolean) => set({ darkMode: enabled }),

  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
}));

declare global {
  interface Window {
    __APP_STORE__?: typeof useAppStore;
  }
}

if (import.meta.env.DEV) {
  window.__APP_STORE__ = useAppStore;
}

/**
 * Example usage in components:
 *
 * // In a component:
 * const { darkMode, setDarkMode } = useAppStore();
 *
 * // Subscribe to specific state slices:
 * const darkMode = useAppStore((state) => state.darkMode);
 *
 * // Update state:
 * useAppStore.setState({ darkMode: true });
 */

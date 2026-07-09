/**
 * AppShell Component
 *
 * Root layout component providing the main application structure.
 * Includes header, main content area, and footer components.
 *
 * This component serves as the wrapper for all pages and features,
 * establishing the consistent layout and navigation structure
 * used throughout the application.
 */

import React from 'react';
import '../styles/index.css';

interface AppShellProps {
  children?: React.ReactNode;
}

/**
 * AppShell - Main application layout component
 *
 * Renders the application structure with:
 * - Header section at the top
 * - Main content area (provided via children)
 * - Footer section at the bottom
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-content">
          <h1>Log Viewer</h1>
          <nav>{/* Navigation will be added in future features */}</nav>
        </div>
      </header>

      <main className="app-main">
        <div className="app-main-content">{children}</div>
      </main>

      <footer className="app-footer">
        <div className="app-footer-content">
          <p>&copy; 2026 Log Viewer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;

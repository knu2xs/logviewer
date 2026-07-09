/**
 * HomePage Component
 *
 * The default landing page of the application.
 * Serves as the entry point for users and provides access to
 * the main features and functionality.
 *
 * This page composes the AppShell layout with the home page content.
 * Future features like log loading, searching, and filtering
 * will be integrated here.
 */

import React from 'react';
import { useAppStore } from '../store/appStore';

/**
 * HomePage - Main application landing page
 *
 * Displays a welcome screen with options to:
 * - Load log files
 * - Access recent logs
 * - Access application settings
 *
 * This is a placeholder implementation demonstrating the basic structure.
 * Future iterations will add actual functionality and styling.
 */
export const HomePage: React.FC = () => {
  const appName = useAppStore((state) => state.appName);

  return (
    <div className="home-page">
      <div className="home-page-content">
        <h2>Welcome to Log Viewer</h2>

        <p>{appName} is a powerful application for viewing, searching, and analyzing log files.</p>

        <section className="home-section">
          <h3>Getting Started</h3>
          <ul>
            <li>Load a log file to begin analyzing logs</li>
            <li>Use search and filter features to find specific entries</li>
            <li>View statistics and trends in your log data</li>
          </ul>
        </section>

        <section className="home-section">
          <h3>Supported Formats</h3>
          <p>
            Log Viewer supports various log formats including JSON, plain text, and structured logs.
          </p>
        </section>

        <div className="home-actions">
          <button className="btn btn-primary">Load Log File</button>
          <button className="btn btn-secondary">View Recent Logs</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

/**
 * App Component
 *
 * Root component of the application.
 * Provides the main application layout with AppShell and routes to pages.
 *
 * This component serves as the entry point for the React application,
 * wrapping all pages and features with the consistent AppShell layout.
 */

import { AppShell } from './app/AppShell';
import { HomePage } from './pages/HomePage';

/**
 * App - Main root component
 *
 * Renders the application with:
 * - AppShell providing the header, footer, and main layout
 * - HomePage as the default page content
 *
 * Future iterations will add React Router for multi-page navigation
 */
function App() {
  return (
    <AppShell>
      <HomePage />
    </AppShell>
  );
}

export default App;

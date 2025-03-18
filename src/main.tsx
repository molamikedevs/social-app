import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryProvider } from './lib/react-query/QueryProvider';

/**
 * The root of the React application.
 * 
 * - Wraps the entire application with necessary providers for state management and routing.
 * - Uses `ReactDOM.createRoot()` for rendering the application in a way that is optimized for React 18.
 * - Ensures that routing, authentication, and data fetching states are available globally.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
    /**
     * BrowserRouter:
     * - Provides client-side routing capabilities using React Router.
     * - Allows navigation between different pages without full-page reloads.
     */
    <BrowserRouter>
        {/**
         * QueryProvider:
         * - Manages server state and caching using React Query.
         * - Helps with data fetching, caching, synchronization, and updates.
         */}
        <QueryProvider>
            {/**
             * AuthProvider:
             * - Manages authentication state and user session.
             * - Provides authentication context to all components within the app.
             */}
            <AuthProvider>
                {/**
                 * The main application component.
                 * - All pages and UI components are rendered inside this.
                 */}
                <App />
            </AuthProvider>
        </QueryProvider>
    </BrowserRouter>
);

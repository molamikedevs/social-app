import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/appwrite/api";
import { IContextType, IUser } from "../types";
import { createContext, useContext, useEffect, useState } from "react";

/**
 * Initial state for the user object.
 * This represents an unauthenticated user with default empty values.
 */
export const INITIAL_USER: IUser = {
    id: '',
    name: '',
    username: '',
    email: '',
    imageUrl: '',
    bio: '',
};

/**
 * Initial state for the authentication context.
 * Provides default values and function placeholders to prevent errors in uninitialized components.
 */
const INITIAL_STATE: IContextType = {
    user: INITIAL_USER, // Default user object
    isAuthenticated: false, // User is not authenticated initially
    isLoading: false, // Loading state for authentication checks
    setUser: () => {}, // Placeholder function for setting the user
    setIsAuthenticated: () => {}, // Placeholder function for setting authentication state
    checkAuthUser: async () => false, // Default function that always returns false
};

/**
 * Creates a React Context for authentication.
 * This allows the authentication state to be shared across the application.
 */
const AuthContext = createContext<IContextType>(INITIAL_STATE);

/**
 * AuthProvider component that manages authentication state and user data.
 * Wraps the entire application to provide authentication context.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>(INITIAL_USER); // Stores user data
    const [isLoading, setIsLoading] = useState<boolean>(true); // Tracks if authentication check is in progress
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Tracks if the user is authenticated

    const navigate = useNavigate(); // React Router hook for navigation

    /**
     * Checks if a user is authenticated by fetching the current user data.
     * - If a user is found, updates the authentication state.
     * - If no user is found, sets authentication to false.
     */
    const checkAuthUser = async (): Promise<boolean> => {
        try {
            const currentUser = await getCurrentUser();

            if (currentUser) {
                setUser({
                    id: currentUser.$id,
                    name: currentUser.name,
                    username: currentUser.username,
                    email: currentUser.email,
                    imageUrl: currentUser.imageUrl,
                    bio: currentUser.bio,
                });

                setIsAuthenticated(true);
                return true;
            }

            return false;
        } catch (error) {
            console.log("Error checking authentication:", error);
            return false;
        } finally {
            setIsLoading(false); // Ensure loading state is updated
        }
    };

    /**
     * useEffect Hook:
     * - Runs when the component mounts.
     * - Checks for authentication cookies.
     * - Redirects to the sign-in page if cookies are missing.
     * - Calls `checkAuthUser()` to verify authentication.
     */
    useEffect(() => {
        const cookieFallback = localStorage.getItem('cookieFallback');

        if (cookieFallback === '[]' || cookieFallback === null) {
					navigate('/sign-in') // Redirect to sign-in if authentication cookies are missing
				}

        checkAuthUser(); // Verify user authentication status
    }, []);

    /**
     * Context value object containing authentication-related state and functions.
     */
    const value = {
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoading,
        checkAuthUser,
    };

    /**
     * Provides authentication context to child components.
     */
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to access authentication context.
 * Ensures that it is only used within an `AuthProvider`.
 */
export const useUserContext = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useUserContext must be used within an AuthProvider');
    }

    return context;
};

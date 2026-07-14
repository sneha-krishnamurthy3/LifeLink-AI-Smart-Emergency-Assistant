import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute
 *
 * A higher-order route component that guards routes behind authentication.
 *
 * IMPORTANT: No routes are currently protected.
 * This component exists to be READY for use in App.jsx when authentication
 * is integrated with actual user features (e.g., My Health Hub, Medical Records).
 *
 * Usage (when you are ready to protect a route):
 *
 *   <Route
 *     path="/dashboard"
 *     element={
 *       <ProtectedRoute>
 *         <Dashboard />
 *       </ProtectedRoute>
 *     }
 *   />
 *
 * If the user is not authenticated, they will be redirected to /auth.
 * The current page URL is preserved so the user is returned after login.
 *
 * @param {React.ReactNode} children - The component to render if authenticated.
 * @param {string} [redirectTo="/auth"] - Where to redirect unauthenticated users.
 */
const ProtectedRoute = ({ children, redirectTo = '/auth' }) => {
  const { isAuthenticated, loading } = useAuth();

  // While the auth session is being resolved, render nothing rather than
  // flashing a redirect. This is a very brief window (< 300ms typically).
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;

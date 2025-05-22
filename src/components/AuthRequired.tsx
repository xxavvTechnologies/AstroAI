import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveRedirectPath } from '../utils/authRedirect';

interface AuthRequiredProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that requires authentication
 * If the user is not authenticated, they will be redirected to the login page
 * The current path will be saved for redirect after successful authentication
 */
const AuthRequired: React.FC<AuthRequiredProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      // Save the current path for redirect after login
      saveRedirectPath(location.pathname + location.search);
      // Redirect to login with the current location in state
      navigate('/login', { state: { from: location.pathname + location.search } });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    // You could return a loading spinner here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If user is authenticated, render the children
  return user ? <>{children}</> : null;
};

export default AuthRequired;

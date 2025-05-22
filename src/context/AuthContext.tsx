import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../config/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getRedirectUrl } from '../utils/authRedirect';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithTwitter: () => Promise<void>;
  authError: string | null;
  setAuthError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
  loginWithGithub: async () => {},
  loginWithTwitter: async () => {},
  authError: null,
  setAuthError: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Set up initial session and user state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    // Get current session on initial load
    const getCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    
    getCurrentSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (error: AuthError) => {
    console.error('Auth error:', error);
    
    // Map Supabase error messages to user-friendly messages
    if (error.message === 'User cancelled the login flow') {
      setAuthError('Login attempt was cancelled');
    } else if (error.message.includes('Email link is invalid or has expired')) {
      setAuthError('Invalid login link or link has expired');
    } else {
      setAuthError(error.message);
    }
    throw error;
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      handleAuthError(error);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl()
        }
      });
      
      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const loginWithGithub = async () => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: getRedirectUrl()
        }
      });
      
      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  const loginWithTwitter = async () => {
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: getRedirectUrl()
        }
      });
      
      if (error) {
        handleAuthError(error);
      }
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      loginWithGoogle,
      loginWithGithub,
      loginWithTwitter,
      authError,
      setAuthError 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

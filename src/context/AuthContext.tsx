import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, githubProvider } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
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
  authError: null,
  setAuthError: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAuthError = (error: any) => {
    console.error('Auth error:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      setAuthError('Login attempt was cancelled');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      setAuthError('An account already exists with the same email address but different sign-in credentials');
    } else {
      setAuthError(error.message);
    }
    throw error;
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const loginWithGithub = async () => {
    try {
      setAuthError(null);
      githubProvider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      handleAuthError(error);
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
      authError,
      setAuthError 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

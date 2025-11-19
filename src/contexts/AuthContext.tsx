import React, { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { type User, type UserRole } from '@/types';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface AuthContextType {
  user: User | null;
  authToken: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; role?: UserRole; user?: User }>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string
  ) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  completeOAuthLogin: (token: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (updatedUser: User) => void;
  isAuthenticated: boolean;
  supportsOAuth: boolean;
  authReady: boolean;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const TOKEN_STORAGE_KEY = 'bubt-auth-token';
const USER_STORAGE_KEY = 'bubt-current-user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const [supportsOAuth] = useState<boolean>(isFirebaseConfigured);

  const persistUser = useCallback((value: User | null) => {
    setUser(value);
    try {
      if (value) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(value));
      } else {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const persistToken = useCallback((value: string | null) => {
    setToken(value);
    try {
      if (value) {
        localStorage.setItem(TOKEN_STORAGE_KEY, value);
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        setToken(storedToken);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const syncWithBackend = useCallback(
    async (firebaseIdToken: string, extra?: { name?: string; phone?: string; role?: UserRole }): Promise<User | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firebaseIdToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(extra ?? {}),
        });

        if (!response.ok) {
          console.warn('Auth sync failed with backend');
          return null;
        }

        const data = await response.json();
        const backendUser = data.user as User;
        const sessionToken = typeof data.token === 'string' ? data.token : null;
        persistUser(backendUser);
        if (sessionToken) {
          persistToken(sessionToken);
        }
        return backendUser;
      } catch (error) {
        console.error('Failed to sync auth with backend:', error);
        return null;
      }
    },
    [persistToken, persistUser]
  );

  // Initialize Firebase auth state on mount
  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Firebase is not configured – skip auth binding but allow app to render
      console.warn(
        '[Auth] Firebase is not configured. Set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID to enable Firebase auth.'
      );
      setAuthReady(true);
      return;
    }

    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();

      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);

        if (!fbUser) {
          persistUser(null);
          persistToken(null);
          setAuthReady(true);
          return;
        }

        // Try to restore cached user quickly
        try {
          const storedUser = localStorage.getItem(USER_STORAGE_KEY);
          if (storedUser) {
            const parsed = JSON.parse(storedUser) as User;
            setUser(parsed);
          }
        } catch {
          // Ignore parse errors
        }

        try {
          const idToken = await fbUser.getIdToken();
          await syncWithBackend(idToken);
        } catch (error) {
          console.error('Failed to sync Firebase user with backend:', error);
        }

        setAuthReady(true);
      });
    } catch (error) {
      console.error('Failed to initialize Firebase auth:', error);
      setAuthReady(true);
    }

    return () => unsubscribe();
  }, [persistToken, persistUser, syncWithBackend]);

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isFirebaseConfigured) {
        return {
          success: false,
          message: 'Authentication is not configured. Please contact the administrator.',
        };
      }

      if (!email || !password || !name) {
        return { success: false, message: 'Please fill in all required fields.' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long.' };
      }

      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const fbUser = cred.user;

      const idToken = await fbUser.getIdToken();
      const backendUser = await syncWithBackend(idToken, {
        name,
        phone,
        role,
      });

      if (!backendUser) {
        return {
          success: false,
          message: 'Account created, but we could not sync your profile. Please try again.',
        };
      }

      return { success: true, message: 'Account created successfully!' };
    } catch (error: any) {
      console.error('Registration error:', error);

      const message =
        error?.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : error?.message || 'Something went wrong while creating your account.';

      return { success: false, message };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; role?: UserRole; user?: User }> => {
    try {
      if (!email || !password) {
        return { success: false, message: 'Please enter both email and password.' };
      }

      if (!isFirebaseConfigured) {
        return {
          success: false,
          message: 'Authentication is not configured. Please contact the administrator.',
        };
      }

      const auth = getFirebaseAuth();
      const cred = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const fbUser = cred.user;
      const idToken = await fbUser.getIdToken();
      const backendUser = await syncWithBackend(idToken);

      if (!backendUser) {
        return {
          success: false,
          message: 'Unable to load your profile after login. Please try again or contact support.',
        };
      }

      return {
        success: true,
        message: 'Welcome back!',
        role: backendUser.role,
        user: backendUser,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      const message =
        error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : error?.message || 'Network error. Please check your connection and try again.';

      return {
        success: false,
        message,
      };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isFirebaseConfigured) {
        return {
          success: false,
          message: 'Google sign-in is not configured. Please contact the administrator.',
        };
      }

      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;

      const idToken = await fbUser.getIdToken();
      await syncWithBackend(idToken);

      return { success: true, message: 'Login successful!' };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      return { success: false, message: error.message || 'Failed to sign in with Google.' };
    }
  };

  const completeOAuthLogin = async (token: string): Promise<{ success: boolean; message: string }> => {
    // No-op with pure Firebase client-side OAuth, kept for API compatibility
    return { success: true, message: 'OAuth login completed.' };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!email) {
        return { success: false, message: 'Please enter your email address.' };
      }

      if (!isFirebaseConfigured) {
        return {
          success: false,
          message: 'Password reset is not configured. Please contact the administrator.',
        };
      }

      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: error.message || 'Unable to send password reset email.',
      };
    }
  };

  const logout = () => {
    if (isFirebaseConfigured) {
      const auth = getFirebaseAuth();
      void signOut(auth);
    }
    persistUser(null);
    persistToken(null);
  };

  const updateUser = useCallback((updatedUser: User) => {
    persistUser(updatedUser);
  }, [persistUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken: token,
        login,
        logout,
        register,
        loginWithGoogle,
        completeOAuthLogin,
        updateUser,
        isAuthenticated: !!firebaseUser,
        supportsOAuth,
        authReady,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

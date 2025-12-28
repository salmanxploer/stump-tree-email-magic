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

// FIREBASE-ONLY MODE: No backend sync - works without any server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_BACKEND = Boolean(API_BASE_URL && !API_BASE_URL.includes('localhost'));

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

// Admin emails - users with these emails automatically get admin role
const ADMIN_EMAILS = [
  'admin@bubt.edu',
  'salman@bubt.edu',
  // Add your email here to become admin
].map(e => e.toLowerCase());

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: Create user object from Firebase user
const createUserFromFirebase = (fbUser: FirebaseUser, extras?: { name?: string; phone?: string; role?: UserRole }): User => {
  const email = (fbUser.email || '').toLowerCase();
  
  // Check if this email should be admin
  const isAdminEmail = ADMIN_EMAILS.includes(email);
  
  // Check if user was previously stored with a role
  let storedRole: UserRole = 'student';
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.id === fbUser.uid && parsed.role) {
        storedRole = parsed.role;
      }
    }
  } catch {
    // Ignore
  }

  // Priority: admin email > extras.role > storedRole > 'student'
  const finalRole: UserRole = isAdminEmail ? 'admin' : (extras?.role || storedRole);

  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    name: extras?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    role: finalRole,
    phone: extras?.phone || fbUser.phoneNumber || undefined,
    avatar: fbUser.photoURL || undefined,
    createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
  };
};

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

  // Restore token on mount
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

  // Optional backend sync - only if backend URL is configured and not localhost
  const syncWithBackend = useCallback(
    async (firebaseIdToken: string, fbUser: FirebaseUser, extras?: { name?: string; phone?: string; role?: UserRole }): Promise<User> => {
      const localUser = createUserFromFirebase(fbUser, extras);

      // Skip backend sync if not configured
      if (!USE_BACKEND) {
        console.info('[Auth] Running in Firebase-only mode (no backend)');
        persistUser(localUser);
        persistToken(firebaseIdToken);
        return localUser;
      }

      // Try backend sync with short timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_BASE_URL}/auth/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firebaseIdToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(extras ?? {}),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const backendUser = data.user as User;
          persistUser(backendUser);
          if (data.token) {
            persistToken(data.token);
          }
          console.info('[Auth] Synced with backend');
          return backendUser;
        }
      } catch (error) {
        console.warn('[Auth] Backend sync failed, using local user:', error);
      }

      // Fallback to local user
      persistUser(localUser);
      persistToken(firebaseIdToken);
      return localUser;
    },
    [persistToken, persistUser]
  );

  // Initialize Firebase auth state
  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.warn('[Auth] Firebase not configured');
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

        // Restore from localStorage first for instant UI
        try {
          const stored = localStorage.getItem(USER_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.id === fbUser.uid) {
              setUser(parsed);
            }
          }
        } catch {
          // Ignore
        }

        // Then sync (local or backend)
        try {
          const idToken = await fbUser.getIdToken();
          await syncWithBackend(idToken, fbUser);
        } catch (error) {
          console.error('[Auth] Sync error:', error);
          // Still create a local user on error
          const localUser = createUserFromFirebase(fbUser);
          persistUser(localUser);
        }

        setAuthReady(true);
      });
    } catch (error) {
      console.error('[Auth] Init error:', error);
      setAuthReady(true);
    }

    return () => unsubscribe();
  }, [persistToken, persistUser, syncWithBackend]);

  // REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isFirebaseConfigured) {
        return { success: false, message: 'Authentication not configured.' };
      }

      if (!email || !password || !name) {
        return { success: false, message: 'Please fill in all required fields.' };
      }

      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
      }

      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const fbUser = cred.user;
      const idToken = await fbUser.getIdToken();

      // Create and save user
      await syncWithBackend(idToken, fbUser, { name, phone, role });

      return { success: true, message: 'Account created successfully!' };
    } catch (error: any) {
      console.error('Register error:', error);
      const message =
        error?.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists.'
          : error?.message || 'Registration failed.';
      return { success: false, message };
    }
  };

  // LOGIN
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; role?: UserRole; user?: User }> => {
    try {
      if (!email || !password) {
        return { success: false, message: 'Please enter email and password.' };
      }

      if (!isFirebaseConfigured) {
        return { success: false, message: 'Authentication not configured.' };
      }

      const auth = getFirebaseAuth();
      const cred = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const fbUser = cred.user;
      const idToken = await fbUser.getIdToken();

      // Create user (syncs with backend if available, otherwise local)
      const appUser = await syncWithBackend(idToken, fbUser);

      return {
        success: true,
        message: 'Welcome back!',
        role: appUser.role,
        user: appUser,
      };
    } catch (error: any) {
      console.error('Login error:', error);
      const message =
        error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password'
          ? 'Invalid email or password.'
          : error?.code === 'auth/user-not-found'
          ? 'No account found with this email.'
          : error?.message || 'Login failed.';
      return { success: false, message };
    }
  };

  // GOOGLE LOGIN
  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!isFirebaseConfigured) {
        return { success: false, message: 'Google sign-in not configured.' };
      }

      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;
      const idToken = await fbUser.getIdToken();

      await syncWithBackend(idToken, fbUser);

      return { success: true, message: 'Login successful!' };
    } catch (error: any) {
      console.error('Google login error:', error);
      return { success: false, message: error.message || 'Google sign-in failed.' };
    }
  };

  // PASSWORD RESET
  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!email) {
        return { success: false, message: 'Please enter your email.' };
      }

      if (!isFirebaseConfigured) {
        return { success: false, message: 'Password reset not configured.' };
      }

      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      return { success: true, message: 'Reset email sent. Check your inbox.' };
    } catch (error: any) {
      console.error('Reset error:', error);
      return { success: false, message: error.message || 'Reset failed.' };
    }
  };

  // LOGOUT
  const logout = () => {
    if (isFirebaseConfigured) {
      const auth = getFirebaseAuth();
      void signOut(auth);
    }
    persistUser(null);
    persistToken(null);
  };

  // OAUTH CALLBACK (no-op for Firebase client SDK)
  const completeOAuthLogin = async (_token: string): Promise<{ success: boolean; message: string }> => {
    return { success: true, message: 'OK' };
  };

  // UPDATE USER
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
        isAuthenticated: !!user,
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

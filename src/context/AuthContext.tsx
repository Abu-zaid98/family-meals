import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase';
import { getErrorMessage } from '../utils/errors';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) {
      await signInWithEmailAndPassword(auth, email, password);
    },
    async register(name, email, password) {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = credentials.user;

      if (name.trim()) {
        await updateProfile(currentUser, { displayName: name.trim() });
      }

      // Store user data in Realtime Database
      await set(ref(db, `users/${currentUser.uid}`), {
        uid: currentUser.uid,
        name: name.trim(),
        email: currentUser.email,
        createdAt: new Date().toISOString(),
      });
    },
    async logout() {
      await signOut(auth);
    },
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(getErrorMessage('useAuth must be used within AuthProvider'));
  }

  return context;
}

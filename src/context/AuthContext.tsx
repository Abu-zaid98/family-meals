import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
      const user = credentials.user;

      if (name.trim()) {
        await updateProfile(user, { displayName: name.trim() });
      }

      // Store user data in Realtime Database
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        name: name.trim(),
        email: user.email,
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
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

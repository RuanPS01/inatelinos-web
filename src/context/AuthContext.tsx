"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import isInatelEmail from "@/lib/isInatelEmail";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean; // ainda resolvendo o estado de auth
  profileChecked: boolean; // já sabemos se o doc de perfil existe
  emailVerified: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  reloadUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Observa a sessão. Barreira de domínio: sessão fora do Inatel é encerrada.
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u && !isInatelEmail(u.email)) {
        fbSignOut(auth);
        return;
      }
      setUser(u);
      setEmailVerified(Boolean(u?.emailVerified));
      setLoading(false);
    });
  }, []);

  // Observa o documento de perfil quando o e-mail está confirmado.
  useEffect(() => {
    if (!user?.email || !emailVerified) {
      setProfile(null);
      setProfileChecked(false);
      return;
    }
    const ref = doc(db, "users", user.email.toLowerCase());
    return onSnapshot(ref, (snap) => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      setProfileChecked(true);
    });
  }, [user?.email, emailVerified]);

  const signUp = async (email: string, password: string) => {
    const clean = email.trim().toLowerCase();
    if (!isInatelEmail(clean)) {
      throw new Error("Use um e-mail do Inatel (@inatel.br ou @sigla.inatel.br).");
    }
    const cred = await createUserWithEmailAndPassword(auth, clean, password);
    await sendEmailVerification(cred.user);
  };

  const signIn = async (email: string, password: string) => {
    const clean = email.trim().toLowerCase();
    if (!isInatelEmail(clean)) {
      throw new Error("Use um e-mail do Inatel (@inatel.br ou @sigla.inatel.br).");
    }
    await signInWithEmailAndPassword(auth, clean, password);
  };

  const signOut = () => fbSignOut(auth);

  const resendVerification = async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  };

  const resetPassword = async (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!isInatelEmail(clean)) {
      throw new Error("Use um e-mail do Inatel (@inatel.br ou @sigla.inatel.br).");
    }
    await sendPasswordResetEmail(auth, clean);
  };

  // Recarrega o usuário para detectar a confirmação do e-mail. Retorna true
  // quando já confirmado (e renova o token para o Firestore enxergar).
  const reloadUser = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = Boolean(auth.currentUser.emailVerified);
    if (verified) {
      await auth.currentUser.getIdToken(true);
      setUser(auth.currentUser);
      setEmailVerified(true);
    }
    return verified;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      profileChecked,
      emailVerified,
      signUp,
      signIn,
      signOut,
      resendVerification,
      resetPassword,
      reloadUser,
    }),
    [user, profile, loading, profileChecked, emailVerified]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

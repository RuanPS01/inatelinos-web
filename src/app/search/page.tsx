"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";
import UserRow from "@/components/UserRow";
import FollowButton from "@/components/FollowButton";
import type { UserProfile } from "@/lib/types";

function SearchContent() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Carrega os usuários uma vez e filtra no cliente (como no app).
  useEffect(() => {
    getDocs(collection(db, "users"))
      .then((snap) => {
        setUsers(snap.docs.map((d) => d.data() as UserProfile));
        setLoading(false);
      })
      .catch((e) => {
        console.error("Erro ao buscar usuários:", e);
        setLoading(false);
      });
  }, []);

  const results = useMemo(() => {
    const key = term.trim().toLowerCase();
    return users
      .filter((u) => u.email !== profile?.email)
      .filter((u) =>
        !key
          ? true
          : u.username?.toLowerCase().includes(key) ||
            u.name?.toLowerCase().includes(key) ||
            u.email?.toLowerCase().includes(key)
      )
      .slice(0, 50);
  }, [users, term, profile?.email]);

  return (
    <main className="mx-auto max-w-xl px-4 py-4">
      <input
        autoFocus
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-inatel-400 focus:outline-none"
        placeholder="Buscar inatelinos por nome ou usuário…"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />

      <div className="mt-4 divide-y divide-neutral-900">
        {loading && (
          <p className="py-10 text-center text-sm text-neutral-500">
            Carregando…
          </p>
        )}
        {!loading &&
          results.map((u) => (
            <UserRow
              key={u.email}
              user={u}
              action={<FollowButton targetEmail={u.email} />}
            />
          ))}
        {!loading && results.length === 0 && (
          <p className="py-10 text-center text-sm text-neutral-500">
            Nenhum inatelino encontrado.
          </p>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar />
        <SearchContent />
      </div>
    </AppGate>
  );
}

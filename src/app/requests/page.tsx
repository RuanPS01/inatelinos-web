"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { respondFollowRequest } from "@/lib/social";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";
import UserRow from "@/components/UserRow";
import type { UserProfile } from "@/lib/types";

function RequestsContent() {
  const { profile } = useAuth();
  const [requesters, setRequesters] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  const emails = profile?.followers_request || [];

  // Busca o perfil de cada solicitante para exibir na lista.
  useEffect(() => {
    let active = true;
    (async () => {
      const docs = await Promise.all(
        emails.map((email) => getDoc(doc(db, "users", email)))
      );
      if (!active) return;
      setRequesters(
        docs.filter((d) => d.exists()).map((d) => d.data() as UserProfile)
      );
      setLoading(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails.join(",")]);

  const respond = async (requesterEmail: string, accept: boolean) => {
    if (!profile || pending) return;
    setPending(requesterEmail);
    try {
      await respondFollowRequest(profile.email, requesterEmail, accept);
      setRequesters((prev) => prev.filter((u) => u.email !== requesterEmail));
    } catch (e) {
      console.error("Erro ao responder solicitação:", e);
    } finally {
      setPending(null);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-4">
      <h1 className="mb-3 text-lg font-bold">Solicitações para seguir</h1>

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Carregando…</p>
      ) : requesters.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          Nenhuma solicitação pendente.
        </p>
      ) : (
        <div className="divide-y divide-neutral-900">
          {requesters.map((u) => (
            <UserRow
              key={u.email}
              user={u}
              action={
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(u.email, true)}
                    disabled={pending === u.email}
                    className="rounded-lg bg-inatel-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-inatel-600 disabled:opacity-50"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => respond(u.email, false)}
                    disabled={pending === u.email}
                    className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm font-semibold transition hover:bg-neutral-900 disabled:opacity-50"
                  >
                    Recusar
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default function RequestsPage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar />
        <RequestsContent />
      </div>
    </AppGate>
  );
}

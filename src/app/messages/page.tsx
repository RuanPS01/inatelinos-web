"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { resetChatNotification } from "@/lib/chat";
import { chatHref } from "@/lib/links";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";
import type { ChatContact } from "@/lib/types";

function MessagesContent() {
  const { profile } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Assina a lista de conversas e zera o contador ao abrir.
  useEffect(() => {
    if (!profile?.email) return;
    resetChatNotification(profile.email);
    return onSnapshot(
      collection(db, "users", profile.email, "chat"),
      (snap) => {
        setContacts(snap.docs.map((d) => d.data() as ChatContact));
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [profile?.email]);

  return (
    <main className="mx-auto max-w-xl px-4 py-4">
      <h1 className="mb-3 text-lg font-bold">Mensagens</h1>

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Carregando…</p>
      ) : contacts.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          Nenhuma conversa ainda. Abra o perfil de um inatelino e toque em
          “Mensagem”.
        </p>
      ) : (
        <div className="divide-y divide-neutral-900">
          {contacts.map((c) => (
            <Link
              key={c.email}
              href={chatHref(c.email)}
              className="flex items-center gap-3 py-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.profile_picture}
                alt={c.username}
                className="h-12 w-12 rounded-full border border-neutral-700 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.username}</p>
                <p className="truncate text-sm text-neutral-400">{c.name}</p>
              </div>
              {c.status === "unseen" && (
                <span className="h-2.5 w-2.5 rounded-full bg-inatel-500" />
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default function MessagesPage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar />
        <MessagesContent />
      </div>
    </AppGate>
  );
}

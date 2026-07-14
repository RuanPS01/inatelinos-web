"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { markChatSeen, sendMessage } from "@/lib/chat";
import { profileHref } from "@/lib/links";
import AppGate from "@/components/AppGate";
import { BrandMark } from "@/components/Brand";
import type { ChatMessage, UserProfile } from "@/lib/types";

function ConversationContent() {
  const searchParams = useSearchParams();
  const otherEmail = (searchParams.get("email") || "").toLowerCase();
  const { profile } = useAuth();

  const [other, setOther] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Perfil do interlocutor (para o cabeçalho e o payload de envio).
  useEffect(() => {
    if (!otherEmail) return;
    getDoc(doc(db, "users", otherEmail)).then((snap) => {
      if (snap.exists()) setOther(snap.data() as UserProfile);
    });
  }, [otherEmail]);

  // Mensagens da minha caixa com este usuário; marca como visto ao abrir.
  useEffect(() => {
    if (!profile?.email || !otherEmail) return;
    markChatSeen(profile.email, otherEmail);
    const q = query(
      collection(db, "users", profile.email, "chat", otherEmail, "messages"),
      orderBy("timestamp", "asc")
    );
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => d.data() as ChatMessage));
    });
  }, [profile?.email, otherEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const onSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !other || !text.trim() || sending) return;
    try {
      setSending(true);
      await sendMessage(profile, other, text);
      setText("");
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen max-w-xl flex-col">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-800 bg-black/80 px-4 py-3 backdrop-blur">
        <Link href="/messages" className="text-xl">
          ‹
        </Link>
        {other && (
          <Link href={profileHref(other.username)} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={other.profile_picture}
              alt={other.username}
              className="h-9 w-9 rounded-full border border-neutral-700 object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{other.username}</p>
              <p className="text-xs text-neutral-400">{other.name}</p>
            </div>
          </Link>
        )}
      </header>

      {/* Mensagens */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-neutral-600">
            <span className="text-inatel-500">
              <BrandMark size={40} />
            </span>
            <p className="text-sm">Diga olá! 👋</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.who === "current" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-sm ${
                m.who === "current"
                  ? "bg-inatel-500 text-white"
                  : "bg-neutral-800 text-white"
              }`}
            >
              {m.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Campo de envio */}
      <form
        onSubmit={onSend}
        className="flex items-center gap-2 border-t border-neutral-800 p-3"
      >
        <input
          className="flex-1 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-inatel-400 focus:outline-none"
          placeholder="Mensagem…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!text.trim() || sending || !other}
          className="rounded-full bg-inatel-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-inatel-600 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default function ConversationPage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <Suspense fallback={null}>
          <ConversationContent />
        </Suspense>
      </div>
    </AppGate>
  );
}

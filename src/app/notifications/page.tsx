"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { respondFollowRequest } from "@/lib/social";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";
import UserRow from "@/components/UserRow";
import timeAgo from "@/lib/timeAgo";
import type { Post, UserProfile } from "@/lib/types";

type Interaction = {
  key: string;
  type: "like" | "comment";
  post: Post;
  actor: string;
  actorAvatar: string;
};

function NotificationsContent() {
  const { profile } = useAuth();
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [requesters, setRequesters] = useState<UserProfile[]>([]);
  const [pending, setPending] = useState<string | null>(null);

  const requestEmails = profile?.followers_request || [];

  // Zera o contador de eventos ao abrir (como no app).
  useEffect(() => {
    if (profile?.email && (profile.event_notification || 0) > 0) {
      updateDoc(doc(db, "users", profile.email), {
        event_notification: 0,
      }).catch(() => {});
    }
  }, [profile?.email, profile?.event_notification]);

  // Meus posts, para derivar curtidas e comentários recebidos.
  useEffect(() => {
    if (!profile?.email) return;
    const q = query(
      collection(db, "users", profile.email, "posts"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setMyPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post));
    });
  }, [profile?.email]);

  // Perfis dos solicitantes de follow.
  useEffect(() => {
    let active = true;
    (async () => {
      const docs = await Promise.all(
        requestEmails.map((email) => getDoc(doc(db, "users", email)))
      );
      if (!active) return;
      setRequesters(
        docs.filter((d) => d.exists()).map((d) => d.data() as UserProfile)
      );
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestEmails.join(",")]);

  const interactions = useMemo<Interaction[]>(() => {
    if (!profile) return [];
    const items: Interaction[] = [];
    for (const post of myPosts) {
      // Curtida mais recente (new_likes = [username, profile_picture]).
      if (post.new_likes?.length >= 2) {
        items.push({
          key: `like-${post.id}`,
          type: "like",
          post,
          actor: post.new_likes[0],
          actorAvatar: post.new_likes[1],
        });
      }
      // Último comentário, se não for meu.
      const last = post.comments?.[post.comments.length - 1];
      if (last && last.username !== profile.username) {
        items.push({
          key: `comment-${post.id}`,
          type: "comment",
          post,
          actor: last.username,
          actorAvatar: last.profile_picture,
        });
      }
    }
    return items;
  }, [myPosts, profile]);

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

  const empty = requesters.length === 0 && interactions.length === 0;

  return (
    <main className="mx-auto max-w-xl px-4 py-4">
      <h1 className="mb-3 text-lg font-bold">Notificações</h1>

      {empty && (
        <p className="py-16 text-center text-sm text-neutral-500">
          Nenhuma notificação por enquanto.
        </p>
      )}

      {requesters.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase text-neutral-500">
            Solicitações para seguir
          </h2>
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
        </section>
      )}

      {interactions.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase text-neutral-500">
            Atividade nos seus posts
          </h2>
          <div className="divide-y divide-neutral-900">
            {interactions.map((it) => (
              <div key={it.key} className="flex items-center gap-3 py-3">
                <Link href={`/u/${it.actor}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.actorAvatar}
                    alt={it.actor}
                    className="h-10 w-10 rounded-full border border-neutral-700 object-cover"
                  />
                </Link>
                <p className="min-w-0 flex-1 text-sm">
                  <Link href={`/u/${it.actor}`} className="font-semibold hover:underline">
                    {it.actor}
                  </Link>{" "}
                  <span className="text-neutral-300">
                    {it.type === "like"
                      ? "curtiu seu post."
                      : "comentou no seu post."}
                  </span>{" "}
                  <span className="text-neutral-500">
                    {timeAgo(it.post.createdAt)}
                  </span>
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.post.imageUrl}
                  alt="post"
                  className="h-11 w-11 shrink-0 rounded object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function NotificationsPage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar />
        <NotificationsContent />
      </div>
    </AppGate>
  );
}

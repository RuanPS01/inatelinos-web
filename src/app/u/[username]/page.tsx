"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getUserByUsername } from "@/lib/social";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";
import FollowButton from "@/components/FollowButton";
import type { Post, UserProfile } from "@/lib/types";

function UserProfileContent() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { profile: me } = useAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");

  // Se for o próprio perfil, manda para /profile.
  useEffect(() => {
    if (me?.username && me.username === username) router.replace("/profile");
  }, [me?.username, username, router]);

  useEffect(() => {
    let active = true;
    getUserByUsername(username).then((u) => {
      if (!active) return;
      if (!u) {
        setStatus("notfound");
        return;
      }
      setUser(u);
      setStatus("ok");
    });
    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => {
    if (!user?.email) return;
    const q = query(
      collection(db, "users", user.email, "posts"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post));
    });
  }, [user?.email]);

  if (status === "loading") {
    return (
      <p className="py-16 text-center text-sm text-neutral-500">Carregando…</p>
    );
  }
  if (status === "notfound" || !user) {
    return (
      <p className="py-16 text-center text-sm text-neutral-500">
        Usuário @{username} não encontrado.
      </p>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <section className="flex items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.profile_picture}
          alt={user.username}
          className="h-20 w-20 rounded-full border border-neutral-700 object-cover"
        />
        <div className="flex flex-1 justify-around text-center">
          <div>
            <p className="text-lg font-bold">{posts.length}</p>
            <p className="text-xs text-neutral-400">posts</p>
          </div>
          <div>
            <p className="text-lg font-bold">{user.followers?.length || 0}</p>
            <p className="text-xs text-neutral-400">seguidores</p>
          </div>
          <div>
            <p className="text-lg font-bold">{user.following?.length || 0}</p>
            <p className="text-xs text-neutral-400">seguindo</p>
          </div>
        </div>
      </section>

      <section className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-neutral-400">@{user.username}</p>
          {user.bio ? <p className="mt-1 text-sm">{user.bio}</p> : null}
          {user.link ? (
            <a
              href={user.link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-sm text-inatel-300 hover:underline"
            >
              {user.link}
            </a>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <FollowButton targetEmail={user.email} />
          {me?.email !== user.email && (
            <Link
              href={`/messages/${encodeURIComponent(user.email)}`}
              className="rounded-lg border border-neutral-700 px-4 py-1.5 text-sm font-semibold hover:bg-neutral-900"
            >
              Mensagem
            </Link>
          )}
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-1">
        {posts.map((post) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={post.id}
            src={post.imageUrl}
            alt={post.caption || "post"}
            className="aspect-square w-full bg-neutral-900 object-cover"
          />
        ))}
      </section>

      {posts.length === 0 && (
        <p className="mt-10 text-center text-sm text-neutral-500">
          Nenhuma publicação ainda.
        </p>
      )}
    </main>
  );
}

export default function UserProfilePage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar />
        <UserProfileContent />
      </div>
    </AppGate>
  );
}

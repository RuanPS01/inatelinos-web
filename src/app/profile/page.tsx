"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";
import PostGrid from "@/components/PostGrid";
import type { Post } from "@/lib/types";

function ProfileContent() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!profile?.email) return;
    const q = query(
      collection(db, "users", profile.email, "posts"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post));
    });
  }, [profile?.email]);

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-xl px-4 py-6">
      <section className="flex items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.profile_picture}
          alt={profile.username}
          className="h-20 w-20 rounded-full border border-neutral-700 object-cover"
        />
        <div className="flex flex-1 justify-around text-center">
          <div>
            <p className="text-lg font-bold">{posts.length}</p>
            <p className="text-xs text-neutral-400">posts</p>
          </div>
          <div>
            <p className="text-lg font-bold">
              {profile.followers?.length || 0}
            </p>
            <p className="text-xs text-neutral-400">seguidores</p>
          </div>
          <div>
            <p className="text-lg font-bold">
              {profile.following?.length || 0}
            </p>
            <p className="text-xs text-neutral-400">seguindo</p>
          </div>
        </div>
      </section>

      <section className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{profile.name}</p>
          <p className="text-sm text-neutral-400">@{profile.username}</p>
          {profile.bio ? <p className="mt-1 text-sm">{profile.bio}</p> : null}
          {profile.link ? (
            <a
              href={profile.link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-sm text-inatel-300 hover:underline"
            >
              {profile.link}
            </a>
          ) : null}
        </div>
        <Link
          href="/edit-profile"
          className="shrink-0 rounded-lg border border-neutral-700 px-4 py-1.5 text-sm font-semibold hover:bg-neutral-900"
        >
          Editar perfil
        </Link>
      </section>

      <section className="mt-6">
        <PostGrid posts={posts} />
      </section>

      {posts.length === 0 && (
        <p className="mt-10 text-center text-sm text-neutral-500">
          Você ainda não publicou nada.
        </p>
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar />
        <ProfileContent />
      </div>
    </AppGate>
  );
}

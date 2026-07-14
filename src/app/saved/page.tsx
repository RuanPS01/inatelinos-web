"use client";

import { useEffect, useState } from "react";
import {
  collectionGroup,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";
import PostCard from "@/components/PostCard";
import type { Post } from "@/lib/types";

function SavedContent() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega posts recentes e filtra pelos que o usuário salvou.
  useEffect(() => {
    const q = query(
      collectionGroup(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(200)
    );
    return onSnapshot(
      q,
      (snap) => {
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post));
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  const saved = posts.filter((p) => profile?.saved_posts?.includes(p.id));

  return (
    <main className="mx-auto max-w-xl px-4 py-4">
      <h1 className="mb-3 text-lg font-bold">Posts salvos</h1>
      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Carregando…</p>
      ) : saved.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          Você ainda não salvou nenhum post.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {saved.map((p) => (
            <PostCard key={`${p.owner_email}-${p.id}`} post={p} />
          ))}
        </div>
      )}
    </main>
  );
}

export default function SavedPage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar />
        <SavedContent />
      </div>
    </AppGate>
  );
}

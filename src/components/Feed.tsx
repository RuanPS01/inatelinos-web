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
import type { Post } from "@/lib/types";
import PostCard from "./PostCard";

// Feed global: mesma query do app (collectionGroup "posts" por createdAt desc).
export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collectionGroup(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(40)
    );
    return onSnapshot(
      q,
      (snap) => {
        setPosts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post)
        );
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar o feed:", err);
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <p className="py-16 text-center text-sm text-neutral-500">
        Carregando o feed…
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center text-neutral-500">
        <p className="text-sm">Ainda não há publicações.</p>
        <p className="mt-1 text-xs">Seja o primeiro a postar no Inatelinos!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {posts.map((post) => (
        <PostCard key={`${post.owner_email}-${post.id}`} post={post} />
      ))}
    </div>
  );
}

export default Feed;

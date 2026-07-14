"use client";

import { useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import timeAgo from "@/lib/timeAgo";
import type { Post } from "@/lib/types";

// Curtida com a MESMA lógica do app mobile (useHandleLike), para o feed
// funcionar de forma consistente entre web e app.
async function togglePostLike(post: Post, userEmail: string, username: string, avatar: string) {
  const willLike = !post.likes_by_users.includes(userEmail);
  const postRef = doc(db, "users", post.owner_email, "posts", post.id);
  const userRef = doc(db, "users", post.owner_email);

  await updateDoc(postRef, {
    likes_by_users: willLike ? arrayUnion(userEmail) : arrayRemove(userEmail),
    new_likes: willLike ? [username, avatar] : [],
  });
  await updateDoc(userRef, {
    event_notification: willLike ? increment(1) : increment(-1),
  });
}

export function PostCard({ post }: { post: Post }) {
  const { profile } = useAuth();
  const [busy, setBusy] = useState(false);

  const liked = profile
    ? post.likes_by_users?.includes(profile.email)
    : false;
  const likeCount = post.likes_by_users?.length || 0;
  const commentCount = post.comments?.length || 0;

  const onLike = async () => {
    if (busy || !profile) return;
    setBusy(true);
    try {
      await togglePostLike(
        post,
        profile.email,
        profile.username,
        profile.profile_picture
      );
    } catch (e) {
      console.error("Erro ao curtir:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="border-b border-neutral-800 pb-4">
      <div className="flex items-center gap-3 px-1 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.profile_picture}
          alt={post.username}
          className="h-9 w-9 rounded-full border border-neutral-700 object-cover"
        />
        <span className="text-sm font-semibold">{post.username}</span>
        <span className="text-xs text-neutral-500">
          · {timeAgo(post.createdAt)}
        </span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.imageUrl}
        alt={post.caption || "post"}
        className="w-full rounded-lg bg-neutral-900 object-cover"
      />

      <div className="px-1 pt-3">
        <button
          onClick={onLike}
          disabled={busy}
          className="flex items-center gap-2 text-sm font-semibold disabled:opacity-60"
          aria-pressed={liked}
        >
          <span className={liked ? "text-red-500" : "text-white"}>
            {liked ? "♥" : "♡"}
          </span>
          <span>{likeCount}</span>
        </button>

        {post.caption ? (
          <p className="mt-2 text-sm">
            <span className="font-semibold">{post.username}</span>{" "}
            {post.caption}
          </p>
        ) : null}

        {commentCount > 0 && (
          <p className="mt-1 text-xs text-neutral-500">
            {commentCount} comentário{commentCount > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </article>
  );
}

export default PostCard;

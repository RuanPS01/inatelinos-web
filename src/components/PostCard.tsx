"use client";

import { useState } from "react";
import Link from "next/link";
import {
  arrayRemove,
  arrayUnion,
  doc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toggleSave } from "@/lib/social";
import timeAgo from "@/lib/timeAgo";
import type { Post } from "@/lib/types";
import CommentsModal from "./CommentsModal";

// Curtida com a MESMA lógica do app mobile (useHandleLike).
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
  const [saving, setSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const liked = profile ? post.likes_by_users?.includes(profile.email) : false;
  const saved = profile ? profile.saved_posts?.includes(post.id) : false;
  const likeCount = post.likes_by_users?.length || 0;
  const commentCount = post.comments?.length || 0;

  const onLike = async () => {
    if (busy || !profile) return;
    setBusy(true);
    try {
      await togglePostLike(post, profile.email, profile.username, profile.profile_picture);
    } catch (e) {
      console.error("Erro ao curtir:", e);
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (saving || !profile) return;
    setSaving(true);
    try {
      await toggleSave(post, profile);
    } catch (e) {
      console.error("Erro ao salvar:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="border-b border-neutral-800 pb-4">
      <div className="flex items-center gap-3 px-1 py-3">
        <Link href={`/u/${post.username}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.profile_picture}
            alt={post.username}
            className="h-9 w-9 rounded-full border border-neutral-700 object-cover"
          />
        </Link>
        <Link href={`/u/${post.username}`} className="text-sm font-semibold hover:underline">
          {post.username}
        </Link>
        <span className="text-xs text-neutral-500">· {timeAgo(post.createdAt)}</span>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.imageUrl}
        alt={post.caption || "post"}
        className="w-full rounded-lg bg-neutral-900 object-cover"
      />

      <div className="px-1 pt-3">
        <div className="flex items-center gap-5 text-xl">
          <button
            onClick={onLike}
            disabled={busy}
            className="flex items-center gap-1.5 disabled:opacity-60"
            aria-pressed={liked}
            title="Curtir"
          >
            <span className={liked ? "text-red-500" : "text-white"}>
              {liked ? "♥" : "♡"}
            </span>
            <span className="text-sm font-semibold">{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5"
            title="Comentar"
          >
            <span>🗨</span>
            <span className="text-sm font-semibold">{commentCount}</span>
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="ml-auto disabled:opacity-60"
            aria-pressed={saved}
            title={saved ? "Remover dos salvos" : "Salvar"}
          >
            <span className={saved ? "text-inatel-300" : "text-white"}>
              {saved ? "🔖" : "🏷"}
            </span>
          </button>
        </div>

        {post.caption ? (
          <p className="mt-2 text-sm">
            <Link href={`/u/${post.username}`} className="font-semibold hover:underline">
              {post.username}
            </Link>{" "}
            {post.caption}
          </p>
        ) : null}

        {commentCount > 0 && (
          <button
            onClick={() => setShowComments(true)}
            className="mt-1 text-xs text-neutral-500 hover:text-neutral-300"
          >
            Ver {commentCount} comentário{commentCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {showComments && (
        <CommentsModal post={post} onClose={() => setShowComments(false)} />
      )}
    </article>
  );
}

export default PostCard;

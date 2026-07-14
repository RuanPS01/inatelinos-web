"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { addComment } from "@/lib/social";
import timeAgo from "@/lib/timeAgo";
import type { Post } from "@/lib/types";

// Lista os comentários do post e permite adicionar um novo.
export function CommentsModal({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  const { profile } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const comments = post.comments || [];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !text.trim() || sending) return;
    try {
      setSending(true);
      await addComment(post, profile, text);
      setText("");
    } catch (err) {
      console.error("Erro ao comentar:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl border border-neutral-800 bg-neutral-950 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 p-4">
          <h2 className="text-base font-bold">Comentários</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {comments.length === 0 && (
            <p className="py-10 text-center text-sm text-neutral-500">
              Ainda não há comentários. Seja o primeiro!
            </p>
          )}
          {comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.profile_picture}
                alt={c.username}
                className="h-8 w-8 shrink-0 rounded-full border border-neutral-700 object-cover"
              />
              <div className="text-sm">
                <Link
                  href={`/u/${c.username}`}
                  className="font-semibold hover:underline"
                >
                  {c.username}
                </Link>{" "}
                <span className="text-neutral-200">{c.comment}</span>
                {c.createdAt ? (
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {timeAgo(c.createdAt)}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 border-t border-neutral-800 p-3"
        >
          <input
            className="flex-1 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-white placeholder-neutral-500 focus:border-inatel-400 focus:outline-none"
            placeholder="Adicione um comentário…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="text-sm font-bold text-inatel-300 disabled:opacity-40"
          >
            Publicar
          </button>
        </form>
      </div>
    </div>
  );
}

export default CommentsModal;

"use client";

import { useEffect } from "react";
import type { Post } from "@/lib/types";
import PostCard from "./PostCard";

// Abre um post em destaque (lightbox), reutilizando o PostCard.
export function PostModal({
  post,
  onClose,
}: {
  post: Post;
  onClose: () => void;
}) {
  // Fecha com Esc e trava a rolagem do fundo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-neutral-800 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-2">
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="px-3 pb-3">
          <PostCard post={post} />
        </div>
      </div>
    </div>
  );
}

export default PostModal;

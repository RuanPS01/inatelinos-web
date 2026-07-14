"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import PostModal from "./PostModal";

// Grade de posts que abre cada item em um lightbox ao clicar.
export function PostGrid({ posts }: { posts: Post[] }) {
  const [selected, setSelected] = useState<Post | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => setSelected(post)}
            className="relative aspect-square w-full overflow-hidden bg-neutral-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.caption || "post"}
              className="h-full w-full object-cover transition hover:opacity-80"
            />
          </button>
        ))}
      </div>

      {selected && (
        <PostModal post={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

export default PostGrid;

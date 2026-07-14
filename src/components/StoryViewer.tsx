"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { markStorySeen, type StoryGroup } from "@/lib/stories";
import timeAgo from "@/lib/timeAgo";

const STORY_DURATION = 5000;

// Visualizador em tela cheia, com barras de progresso e auto-avanço.
export function StoryViewer({
  groups,
  initialGroup,
  onClose,
}: {
  groups: StoryGroup[];
  initialGroup: number;
  onClose: () => void;
}) {
  const { profile } = useAuth();
  const [gi, setGi] = useState(initialGroup);
  const [si, setSi] = useState(0);

  const group = groups[gi];
  const story = group?.stories[si];

  const advance = useCallback(() => {
    setSi((prevSi) => {
      if (!groups[gi]) return prevSi;
      if (prevSi + 1 < groups[gi].stories.length) return prevSi + 1;
      // Fim do grupo → próximo usuário.
      setGi((prevGi) => {
        if (prevGi + 1 < groups.length) return prevGi + 1;
        onClose();
        return prevGi;
      });
      return 0;
    });
  }, [gi, groups, onClose]);

  // Marca como visto e programa o avanço automático.
  useEffect(() => {
    if (!story || !profile) return;
    markStorySeen(story, profile.email).catch(() => {});
    const timer = setTimeout(advance, STORY_DURATION);
    return () => clearTimeout(timer);
  }, [story, profile, advance]);

  const goPrev = () => {
    setSi((prev) => {
      if (prev > 0) return prev - 1;
      setGi((g) => Math.max(0, g - 1));
      return 0;
    });
  };

  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-md flex-col">
        {/* Barras de progresso */}
        <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 p-3">
          {group.stories.map((s, i) => (
            <div
              key={s.id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white"
                style={{
                  width: i < si ? "100%" : i === si ? "100%" : "0%",
                  transition:
                    i === si ? `width ${STORY_DURATION}ms linear` : "none",
                  animation:
                    i === si ? `story-fill ${STORY_DURATION}ms linear` : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Cabeçalho */}
        <div className="absolute left-0 right-0 top-4 z-10 flex items-center gap-3 px-4 pt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={group.profile_picture}
            alt={group.username}
            className="h-9 w-9 rounded-full border border-white/50 object-cover"
          />
          <span className="text-sm font-semibold text-white">
            {group.username}
          </span>
          <span className="text-xs text-white/70">{timeAgo(story.createdAt)}</span>
          <button
            onClick={onClose}
            className="ml-auto text-2xl leading-none text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Imagem */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={story.imageUrl}
          alt="story"
          className="h-full w-full object-contain"
        />

        {/* Zonas de toque para navegar */}
        <button
          onClick={goPrev}
          className="absolute inset-y-0 left-0 w-1/3"
          aria-label="Anterior"
        />
        <button
          onClick={advance}
          className="absolute inset-y-0 right-0 w-1/3"
          aria-label="Próximo"
        />
      </div>

      <style jsx global>{`
        @keyframes story-fill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default StoryViewer;

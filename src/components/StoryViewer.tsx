"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { markStorySeen, toggleStoryLike, type StoryGroup } from "@/lib/stories";
import { sendMessage } from "@/lib/chat";
import timeAgo from "@/lib/timeAgo";

const STORY_DURATION = 5000;

// Visualizador em tela cheia, com barras de progresso, auto-avanço,
// curtir e responder (a resposta vira mensagem no chat, como no Instagram).
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
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);

  const group = groups[gi];
  const story = group?.stories[si];
  const isOwn = story?.owner_email === profile?.email;
  const liked = profile
    ? story?.likes_by_users?.includes(profile.email)
    : false;

  const advance = useCallback(() => {
    setSi((prevSi) => {
      if (!groups[gi]) return prevSi;
      if (prevSi + 1 < groups[gi].stories.length) return prevSi + 1;
      setGi((prevGi) => {
        if (prevGi + 1 < groups.length) return prevGi + 1;
        onClose();
        return prevGi;
      });
      return 0;
    });
  }, [gi, groups, onClose]);

  // Marca como visto ao entrar em cada story.
  useEffect(() => {
    if (story && profile) markStorySeen(story, profile.email).catch(() => {});
    setReply("");
    setSent(false);
  }, [story, profile]);

  // Auto-avanço (pausa enquanto o usuário digita uma resposta).
  useEffect(() => {
    if (!story || paused) return;
    const timer = setTimeout(advance, STORY_DURATION);
    return () => clearTimeout(timer);
  }, [story, paused, advance]);

  const goPrev = () => {
    setSi((prev) => {
      if (prev > 0) return prev - 1;
      setGi((g) => Math.max(0, g - 1));
      return 0;
    });
  };

  const onLike = async () => {
    if (!profile || !story) return;
    try {
      await toggleStoryLike(story, profile.email);
    } catch (e) {
      console.error("Erro ao curtir story:", e);
    }
  };

  const onReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || !story || !reply.trim()) return;
    try {
      await sendMessage(
        profile,
        {
          email: story.owner_email,
          username: story.username,
          name: story.name,
          profile_picture: story.profile_picture,
        },
        `↩️ Respondeu ao seu story: ${reply.trim()}`
      );
      setReply("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch (err) {
      console.error("Erro ao responder story:", err);
    }
  };

  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-md flex-col">
        {/* Barras de progresso */}
        <div className="absolute left-0 right-0 top-0 z-30 flex gap-1 p-3">
          {group.stories.map((s, i) => (
            <div
              key={s.id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white"
                style={{
                  width: i < si ? "100%" : i === si ? "100%" : "0%",
                  animation:
                    i === si && !paused
                      ? `story-fill ${STORY_DURATION}ms linear`
                      : "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Cabeçalho */}
        <div className="absolute left-0 right-0 top-4 z-30 flex items-center gap-3 px-4 pt-3">
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

        {/* Zonas de toque para navegar (não cobrem a área de controles) */}
        <button
          onClick={goPrev}
          className="absolute bottom-20 left-0 top-16 z-10 w-1/3"
          aria-label="Anterior"
        />
        <button
          onClick={advance}
          className="absolute bottom-20 right-0 top-16 z-10 w-1/3"
          aria-label="Próximo"
        />

        {/* Controles inferiores */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4">
          {isOwn ? (
            <div className="flex items-center justify-center gap-2 text-sm text-white/80">
              👁 Visto por {story.seen_by_users?.length || 0}
              <span className="mx-1">·</span>♥ {story.likes_by_users?.length || 0}
            </div>
          ) : (
            <form onSubmit={onReply} className="flex items-center gap-2">
              <input
                className="flex-1 rounded-full border border-white/40 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-white/60 focus:border-white focus:outline-none"
                placeholder={sent ? "Resposta enviada ✓" : "Responder…"}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
              />
              {reply.trim() ? (
                <button
                  type="submit"
                  className="text-sm font-bold text-white"
                >
                  Enviar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLike}
                  className="text-2xl leading-none"
                  aria-label="Curtir"
                >
                  <span className={liked ? "text-red-500" : "text-white"}>
                    {liked ? "♥" : "♡"}
                  </span>
                </button>
              )}
            </form>
          )}
        </div>
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

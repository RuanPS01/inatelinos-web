"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { collectionGroup, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  groupStoriesByUser,
  isRecentStory,
  uploadStory,
  type StoryGroup,
} from "@/lib/stories";
import type { Story } from "@/lib/types";
import StoryViewer from "./StoryViewer";

// Barra horizontal de stories no topo do feed.
export function StoriesBar() {
  const { profile } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  // Grupos "congelados" no momento da abertura, para a ordenação não mudar
  // enquanto o usuário navega (marcar visto reordena a lista ao vivo).
  const [viewer, setViewer] = useState<{
    groups: StoryGroup[];
    index: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return onSnapshot(
      collectionGroup(db, "stories"),
      (snap) => {
        setStories(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as Story)
            .filter(isRecentStory)
        );
      },
      (e) => console.error("Erro ao carregar stories:", e)
    );
  }, []);

  // Meu grupo primeiro; depois não vistos; depois vistos.
  const groups = useMemo(() => {
    if (!profile) return [];
    const all = groupStoriesByUser(stories);
    const mine = all.filter((g) => g.ownerEmail === profile.email);
    const others = all
      .filter((g) => g.ownerEmail !== profile.email)
      .sort((a, b) => {
        const aSeen = a.allSeenBy(profile.email) ? 1 : 0;
        const bSeen = b.allSeenBy(profile.email) ? 1 : 0;
        return aSeen - bSeen;
      });
    return [...mine, ...others];
  }, [stories, profile]);

  const myGroupIndex = groups.findIndex(
    (g) => g.ownerEmail === profile?.email
  );

  const onPickStory = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      setUploading(true);
      await uploadStory(file, profile);
    } catch (err) {
      console.error("Erro ao publicar story:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!profile) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto border-b border-neutral-800 px-1 py-4">
        {/* Meu story / adicionar */}
        <div className="flex w-16 shrink-0 flex-col items-center gap-1">
          <button
            onClick={() =>
              myGroupIndex >= 0
                ? setViewer({ groups, index: myGroupIndex })
                : fileRef.current?.click()
            }
            className="relative"
          >
            <StoryRing seen={myGroupIndex < 0 ? true : groups[myGroupIndex]?.allSeenBy(profile.email)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.profile_picture}
                alt="Seu story"
                className="h-14 w-14 rounded-full object-cover"
              />
            </StoryRing>
            <span
              onClick={(ev) => {
                ev.stopPropagation();
                fileRef.current?.click();
              }}
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-inatel-500 text-xs font-bold text-white"
            >
              +
            </span>
          </button>
          <span className="w-16 truncate text-center text-xs text-neutral-400">
            {uploading ? "Enviando…" : "Seu story"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickStory}
          />
        </div>

        {/* Outros usuários */}
        {groups.map((g, index) =>
          g.ownerEmail === profile.email ? null : (
            <button
              key={g.ownerEmail}
              onClick={() => setViewer({ groups, index })}
              className="flex w-16 shrink-0 flex-col items-center gap-1"
            >
              <StoryRing seen={g.allSeenBy(profile.email)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.profile_picture}
                  alt={g.username}
                  className="h-14 w-14 rounded-full object-cover"
                />
              </StoryRing>
              <span className="w-16 truncate text-center text-xs text-neutral-400">
                {g.username}
              </span>
            </button>
          )
        )}
      </div>

      {viewer && (
        <StoryViewer
          groups={viewer.groups}
          initialGroup={viewer.index}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}

// Anel do story: gradiente Inatel quando há story não visto; cinza quando visto.
function StoryRing({
  seen,
  children,
}: {
  seen: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className="flex h-16 w-16 items-center justify-center rounded-full p-[2px]"
      style={{
        background: seen
          ? "#3f3f46"
          : "linear-gradient(135deg, #1E60AD, #4581C4, #7FD4FF)",
      }}
    >
      <span className="flex h-full w-full items-center justify-center rounded-full border-2 border-black bg-black">
        {children}
      </span>
    </span>
  );
}

export default StoriesBar;

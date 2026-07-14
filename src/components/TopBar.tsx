"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BrandWordmark } from "./Brand";

export function TopBar({ onNewPost }: { onNewPost?: () => void }) {
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg text-white">
          <BrandWordmark />
        </Link>

        <div className="flex items-center gap-3">
          {onNewPost && (
            <button
              onClick={onNewPost}
              className="rounded-lg bg-inatel-500 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-inatel-600"
            >
              + Novo post
            </button>
          )}
          <Link href="/profile" title="Meu perfil">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile?.profile_picture}
              alt={profile?.username || "perfil"}
              className="h-9 w-9 rounded-full border border-neutral-700 object-cover"
            />
          </Link>
          <button
            onClick={() => signOut()}
            className="text-sm font-semibold text-neutral-400 hover:text-white"
            title="Sair"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;

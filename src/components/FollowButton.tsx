"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  cancelFollowRequest,
  getFollowState,
  sendFollowRequest,
  unfollow,
} from "@/lib/social";

// Botão de seguir com os estados do app: seguir → solicitado → seguindo.
export function FollowButton({ targetEmail }: { targetEmail: string }) {
  const { profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const state = getFollowState(profile, targetEmail);

  if (state === "self") {
    return (
      <Link
        href="/edit-profile"
        className="rounded-lg border border-neutral-700 px-4 py-1.5 text-sm font-semibold hover:bg-neutral-900"
      >
        Editar perfil
      </Link>
    );
  }

  const onClick = async () => {
    if (!profile || busy) return;
    setBusy(true);
    try {
      if (state === "following") await unfollow(profile.email, targetEmail);
      else if (state === "requested")
        await cancelFollowRequest(profile.email, targetEmail);
      else await sendFollowRequest(profile.email, targetEmail);
    } catch (e) {
      console.error("Erro na ação de seguir:", e);
    } finally {
      setBusy(false);
    }
  };

  const label =
    state === "following"
      ? "Seguindo"
      : state === "requested"
        ? "Solicitado"
        : "Seguir";

  const styleByState =
    state === "none"
      ? "bg-inatel-500 text-white hover:bg-inatel-600"
      : "border border-neutral-700 text-white hover:bg-neutral-900";

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${styleByState}`}
    >
      {label}
    </button>
  );
}

export default FollowButton;

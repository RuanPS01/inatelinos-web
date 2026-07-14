"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { profileHref } from "@/lib/links";
import type { UserProfile } from "@/lib/types";

// Linha de usuário reutilizada em busca, solicitações e listas.
export function UserRow({
  user,
  action,
}: {
  user: Pick<UserProfile, "username" | "name" | "profile_picture">;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Link href={profileHref(user.username)} className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.profile_picture}
          alt={user.username}
          className="h-11 w-11 rounded-full border border-neutral-700 object-cover"
        />
      </Link>
      <Link href={profileHref(user.username)} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.username}</p>
        <p className="truncate text-sm text-neutral-400">{user.name}</p>
      </Link>
      {action}
    </div>
  );
}

export default UserRow;

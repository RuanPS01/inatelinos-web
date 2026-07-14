"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BrandWordmark } from "./Brand";

const NAV = [
  { href: "/", label: "Feed", icon: "🏠" },
  { href: "/search", label: "Buscar", icon: "🔍" },
  { href: "/saved", label: "Salvos", icon: "🔖" },
];

export function TopBar({ onNewPost }: { onNewPost?: () => void }) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();

  // Sino agrega eventos (curtidas/comentários) + solicitações de follow.
  const eventCount =
    (profile?.event_notification || 0) +
    (profile?.followers_request?.length || 0);
  const chatCount = profile?.chat_notification || 0;

  const badged = [
    { href: "/notifications", label: "Notificações", icon: "🔔", count: eventCount },
    { href: "/messages", label: "Mensagens", icon: "💬", count: chatCount },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg text-white">
          <BrandWordmark />
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`rounded-lg px-2.5 py-1.5 text-lg transition ${
                  active ? "bg-neutral-800" : "hover:bg-neutral-900"
                }`}
              >
                {item.icon}
              </Link>
            );
          })}

          {badged.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`relative rounded-lg px-2.5 py-1.5 text-lg transition ${
                pathname === item.href ? "bg-neutral-800" : "hover:bg-neutral-900"
              }`}
            >
              {item.icon}
              {item.count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-inatel-500 px-1 text-[10px] font-bold text-white">
                  {item.count > 9 ? "9+" : item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {onNewPost && (
            <button
              onClick={onNewPost}
              className="rounded-lg bg-inatel-500 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-inatel-600"
            >
              + Post
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
            className="text-xs font-semibold text-neutral-400 hover:text-white"
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

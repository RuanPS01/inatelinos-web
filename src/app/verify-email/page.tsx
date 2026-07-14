"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/AuthShell";

const RESEND_COOLDOWN = 30;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, loading, emailVerified, resendVerification, reloadUser, signOut } =
    useAuth();
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Guardas de rota.
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (emailVerified) router.replace("/");
  }, [loading, user, emailVerified, router]);

  // Checagem automática a cada 5s.
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      const ok = await reloadUser();
      if (ok) router.replace("/");
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [reloadUser, router]);

  // Contador do reenvio.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onCheck = async () => {
    setChecking(true);
    setMessage(null);
    const ok = await reloadUser();
    setChecking(false);
    if (ok) router.replace("/");
    else setMessage("Ainda não confirmado. Abra o link enviado ao seu e-mail.");
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendVerification();
      setMessage("E-mail de confirmação reenviado!");
      setCooldown(RESEND_COOLDOWN);
    } catch {
      setMessage("Não foi possível reenviar. Aguarde e tente novamente.");
    }
  };

  return (
    <AuthShell>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white text-3xl">
          ✉️
        </div>
        <h2 className="text-lg font-bold">Confirme seu e-mail</h2>
        <p className="mt-1 text-sm font-semibold text-inatel-300">
          {user?.email}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          Enviamos um link de confirmação para a sua caixa de entrada do Inatel.
          Abra o e-mail e clique no link para ativar sua conta.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Não chegou? Verifique a pasta de spam.
        </p>

        {message && <p className="mt-4 text-sm text-inatel-200">{message}</p>}

        <button
          onClick={onCheck}
          disabled={checking}
          className="mt-5 w-full rounded-lg bg-inatel-500 py-3 text-sm font-bold text-white transition hover:bg-inatel-600 disabled:opacity-50"
        >
          {checking ? "Verificando…" : "Já confirmei"}
        </button>
        <button
          onClick={onResend}
          disabled={cooldown > 0}
          className="mt-3 w-full rounded-lg border border-inatel-400 py-3 text-sm font-semibold text-inatel-200 transition hover:bg-inatel-500/10 disabled:opacity-50"
        >
          {cooldown > 0 ? `Reenviar e-mail (${cooldown}s)` : "Reenviar e-mail"}
        </button>
        <button
          onClick={() => signOut()}
          className="mt-5 text-xs font-semibold text-inatel-300 hover:text-inatel-200"
        >
          E-mail errado? Sair
        </button>
      </div>
    </AuthShell>
  );
}

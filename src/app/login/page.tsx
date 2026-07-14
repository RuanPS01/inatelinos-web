"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import isInatelEmail from "@/lib/isInatelEmail";
import AuthShell from "@/components/AuthShell";

const FIELD =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-inatel-400 focus:outline-none";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, resetPassword, user, emailVerified } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Já autenticado? Deixa o fluxo seguir para o feed/verificação.
  useEffect(() => {
    if (user && emailVerified) router.replace("/");
    else if (user) router.replace("/verify-email");
  }, [user, emailVerified, router]);

  const mapError = (code: string) => {
    if (
      code === "auth/invalid-credential" ||
      code === "auth/wrong-password" ||
      code === "auth/user-not-found"
    )
      return "E-mail ou senha incorretos.";
    if (code === "auth/too-many-requests")
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    return "Não foi possível entrar. Tente novamente.";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!isInatelEmail(email)) {
      setError("Use seu e-mail do Inatel (@inatel.br ou @sigla.inatel.br).");
      return;
    }
    try {
      setLoading(true);
      await signIn(email, password);
    } catch (err) {
      setError(mapError((err as { code?: string }).code || ""));
    } finally {
      setLoading(false);
    }
  };

  const onForgot = async () => {
    setError(null);
    setInfo(null);
    if (!isInatelEmail(email)) {
      setError("Digite seu e-mail do Inatel para redefinir a senha.");
      return;
    }
    try {
      await resetPassword(email);
      setInfo("Enviamos um link de redefinição para o seu e-mail.");
    } catch {
      setError("Não foi possível enviar o e-mail de redefinição.");
    }
  };

  return (
    <AuthShell subtitle="A rede social de alunos e ex-alunos do Inatel">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          className={FIELD}
          type="email"
          placeholder="E-mail do Inatel"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={FIELD}
          type="password"
          placeholder="Senha"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={onForgot}
          className="self-end text-xs font-semibold text-inatel-300 hover:text-inatel-200"
        >
          Esqueceu a senha?
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {info && <p className="text-sm text-inatel-200">{info}</p>}

        <button
          type="submit"
          disabled={loading || !email || password.length < 6}
          className="mt-2 rounded-lg bg-inatel-500 py-3 text-sm font-bold text-white transition hover:bg-inatel-600 disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Não tem uma conta?{" "}
        <Link
          href="/signup"
          className="font-semibold text-inatel-300 hover:text-inatel-200"
        >
          Cadastre-se
        </Link>
      </p>
    </AuthShell>
  );
}

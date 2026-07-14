"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import isInatelEmail from "@/lib/isInatelEmail";
import AuthShell from "@/components/AuthShell";

const FIELD =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-inatel-400 focus:outline-none";

export default function SignupPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailInvalid = email.length > 0 && !isInatelEmail(email);
  const canSubmit =
    isInatelEmail(email) && password.length >= 6 && password === confirm;

  const mapError = (code: string) => {
    if (code === "auth/email-already-in-use")
      return "Este e-mail já possui uma conta. Faça login.";
    if (code === "auth/weak-password")
      return "Senha fraca: use pelo menos 6 caracteres.";
    if (code === "auth/invalid-email") return "E-mail inválido.";
    return "Não foi possível criar a conta. Tente novamente.";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    try {
      setLoading(true);
      await signUp(email, password);
      // O AuthProvider + AppGate levam para /verify-email automaticamente.
    } catch (err) {
      const e2 = err as { code?: string; message?: string };
      setError(e2.code ? mapError(e2.code) : e2.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Crie sua conta com o e-mail do Inatel">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          className={FIELD}
          type="email"
          placeholder="E-mail do Inatel"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailInvalid && (
          <p className="-mt-1 text-xs text-red-400">
            Somente e-mails @inatel.br ou @sigla.inatel.br
          </p>
        )}
        <input
          className={FIELD}
          type="password"
          placeholder="Senha (mínimo 6 caracteres)"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className={FIELD}
          type="password"
          placeholder="Confirmar senha"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {confirm.length > 0 && confirm !== password && (
          <p className="-mt-1 text-xs text-red-400">As senhas não coincidem.</p>
        )}

        <div className="mt-1 flex items-start gap-2 rounded-lg bg-neutral-900/60 p-3">
          <span className="text-inatel-300">✉️</span>
          <p className="text-xs leading-relaxed text-neutral-400">
            Enviaremos um link de confirmação para o seu e-mail do Inatel. A
            conta só é liberada após a confirmação.
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="mt-2 rounded-lg bg-inatel-500 py-3 text-sm font-bold text-white transition hover:bg-inatel-600 disabled:opacity-50"
        >
          {loading ? "Criando conta…" : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-inatel-300 hover:text-inatel-200"
        >
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}

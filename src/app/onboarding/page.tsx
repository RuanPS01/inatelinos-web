"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/AuthShell";

const FIELD =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-inatel-400 focus:outline-none";
const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;

const suggestUsername = (email: string) =>
  (email.split("@")[0] || "")
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, ".")
    .slice(0, 30);

// Primeiro acesso: a conta já está confirmada, mas o perfil ainda não existe
// no Firestore. Cria o documento users/{email} com a mesma estrutura do app.
export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, emailVerified, profile, profileChecked } = useAuth();
  const email = (user?.email || "").toLowerCase();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!emailVerified) router.replace("/verify-email");
    else if (profileChecked && profile) router.replace("/");
  }, [loading, user, emailVerified, profile, profileChecked, router]);

  useEffect(() => {
    if (email && !username) setUsername(suggestUsername(email));
  }, [email, username]);

  const usernameValid = useMemo(
    () => USERNAME_REGEX.test(username),
    [username]
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!usernameValid || !email) return;
    try {
      setSaving(true);
      const displayName = name.trim() || username;
      const avatar =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(displayName) +
        "&background=1E60AD&color=fff&size=256";

      await setDoc(doc(db, "users", email), {
        owner_uid: user!.uid,
        username,
        email,
        profile_picture: avatar,
        name: displayName,
        bio: "",
        link: "",
        gender: ["Prefer not to say", ""],
        followers: [],
        following: [],
        followers_request: [],
        following_request: [],
        event_notification: 0,
        chat_notification: 0,
        saved_posts: [],
        close_friends: [],
        favorite_users: [],
        muted_users: [],
        createdAt: serverTimestamp(),
        country: "BR",
      });
      router.replace("/");
    } catch (err) {
      console.error(err);
      setError("Não foi possível criar seu perfil. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <AuthShell subtitle="Bem-vindo(a), inatelino(a)!">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="mb-1 flex items-center justify-center gap-2 text-sm">
          <span className="text-inatel-300">✅</span>
          <span className="font-semibold text-inatel-300">{email}</span>
        </div>

        <label className="text-xs text-neutral-400">Nome de usuário</label>
        <input
          className={FIELD}
          placeholder="nome.de.usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          autoCapitalize="none"
        />
        <p className="-mt-1 text-xs text-neutral-500">
          Letras minúsculas, números, ponto e underline (3 a 30 caracteres).
        </p>

        <label className="mt-2 text-xs text-neutral-400">Nome exibido</label>
        <input
          className={FIELD}
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving || !usernameValid}
          className="mt-3 rounded-lg bg-inatel-500 py-3 text-sm font-bold text-white transition hover:bg-inatel-600 disabled:opacity-50"
        >
          {saving ? "Criando perfil…" : "Criar meu perfil"}
        </button>
      </form>
    </AuthShell>
  );
}

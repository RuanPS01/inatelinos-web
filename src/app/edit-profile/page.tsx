"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import AppGate from "@/components/AppGate";
import TopBar from "@/components/TopBar";

const FIELD =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-inatel-400 focus:outline-none";

function EditProfileContent() {
  const router = useRouter();
  const { profile } = useAuth();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [link, setLink] = useState("");
  const [avatar, setAvatar] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setLink(profile.link || "");
      setAvatar(profile.profile_picture || "");
    }
  }, [profile]);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setNewFile(f);
    if (f) setAvatar(URL.createObjectURL(f));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || saving) return;
    setMessage(null);
    try {
      setSaving(true);
      let profile_picture = profile.profile_picture;
      if (newFile) {
        const storageRef = ref(storage, `${profile.email}/profile_${Date.now()}`);
        await uploadBytes(storageRef, newFile);
        profile_picture = await getDownloadURL(storageRef);
      }
      await updateDoc(doc(db, "users", profile.email), {
        name: name.trim() || profile.username,
        bio: bio.trim(),
        link: link.trim(),
        profile_picture,
      });
      setMessage("Perfil atualizado!");
      setTimeout(() => router.push("/profile"), 800);
    } catch (err) {
      console.error(err);
      setMessage("Não foi possível salvar. Tente novamente.");
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-5 text-lg font-bold">Editar perfil</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt="foto de perfil"
            className="h-24 w-24 rounded-full border border-neutral-700 object-cover"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm font-semibold text-inatel-300 hover:text-inatel-200"
          >
            Alterar foto
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
        </div>

        <div>
          <label className="text-xs text-neutral-400">Nome de usuário</label>
          <input className={`${FIELD} mt-1 opacity-60`} value={profile.username} disabled />
          <p className="mt-1 text-xs text-neutral-600">
            O nome de usuário não pode ser alterado.
          </p>
        </div>

        <div>
          <label className="text-xs text-neutral-400">Nome exibido</label>
          <input
            className={`${FIELD} mt-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-400">Bio</label>
          <textarea
            className={`${FIELD} mt-1 resize-none`}
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Conte um pouco sobre você"
          />
        </div>

        <div>
          <label className="text-xs text-neutral-400">Link</label>
          <input
            className={`${FIELD} mt-1`}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
          />
        </div>

        {message && <p className="text-sm text-inatel-200">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-inatel-500 py-3 text-sm font-bold text-white transition hover:bg-inatel-600 disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </main>
  );
}

export default function EditProfilePage() {
  return (
    <AppGate>
      <div className="min-h-screen bg-black">
        <TopBar />
        <EditProfileContent />
      </div>
    </AppGate>
  );
}

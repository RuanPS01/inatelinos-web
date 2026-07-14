"use client";

import { useState, type ChangeEvent } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

// Cria um post: envia a imagem para o Storage em {email}/{timestamp} e grava
// o documento em users/{email}/posts — mesmo formato do app mobile.
export function NewPostForm({ onDone }: { onDone: () => void }) {
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onPublish = async () => {
    if (!file || !profile || uploading) return;
    setError(null);
    try {
      setUploading(true);
      const timestamp = Date.now().toString();
      const storageRef = ref(storage, `${profile.email}/${timestamp}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "users", profile.email, "posts"), {
        imageUrl,
        username: profile.username,
        profile_picture: profile.profile_picture,
        owner_uid: profile.owner_uid,
        owner_email: profile.email,
        caption: caption.trim(),
        createdAt: serverTimestamp(),
        likes_by_users: [],
        new_likes: [],
        comments: [],
      });
      onDone();
    } catch (e) {
      console.error(e);
      setError("Falha ao publicar. Verifique sua conexão e tente novamente.");
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
      onClick={onDone}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Novo post</h2>
          <button
            onClick={onDone}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-neutral-700 bg-neutral-900">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="prévia"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-neutral-500">
              Clique para escolher uma imagem
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPick}
          />
        </label>

        <textarea
          className="mt-4 w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-inatel-400 focus:outline-none"
          rows={3}
          placeholder="Escreva uma legenda…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

        <button
          onClick={onPublish}
          disabled={!file || uploading}
          className="mt-4 w-full rounded-lg bg-inatel-500 py-3 text-sm font-bold text-white transition hover:bg-inatel-600 disabled:opacity-50"
        >
          {uploading ? "Publicando…" : "Publicar"}
        </button>
      </div>
    </div>
  );
}

export default NewPostForm;

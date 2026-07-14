// Ações sociais do Inatelinos, espelhando exatamente a lógica do app mobile
// para manter os dados compatíveis entre web e app.
import {
  Timestamp,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Post, UserProfile } from "./types";

// ─────────────────────────── Follow (privado, com solicitação) ──────────────

// Envia solicitação de seguir (mesmo modelo do app: entra em *_request).
export async function sendFollowRequest(viewerEmail: string, targetEmail: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "users", targetEmail), {
    followers_request: arrayUnion(viewerEmail),
  });
  batch.update(doc(db, "users", viewerEmail), {
    following_request: arrayUnion(targetEmail),
  });
  await batch.commit();
}

// Cancela uma solicitação pendente.
export async function cancelFollowRequest(viewerEmail: string, targetEmail: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "users", targetEmail), {
    followers_request: arrayRemove(viewerEmail),
  });
  batch.update(doc(db, "users", viewerEmail), {
    following_request: arrayRemove(targetEmail),
  });
  await batch.commit();
}

// Deixa de seguir.
export async function unfollow(viewerEmail: string, targetEmail: string) {
  const batch = writeBatch(db);
  batch.update(doc(db, "users", viewerEmail), {
    following: arrayRemove(targetEmail),
  });
  batch.update(doc(db, "users", targetEmail), {
    followers: arrayRemove(viewerEmail),
  });
  await batch.commit();
}

// Responde a uma solicitação recebida (viewer é quem recebeu; requester pediu).
export async function respondFollowRequest(
  viewerEmail: string,
  requesterEmail: string,
  accept: boolean
) {
  const requesterRef = doc(db, "users", requesterEmail);
  const viewerRef = doc(db, "users", viewerEmail);

  await updateDoc(requesterRef, {
    following_request: arrayRemove(viewerEmail),
    ...(accept && { following: arrayUnion(viewerEmail) }),
  });
  await updateDoc(viewerRef, {
    followers_request: arrayRemove(requesterEmail),
    ...(accept && { followers: arrayUnion(requesterEmail) }),
  });
  if (accept) {
    await updateDoc(requesterRef, { event_notification: increment(1) });
  }
}

export type FollowState = "following" | "requested" | "none" | "self";

export function getFollowState(
  viewer: UserProfile | null,
  targetEmail: string
): FollowState {
  if (!viewer) return "none";
  if (viewer.email === targetEmail) return "self";
  if (viewer.following?.includes(targetEmail)) return "following";
  if (viewer.following_request?.includes(targetEmail)) return "requested";
  return "none";
}

// ─────────────────────────────────── Salvar ────────────────────────────────

export async function toggleSave(post: Post, viewer: UserProfile) {
  const userRef = doc(db, "users", viewer.email);
  const isSaved = viewer.saved_posts?.includes(post.id);
  await updateDoc(userRef, {
    saved_posts: isSaved ? arrayRemove(post.id) : arrayUnion(post.id),
  });
}

// ────────────────────────────────── Comentar ───────────────────────────────

export async function addComment(post: Post, viewer: UserProfile, text: string) {
  const value = text.trim();
  if (!value) return;
  const postRef = doc(db, "users", post.owner_email, "posts", post.id);
  const snapshot = await getDoc(postRef);
  if (!snapshot.exists()) return;

  const newComment = {
    email: viewer.email,
    profile_picture: viewer.profile_picture,
    username: viewer.username,
    comment: value,
    createdAt: Timestamp.now(),
    likes_by_users: "",
  };
  await updateDoc(postRef, { comments: arrayUnion(newComment) });

  if (post.owner_email !== viewer.email) {
    await updateDoc(doc(db, "users", post.owner_email), {
      event_notification: increment(1),
    });
  }
}

// ─────────────────────────────── Buscar usuário ────────────────────────────

// Busca um perfil pelo nome de usuário (que é único na prática).
export async function getUserByUsername(
  username: string
): Promise<UserProfile | null> {
  const q = query(
    collection(db, "users"),
    where("username", "==", username.toLowerCase()),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfile;
}

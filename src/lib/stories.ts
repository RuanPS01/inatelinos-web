// Ações de stories, espelhando o app mobile.
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";
import type { Story, UserProfile } from "./types";

// Publica um story: envia a imagem ao Storage e grava em users/{email}/stories.
export async function uploadStory(file: File, user: UserProfile) {
  const timestamp = Date.now().toString();
  const storageRef = ref(storage, `${user.email}/${timestamp}`);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);

  await addDoc(collection(db, "users", user.email, "stories"), {
    imageUrl,
    username: user.username,
    name: user.name,
    profile_picture: user.profile_picture,
    owner_uid: user.owner_uid,
    owner_email: user.email,
    createdAt: serverTimestamp(),
    likes_by_users: [],
    new_likes: [],
    seen_by_users: [],
  });
}

// Marca um story como visto pelo usuário atual.
export async function markStorySeen(story: Story, viewerEmail: string) {
  if (story.seen_by_users?.includes(viewerEmail)) return;
  await updateDoc(
    doc(db, "users", story.owner_email, "stories", story.id),
    { seen_by_users: arrayUnion(viewerEmail) }
  );
}

// Curte/descurte um story (mesma lógica do handleStoryLike do app).
export async function toggleStoryLike(story: Story, viewerEmail: string) {
  const willLike = !story.likes_by_users?.includes(viewerEmail);
  await updateDoc(doc(db, "users", story.owner_email, "stories", story.id), {
    likes_by_users: willLike
      ? arrayUnion(viewerEmail)
      : arrayRemove(viewerEmail),
  });
}

// Considera "ativo" um story das últimas 24h (comportamento de stories).
export function isRecentStory(story: Story): boolean {
  if (!story.createdAt?.seconds) return true;
  const ageHours = (Date.now() / 1000 - story.createdAt.seconds) / 3600;
  return ageHours <= 24;
}

// Agrupa stories por usuário, ordenando cada grupo do mais antigo ao mais novo.
export interface StoryGroup {
  ownerEmail: string;
  username: string;
  profile_picture: string;
  stories: Story[];
  allSeenBy: (email: string) => boolean;
}

export function groupStoriesByUser(stories: Story[]): StoryGroup[] {
  const byUser = new Map<string, Story[]>();
  for (const s of stories) {
    const list = byUser.get(s.owner_email) || [];
    list.push(s);
    byUser.set(s.owner_email, list);
  }

  const groups: StoryGroup[] = [];
  for (const [ownerEmail, list] of byUser) {
    list.sort(
      (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
    );
    const first = list[0];
    groups.push({
      ownerEmail,
      username: first.username,
      profile_picture: first.profile_picture,
      stories: list,
      allSeenBy: (email: string) =>
        list.every((s) => s.seen_by_users?.includes(email)),
    });
  }

  // Grupos com stories não vistos primeiro; depois por story mais recente.
  return groups;
}

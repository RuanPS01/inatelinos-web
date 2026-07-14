// Ações de chat, espelhando o app mobile. Cada usuário tem sua própria caixa:
// users/{email}/chat/{outro} com uma subcoleção messages. Ao enviar, grava-se
// nas duas caixas (a minha com who="current", a do outro com who="user").
import {
  collection,
  doc,
  increment,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "./types";

type Contact = Pick<
  UserProfile,
  "email" | "username" | "name" | "profile_picture"
>;

export async function sendMessage(
  me: UserProfile,
  other: Contact,
  text: string
) {
  const message = text.trim();
  if (!message) return;

  const batch = writeBatch(db);
  const myChatRef = doc(db, "users", me.email, "chat", other.email);
  const otherChatRef = doc(db, "users", other.email, "chat", me.email);

  // Garante meu contato (visto) e o do destinatário apontando para mim (não visto).
  batch.set(
    myChatRef,
    {
      email: other.email,
      username: other.username,
      name: other.name,
      profile_picture: other.profile_picture,
      status: "seen",
    },
    { merge: true }
  );
  batch.set(
    otherChatRef,
    {
      email: me.email,
      username: me.username,
      name: me.name,
      profile_picture: me.profile_picture,
      status: "unseen",
    },
    { merge: true }
  );

  // Incrementa a notificação de chat do destinatário.
  batch.set(
    doc(db, "users", other.email),
    { chat_notification: increment(1) },
    { merge: true }
  );

  // Uma cópia em cada caixa.
  batch.set(doc(collection(myChatRef, "messages")), {
    message,
    timestamp: serverTimestamp(),
    who: "current",
  });
  batch.set(doc(collection(otherChatRef, "messages")), {
    message,
    timestamp: serverTimestamp(),
    who: "user",
  });

  await batch.commit();
}

// Marca a conversa como vista na minha caixa.
export async function markChatSeen(myEmail: string, otherEmail: string) {
  try {
    await updateDoc(doc(db, "users", myEmail, "chat", otherEmail), {
      status: "seen",
    });
  } catch {
    // O contato pode ainda não existir (conversa nova) — ignorar.
  }
}

// Zera o contador de notificações de chat (ao abrir a lista de conversas).
export async function resetChatNotification(myEmail: string) {
  try {
    await updateDoc(doc(db, "users", myEmail), { chat_notification: 0 });
  } catch (e) {
    console.error("Erro ao zerar chat_notification:", e);
  }
}

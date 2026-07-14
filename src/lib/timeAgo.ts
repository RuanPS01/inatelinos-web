import type { Timestamp } from "firebase/firestore";

// Formata um Timestamp do Firestore como tempo relativo em pt-BR.
export function timeAgo(ts: Timestamp | null | undefined): string {
  if (!ts?.seconds) return "";
  const seconds = Math.floor(Date.now() / 1000 - ts.seconds);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} sem`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mês${months > 1 ? "es" : ""}`;
  return `${Math.floor(days / 365)} a`;
}

export default timeAgo;

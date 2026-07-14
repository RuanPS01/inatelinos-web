import type { Timestamp } from "firebase/firestore";

// Perfil do usuário — documento em users/{email}. Mesma estrutura gravada
// pelo app mobile (inatelinos-app), para total compatibilidade.
export interface UserProfile {
  owner_uid: string;
  username: string;
  email: string;
  profile_picture: string;
  name: string;
  bio: string;
  link: string;
  gender: [string, string];
  followers: string[];
  following: string[];
  followers_request: string[];
  following_request: string[];
  event_notification: number;
  chat_notification: number;
  saved_posts: string[];
  close_friends: string[];
  favorite_users: string[];
  muted_users: string[];
  createdAt: Timestamp | null;
  country: string;
}

// Comentário de um post.
export interface PostComment {
  username: string;
  profile_picture: string;
  comment: string;
  createdAt?: Timestamp | null;
  likes_by_users?: string[];
}

// Story — documento em users/{email}/stories/{storyId}.
export interface Story {
  id: string;
  imageUrl: string;
  username: string;
  name: string;
  profile_picture: string;
  owner_uid: string;
  owner_email: string;
  createdAt: Timestamp | null;
  likes_by_users: string[];
  new_likes: string[];
  seen_by_users: string[];
}

// Contato de chat — documento em users/{email}/chat/{otherEmail}.
export interface ChatContact {
  email: string;
  username: string;
  name: string;
  profile_picture: string;
  status: "seen" | "unseen";
}

// Mensagem — documento em users/{email}/chat/{otherEmail}/messages/{id}.
// who = "current" → enviada pelo dono da caixa; "user" → recebida.
export interface ChatMessage {
  message: string;
  timestamp: Timestamp | null;
  who: "current" | "user";
}

// Post — documento em users/{email}/posts/{postId}.
export interface Post {
  id: string;
  imageUrl: string;
  username: string;
  profile_picture: string;
  owner_uid: string;
  owner_email: string;
  caption: string;
  createdAt: Timestamp | null;
  likes_by_users: string[];
  new_likes: string[];
  comments: PostComment[];
}

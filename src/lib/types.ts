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

// Helpers de rota. Usamos query params (em vez de rotas dinâmicas) para que o
// app possa ser exportado como site estático e hospedado em qualquer lugar
// (Firebase Hosting no plano gratuito, Render, etc.).
export const profileHref = (username: string) =>
  `/u?user=${encodeURIComponent(username)}`;

export const chatHref = (email: string) =>
  `/chat?email=${encodeURIComponent(email)}`;

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Credenciais do MESMO projeto Firebase do app mobile (ver .env.local.example).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Sem as variáveis (ex.: durante o build sem .env.local), usamos um valor
// de preenchimento para que a inicialização não lance erro e o build passe.
// As chamadas reais só acontecem no navegador com as credenciais corretas.
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
if (!isConfigured && typeof window !== "undefined") {
  console.warn(
    "⚠️ Configuração do Firebase ausente. Copie .env.local.example para " +
      ".env.local, preencha as variáveis NEXT_PUBLIC_FIREBASE_* e reinicie " +
      "o servidor (ver README)."
  );
}

const app = getApps().length
  ? getApp()
  : initializeApp({
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey || "missing-api-key",
    });

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// E-mails do Firebase (confirmação/redefinição) em português.
auth.languageCode = "pt";

export default app;

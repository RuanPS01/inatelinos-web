"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BrandMark } from "./Brand";

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <span className="animate-pulse text-inatel-500">
        <BrandMark size={56} />
      </span>
    </div>
  );
}

// Envolve páginas protegidas. Direciona o usuário conforme o estágio do
// fluxo: não logado → /login; e-mail não confirmado → /verify-email;
// sem perfil → /onboarding. Espelha o gate do app mobile.
export function AppGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading, emailVerified, profile, profileChecked } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (!emailVerified) {
      router.replace("/verify-email");
    } else if (profileChecked && !profile) {
      router.replace("/onboarding");
    }
  }, [loading, user, emailVerified, profile, profileChecked, router]);

  const ready =
    !loading && user && emailVerified && profileChecked && Boolean(profile);

  if (!ready) return <FullScreenLoader />;
  return <>{children}</>;
}

export default AppGate;

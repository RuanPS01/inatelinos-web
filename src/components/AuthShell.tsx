"use client";

import type { ReactNode } from "react";
import { BrandMark } from "./Brand";

// Moldura centralizada usada nas telas de autenticação.
export function AuthShell({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="text-inatel-500">
            <BrandMark size={56} />
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight lowercase">
            inatelinos
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </main>
  );
}

export default AuthShell;

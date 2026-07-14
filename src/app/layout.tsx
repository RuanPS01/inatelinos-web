import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Inatelinos",
  description:
    "A rede social exclusiva de alunos e ex-alunos do Inatel — Instituto Nacional de Telecomunicações.",
};

export const viewport: Viewport = {
  themeColor: "#1E60AD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exporta o app como site estático (SPA). Todo o Firebase roda no
  // navegador, então não há SSR a perder — e o resultado (pasta `out/`)
  // roda no Firebase Hosting gratuito, no Render ou em qualquer host estático.
  output: "export",
  // URLs em estilo de diretório (/rota/), servidas de forma consistente por
  // Firebase Hosting e Render.
  trailingSlash: true,
  images: {
    // Sem servidor de otimização de imagens no export estático.
    unoptimized: true,
  },
};

export default nextConfig;

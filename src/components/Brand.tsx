// Logotipo do Inatelinos: a "antena transmitindo" (ponto + ondas) seguida do
// wordmark. Desenhado em SVG inline, sem depender de imagens externas.

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="18"
        y="18"
        width="64"
        height="64"
        rx="18"
        stroke="currentColor"
        strokeWidth="7"
      />
      <circle cx="50" cy="60" r="5.5" fill="currentColor" />
      <path
        d="M38 55 A16 16 0 0 1 62 55"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M31 48 A26 26 0 0 1 69 48"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}
    >
      <span className="text-inatel-500">
        <BrandMark size={30} />
      </span>
      <span>inatelinos</span>
    </span>
  );
}

export default BrandWordmark;

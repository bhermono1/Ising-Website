import Image from "next/image";

export function ISingLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      {/* Real mic + waveform from the actual logo */}
      <Image
        src="/mic.png"
        alt=""
        width={56}
        height={75}
        className="h-full w-auto object-contain"
        priority
      />
      {/* Wordmark as SVG so it's crisp at any size */}
      <svg
        viewBox="0 0 148 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        aria-label="i-Sing Karaoke & Café"
      >
        <text
          x="0"
          y="42"
          fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
          fontWeight="900"
          fontSize="36"
          fill="#d91b8c"
        >
          i-Sing
        </text>
        <text
          x="2"
          y="58"
          fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
          fontWeight="400"
          fontSize="13"
          fill="#5443a7"
        >
          Karaoke &amp; Café
        </text>
      </svg>
    </div>
  );
}

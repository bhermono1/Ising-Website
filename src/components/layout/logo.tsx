export function ISingLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mic.png" alt="" className="h-14 w-auto" />
      <svg
        viewBox="0 0 148 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-auto"
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

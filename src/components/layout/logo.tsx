export function ISingLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="i-Sing Karaoke & Café"
    >
      <defs>
        <linearGradient id="logo-wave" x1="4" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d91b8c" />
          <stop offset="1" stopColor="#3d4db8" />
        </linearGradient>
        <linearGradient id="logo-handle" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#3d4db8" />
          <stop offset="1" stopColor="#5443a7" />
        </linearGradient>
      </defs>

      {/* Waveform cord */}
      <path
        d="M4,50 C8,50 10,36 15,33 C20,30 21,54 27,50 C33,46 32,28 37,26 C40,25 42,44 46,48 C50,51 55,52 60,52"
        stroke="url(#logo-wave)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Mic group — tilted ~22° */}
      <g transform="rotate(-22 60 52)">
        {/* Handle */}
        <rect x="56.5" y="25" width="7" height="27" rx="3.5" fill="url(#logo-handle)" />
        {/* Connector arc at bottom */}
        <path d="M56.5,52 Q60,57 63.5,52" stroke="#5443a7" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Head */}
        <ellipse cx="60" cy="13" rx="11.5" ry="13" fill="#1c1824" />
        {/* Dot grid */}
        <circle cx="56.5" cy="9.5"  r="1.3" fill="white" opacity="0.65" />
        <circle cx="60"   cy="9.5"  r="1.3" fill="white" opacity="0.65" />
        <circle cx="63.5" cy="9.5"  r="1.3" fill="white" opacity="0.65" />
        <circle cx="56.5" cy="14"   r="1.3" fill="white" opacity="0.65" />
        <circle cx="60"   cy="14"   r="1.3" fill="white" opacity="0.65" />
        <circle cx="63.5" cy="14"   r="1.3" fill="white" opacity="0.65" />
        <circle cx="56.5" cy="18.5" r="1.3" fill="white" opacity="0.65" />
        <circle cx="60"   cy="18.5" r="1.3" fill="white" opacity="0.65" />
        <circle cx="63.5" cy="18.5" r="1.3" fill="white" opacity="0.65" />
      </g>

      {/* i-Sing wordmark */}
      <text
        x="80"
        y="40"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="32"
        fill="#d91b8c"
      >
        i-Sing
      </text>

      {/* Karaoke & Café */}
      <text
        x="82"
        y="56"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        fontWeight="400"
        fontSize="12"
        fill="#5443a7"
      >
        Karaoke &amp; Café
      </text>
    </svg>
  );
}

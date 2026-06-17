export function ISingLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="i-Sing Karaoke & Café"
    >
      <defs>
        {/* Waveform cord: hot pink → indigo */}
        <linearGradient id="lg-wave" x1="4" y1="0" x2="58" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d91b8c" />
          <stop offset="0.55" stopColor="#7b35b8" />
          <stop offset="1" stopColor="#3d4db8" />
        </linearGradient>
        {/* Handle: dark blue → purple */}
        <linearGradient id="lg-handle" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#3a4bbf" />
          <stop offset="1" stopColor="#5443a7" />
        </linearGradient>
        {/* Ring connector: same as handle bottom */}
        <linearGradient id="lg-ring" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#5443a7" />
          <stop offset="1" stopColor="#6a57c0" />
        </linearGradient>
      </defs>

      {/* ── Waveform cord ─────────────────────────────────────── */}
      {/*  Pink → purple S-wave from left, ending at mic connector  */}
      <path
        d="M4,52 C9,52 11,40 16,37 C21,34 22,56 27,52 C32,48 31,30 36,27 C40,25 42,46 46,50 C50,53 54,54 58,54"
        stroke="url(#lg-wave)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Microphone — rotated ~23° CCW around connector point ── */}
      <g transform="rotate(-23 58 54)">

        {/* Ring / cable connector at base */}
        <circle cx="58" cy="54" r="5.5" stroke="url(#lg-ring)" strokeWidth="2.2" />

        {/* Handle body */}
        <rect x="54.5" y="24" width="7" height="30" rx="3.5" fill="url(#lg-handle)" />

        {/* Small oval pill detail on handle (matches logo) */}
        <ellipse cx="58" cy="37" rx="2.2" ry="1.5" fill="white" opacity="0.35" />

        {/* Silver band between handle and head */}
        <rect x="53.5" y="21" width="9" height="4" rx="2" fill="#9099cc" />

        {/* Mic head — large dark ball */}
        <circle cx="58" cy="10" r="13" fill="#1c1824" />

        {/* Dot grid — 3 cols × 4 rows */}
        <circle cx="54.5" cy="5.5"  r="1.3" fill="white" opacity="0.7" />
        <circle cx="58"   cy="5.5"  r="1.3" fill="white" opacity="0.7" />
        <circle cx="61.5" cy="5.5"  r="1.3" fill="white" opacity="0.7" />

        <circle cx="54.5" cy="9.5"  r="1.3" fill="white" opacity="0.7" />
        <circle cx="58"   cy="9.5"  r="1.3" fill="white" opacity="0.7" />
        <circle cx="61.5" cy="9.5"  r="1.3" fill="white" opacity="0.7" />

        <circle cx="54.5" cy="13.5" r="1.3" fill="white" opacity="0.7" />
        <circle cx="58"   cy="13.5" r="1.3" fill="white" opacity="0.7" />
        <circle cx="61.5" cy="13.5" r="1.3" fill="white" opacity="0.7" />

        <circle cx="54.5" cy="17.5" r="1.3" fill="white" opacity="0.7" />
        <circle cx="58"   cy="17.5" r="1.3" fill="white" opacity="0.7" />
        <circle cx="61.5" cy="17.5" r="1.3" fill="white" opacity="0.7" />
      </g>

      {/* ── i-Sing wordmark ───────────────────────────────────── */}
      <text
        x="82"
        y="40"
        fontFamily="system-ui, -apple-system, 'Helvetica Neue', sans-serif"
        fontWeight="900"
        fontSize="32"
        fill="#d91b8c"
      >
        i-Sing
      </text>

      {/* ── Karaoke & Café subtitle ───────────────────────────── */}
      <text
        x="84"
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

// Subtle SVG geometric pattern — very low opacity so it doesn't compete with content
export function IslamicPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.028 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="ip"
          x="0"
          y="0"
          width="96"
          height="96"
          patternUnits="userSpaceOnUse"
        >
          {/* Eight-pointed star outline */}
          <polygon
            points="48,4 56,28 80,28 62,44 68,68 48,54 28,68 34,44 16,28 40,28"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="0.7"
          />
          {/* Center circle */}
          <circle cx="48" cy="48" r="10" fill="none" stroke="#7dd3fc" strokeWidth="0.5" />
          {/* Corner dots */}
          <circle cx="0" cy="0" r="2" fill="#7dd3fc" opacity="0.5" />
          <circle cx="96" cy="0" r="2" fill="#7dd3fc" opacity="0.5" />
          <circle cx="0" cy="96" r="2" fill="#7dd3fc" opacity="0.5" />
          <circle cx="96" cy="96" r="2" fill="#7dd3fc" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ip)" />
    </svg>
  );
}

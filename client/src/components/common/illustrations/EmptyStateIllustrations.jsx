import React from 'react';

export const NoStoresIllustration = () => (
  <svg
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '130px', height: '110px', margin: '0 auto 1.25rem', display: 'block' }}
  >
    <defs>
      <linearGradient id="nsRoof" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="var(--user-accent)" />
        <stop offset="100%" stopColor="var(--user-accent)" stopOpacity="0.75" />
      </linearGradient>
    </defs>
    {/* Base Shadow */}
    <ellipse cx="80" cy="120" rx="55" ry="14" fill="var(--bg-surface)" opacity="0.8" />

    {/* Store Building Body */}
    <rect x="42" y="62" width="76" height="52" rx="6" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1.5" />

    {/* Door */}
    <rect x="68" y="82" width="24" height="32" rx="4" fill="var(--user-accent-subtle)" stroke="var(--user-accent)" strokeWidth="1.5" />
    <circle cx="86" cy="98" r="2" fill="var(--user-accent)" />

    {/* Windows */}
    <rect x="48" y="74" width="14" height="20" rx="3" fill="var(--bg-surface)" stroke="var(--border-color)" strokeWidth="1.2" />
    <rect x="98" y="74" width="14" height="20" rx="3" fill="var(--bg-surface)" stroke="var(--border-color)" strokeWidth="1.2" />

    {/* Awning */}
    <path d="M36 62 L80 44 L124 62 L120 70 L40 70 Z" fill="url(#nsRoof)" stroke="var(--border-color)" strokeWidth="1.5" />

    {/* Floating Stars */}
    <circle cx="28" cy="40" r="3" fill="var(--star-filled)" />
    <circle cx="132" cy="36" r="4" fill="var(--star-filled)" />
    <circle cx="80" cy="22" r="3.5" fill="var(--user-accent)" opacity="0.6" />
  </svg>
);

export const NoRatingsIllustration = () => (
  <svg
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '130px', height: '110px', margin: '0 auto 1.25rem', display: 'block' }}
  >
    {/* Base Shadow */}
    <ellipse cx="80" cy="120" rx="50" ry="12" fill="var(--bg-surface)" opacity="0.8" />

    {/* Speech Bubble Container */}
    <path
      d="M32 30 C32 22 38 16 46 16 L114 16 C122 16 128 22 128 30 L128 78 C128 86 122 92 114 92 L76 92 L54 108 L58 92 L46 92 C38 92 32 86 32 78 Z"
      fill="var(--bg-card)"
      stroke="var(--border-color)"
      strokeWidth="1.5"
    />

    {/* 3 Floating Stars Inside */}
    <g transform="translate(48, 44)">
      {/* Star 1 */}
      <path
        d="M10 2 L12.5 8 L18.5 8.8 L14 13 L15.2 19 L10 16 L4.8 19 L6 13 L1.5 8.8 L7.5 8 Z"
        fill="var(--warning-bg)"
        stroke="var(--star-filled)"
        strokeWidth="1.2"
      />
      {/* Star 2 (Center, slightly larger) */}
      <path
        d="M32 0 L35 7 L42 8 L37 13 L38.5 20 L32 16.5 L25.5 20 L27 13 L22 8 L29 7 Z"
        fill="var(--star-filled)"
      />
      {/* Star 3 */}
      <path
        d="M54 2 L56.5 8 L62.5 8.8 L58 13 L59.2 19 L54 16 L48.8 19 L50 13 L45.5 8.8 L51.5 8 Z"
        fill="var(--warning-bg)"
        stroke="var(--star-filled)"
        strokeWidth="1.2"
      />
    </g>

    {/* Sparkling Accents */}
    <path d="M22 28 L24 22 L26 28 L32 30 L26 32 L24 38 L22 32 L16 30 Z" fill="var(--user-accent)" opacity="0.75" />
    <circle cx="136" cy="46" r="3" fill="var(--star-filled)" />
  </svg>
);

export const NoSearchResultsIllustration = () => (
  <svg
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '130px', height: '110px', margin: '0 auto 1.25rem', display: 'block' }}
  >
    {/* Base Radar Waves */}
    <ellipse cx="76" cy="116" rx="52" ry="14" stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="4 4" />
    <ellipse cx="76" cy="116" rx="34" ry="9" stroke="var(--border-color)" strokeWidth="1.5" />

    {/* Magnifying Glass Lens */}
    <circle cx="68" cy="56" r="34" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="3" />
    <circle cx="68" cy="56" r="26" fill="var(--accent-subtle)" opacity="0.5" />

    {/* Question Mark or Empty Target Inside Lens */}
    <circle cx="68" cy="52" r="8" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="68" y1="64" x2="68" y2="67" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" />

    {/* Glass Glare Highlight */}
    <path d="M50 42 A 26 26 0 0 1 76 32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

    {/* Magnifying Glass Handle */}
    <line x1="93" y1="81" x2="118" y2="106" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
    <line x1="94" y1="82" x2="114" y2="102" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

    {/* Floating Coordinate Particles */}
    <circle cx="125" cy="42" r="2.5" fill="var(--text-muted)" />
    <circle cx="28" cy="72" r="3" fill="var(--accent)" opacity="0.6" />
    <circle cx="120" cy="76" r="2" fill="var(--star-filled)" />
  </svg>
);

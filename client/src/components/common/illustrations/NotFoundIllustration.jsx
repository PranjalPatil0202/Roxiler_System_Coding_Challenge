import React from 'react';

const NotFoundIllustration = () => {
  return (
    <div style={{ width: '100%', maxWidth: '360px', margin: '0 auto 1.5rem' }}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.08))' }}
      >
        <defs>
          <radialGradient id="nfGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="nfNumberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="200" cy="150" r="140" fill="url(#nfGlow)" />

        {/* Isometric Grid Base Platform */}
        <ellipse cx="200" cy="225" rx="150" ry="50" stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="4 4" />
        <ellipse cx="200" cy="225" rx="100" ry="32" fill="var(--bg-surface-subtle)" stroke="var(--border-color)" strokeWidth="1.5" />

        {/* Floating Dimensional 404 Typography */}
        <g id="typography-404">
          {/* '4' Left */}
          <text
            x="95"
            y="140"
            fill="url(#nfNumberGrad)"
            fontSize="82"
            fontWeight="900"
            fontFamily="var(--font-display)"
            letterSpacing="-0.04em"
          >
            4
          </text>

          {/* '0' Middle / Transformed into a Storefront Map Radar */}
          <g transform="translate(195, 110)">
            {/* Outer Ring */}
            <circle cx="0" cy="0" r="38" stroke="var(--accent)" strokeWidth="8" fill="var(--bg-card)" />
            {/* Compass / Store Marker */}
            <circle cx="0" cy="0" r="24" fill="var(--accent-subtle)" stroke="var(--border-color)" strokeWidth="1.5" />
            {/* Map Pin */}
            <path
              d="M0 -12 C-6 -12 -10 -7 -10 -1 C-10 6 0 14 0 14 C0 14 10 6 10 -1 C10 -7 6 -12 0 -12 Z"
              fill="var(--accent)"
            />
            <circle cx="0" cy="-3" r="3.5" fill="#ffffff" />
          </g>

          {/* '4' Right */}
          <text
            x="245"
            y="140"
            fill="url(#nfNumberGrad)"
            fontSize="82"
            fontWeight="900"
            fontFamily="var(--font-display)"
            letterSpacing="-0.04em"
          >
            4
          </text>
        </g>

        {/* Floating Stars and Navigation Elements */}
        <g>
          {/* Top Right Star */}
          <path
            d="M315 50 L318 57 L325 58 L320 63 L321 70 L315 66 L309 70 L310 63 L305 58 L312 57 Z"
            fill="var(--star-filled)"
          />
          {/* Top Left Star */}
          <path
            d="M85 75 L87 81 L93 82 L89 86 L90 92 L85 89 L80 92 L81 86 L77 82 L83 81 Z"
            fill="var(--accent)"
            opacity="0.8"
          />
          {/* Radar Waves */}
          <path d="M140 230 Q200 250 260 230" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M160 240 Q200 255 240 240" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        </g>
      </svg>
    </div>
  );
};

export default NotFoundIllustration;

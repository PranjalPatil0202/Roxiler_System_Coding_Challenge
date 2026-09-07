import React from 'react';

const AuthHeroIllustration = ({ mood = 'default' }) => {
  // Determine dynamic accent & theme based on mood
  const moodColors = {
    admin: {
      accent: 'var(--admin-accent)',
      accentSubtle: 'var(--admin-accent-subtle)',
      border: 'var(--admin-border)',
      glow: 'rgba(99, 102, 241, 0.25)',
      roleTag: 'PLATFORM ADMIN',
    },
    store_owner: {
      accent: 'var(--owner-accent)',
      accentSubtle: 'var(--owner-accent-subtle)',
      border: 'var(--owner-border)',
      glow: 'rgba(217, 119, 6, 0.25)',
      roleTag: 'MERCHANT PORTAL',
    },
    normal_user: {
      accent: 'var(--user-accent)',
      accentSubtle: 'var(--user-accent-subtle)',
      border: 'var(--user-border)',
      glow: 'rgba(5, 150, 105, 0.25)',
      roleTag: 'COMMUNITY DISCOVERY',
    },
    default: {
      accent: 'var(--accent)',
      accentSubtle: 'var(--accent-subtle)',
      border: 'var(--border-color)',
      glow: 'rgba(79, 70, 229, 0.25)',
      roleTag: 'VERIFIED REVIEWS',
    },
  };

  const current = moodColors[mood] || moodColors.default;

  return (
    <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto', position: 'relative' }}>
      <svg
        viewBox="0 0 560 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: 'auto',
          filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.12))',
          transition: 'all 400ms ease-out',
        }}
      >
        <defs>
          {/* Ambient Glow */}
          <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={current.accent} stopOpacity="0.28" />
            <stop offset="100%" stopColor={current.accent} stopOpacity="0" />
          </radialGradient>

          {/* Roof Linear Gradient */}
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={current.accent} />
            <stop offset="100%" stopColor="var(--text-primary)" stopOpacity="0.85" />
          </linearGradient>

          {/* Store Glass Gradient */}
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-card)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--bg-surface)" stopOpacity="0.75" />
          </linearGradient>

          {/* Floating Card Gradient */}
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--bg-card)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--bg-surface-subtle)" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        {/* Ambient Radial Background Glow */}
        <circle cx="280" cy="270" r="230" fill="url(#heroGlow)" />

        {/* Organic Floating Blobs in Background */}
        <path
          d="M50 180 C20 120 80 50 150 70 C220 90 230 170 170 210 C110 250 80 240 50 180 Z"
          fill={current.accent}
          opacity="0.12"
          style={{ filter: 'blur(16px)' }}
        />
        <path
          d="M410 70 C470 40 530 80 520 150 C510 220 450 230 400 190 C350 150 350 100 410 70 Z"
          fill={current.accent}
          opacity="0.1"
          style={{ filter: 'blur(20px)' }}
        />

        {/* Geometric Dot Grid for Depth (Right Top) */}
        <g opacity="0.45">
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3, 4, 5].map((col) => (
              <circle
                key={`dot-${row}-${col}`}
                cx={410 + col * 16}
                cy={80 + row * 16}
                r="1.8"
                fill={current.accent}
              />
            ))
          )}
        </g>

        {/* Background Geometric Grid & Orbital Rings */}
        <ellipse cx="280" cy="400" rx="220" ry="70" stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="6 6" />
        <ellipse cx="280" cy="400" rx="160" ry="50" stroke="var(--border-color)" strokeWidth="1.5" />

        {/* Floating Stars in Sky */}
        <g opacity="0.85">
          <circle cx="80" cy="110" r="3" fill={current.accent} />
          <circle cx="480" cy="90" r="4" fill="var(--star-filled)" />
          <circle cx="490" cy="210" r="2.5" fill={current.accent} />
          <circle cx="110" cy="240" r="2" fill="var(--star-filled)" />
        </g>

        {/* ========================================================
            ISOMETRIC STORE BUILDING
            ======================================================== */}
        <g id="storefront">
          {/* Building Base Platform / Pedestal */}
          <path
            d="M170 410 L280 460 L390 410 L280 360 Z"
            fill="var(--bg-card)"
            stroke="var(--border-color)"
            strokeWidth="1.5"
          />
          <path
            d="M170 410 L280 460 L280 475 L170 425 Z"
            fill="var(--bg-surface)"
            stroke="var(--border-color)"
            strokeWidth="1.5"
          />
          <path
            d="M280 460 L390 410 L390 425 L280 475 Z"
            fill="var(--bg-surface-subtle)"
            stroke="var(--border-color)"
            strokeWidth="1.5"
          />

          {/* Store Main Body (Walls) */}
          <path
            d="M185 365 L280 410 L280 230 L185 190 Z"
            fill="url(#glassGrad)"
            stroke="var(--border-color)"
            strokeWidth="2"
          />
          <path
            d="M280 410 L375 365 L375 190 L280 230 Z"
            fill="url(#glassGrad)"
            stroke="var(--border-color)"
            strokeWidth="2"
          />

          {/* Store Entrance / Glowing Glass Door */}
          <path
            d="M260 395 L280 405 L280 310 L260 300 Z"
            fill={current.accentSubtle}
            stroke={current.accent}
            strokeWidth="1.5"
          />
          <path
            d="M280 405 L300 395 L300 300 L280 310 Z"
            fill={current.accentSubtle}
            stroke={current.accent}
            strokeWidth="1.5"
          />

          {/* Store Display Windows */}
          <path
            d="M200 345 L245 366 L245 285 L200 265 Z"
            fill="var(--bg-card)"
            stroke="var(--border-color)"
            strokeWidth="1.5"
            opacity="0.85"
          />
          <path
            d="M315 366 L360 345 L360 265 L315 285 Z"
            fill="var(--bg-card)"
            stroke="var(--border-color)"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* Stylized Modern Canopy / Awning */}
          <path
            d="M170 200 L280 245 L390 200 L280 155 Z"
            fill="url(#roofGrad)"
            stroke="var(--text-primary)"
            strokeWidth="2"
          />
          <path
            d="M170 200 L280 245 L280 260 L170 215 Z"
            fill={current.accent}
            stroke="var(--border-color)"
            strokeWidth="1.5"
          />
          <path
            d="M280 245 L390 200 L390 215 L280 260 Z"
            fill={current.accent}
            stroke="var(--border-color)"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Awning Stripes */}
          <path d="M195 210 L210 216 L210 231 L195 225 Z" fill="#ffffff" opacity="0.3" />
          <path d="M235 226 L250 232 L250 247 L235 241 Z" fill="#ffffff" opacity="0.3" />
          <path d="M310 232 L325 226 L325 241 L310 247 Z" fill="#ffffff" opacity="0.3" />
          <path d="M350 216 L365 210 L365 225 L350 231 Z" fill="#ffffff" opacity="0.3" />

          {/* Store Rooftop Sign */}
          <g transform="translate(245, 115)">
            <rect x="0" y="0" width="70" height="28" rx="6" fill="var(--bg-card)" stroke={current.accent} strokeWidth="1.5" />
            <circle cx="16" cy="14" r="5" fill={current.accent} />
            <line x1="28" y1="11" x2="56" y2="11" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="18" x2="48" y2="18" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* ========================================================
            FLOATING 5-STAR RATING MEDALLION
            ======================================================== */}
        <g id="rating-medallion" transform="translate(70, 140)">
          {/* Card Surface */}
          <rect
            x="0"
            y="0"
            width="175"
            height="72"
            rx="14"
            fill="url(#cardGrad)"
            stroke="var(--border-color)"
            strokeWidth="1.5"
          />
          {/* Star Icon Badge */}
          <circle cx="34" cy="36" r="20" fill="var(--warning-bg)" stroke="var(--star-filled)" strokeWidth="1.5" />
          <path
            d="M34 26 L36.8 32 L43 32.8 L38.4 37 L39.6 43 L34 39.8 L28.4 43 L29.6 37 L25 32.8 L31.2 32 Z"
            fill="var(--star-filled)"
          />
          {/* Text Labels */}
          <text x="64" y="32" fill="var(--text-primary)" fontSize="16" fontWeight="800" fontFamily="var(--font-display)">
            4.9 <tspan fontSize="12" fill="var(--text-muted)" fontWeight="600">/ 5.0</tspan>
          </text>
          <text x="64" y="49" fill="var(--text-secondary)" fontSize="10.5" fontWeight="600" letterSpacing="0.02em">
            Verified Community
          </text>
        </g>

        {/* ========================================================
            FLOATING CUSTOMER REVIEW SPEECH CARD
            ======================================================== */}
        <g id="review-card" transform="translate(320, 260)">
          {/* Card Body */}
          <rect
            x="0"
            y="0"
            width="190"
            height="86"
            rx="14"
            fill="url(#cardGrad)"
            stroke="var(--border-color)"
            strokeWidth="1.5"
          />
          {/* User Avatar Circle */}
          <circle cx="28" cy="28" r="13" fill={current.accentSubtle} stroke={current.accent} strokeWidth="1.5" />
          <text x="28" y="32" fill={current.accent} fontSize="11" fontWeight="700" textAnchor="middle">
            JD
          </text>

          {/* Stars */}
          <g transform="translate(48, 22)">
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${i * 12 + 4} 0 L${i * 12 + 5.2} 2.5 L${i * 12 + 8} 2.8 L${i * 12 + 6} 4.7 L${i * 12 + 6.6} 7.5 L${i * 12 + 4} 6 L${i * 12 + 1.4} 7.5 L${i * 12 + 2} 4.7 L${i * 12} 2.8 L${i * 12 + 2.8} 2.5 Z`}
                fill="var(--star-filled)"
              />
            ))}
          </g>

          {/* Review Text */}
          <text x="18" y="58" fill="var(--text-primary)" fontSize="11" fontWeight="700">
            "Outstanding service & quality!"
          </text>
          <text x="18" y="73" fill="var(--text-muted)" fontSize="9.5" fontWeight="500">
            Verified Customer Rating • 2d ago
          </text>
        </g>

        {/* Dynamic Role Tag Pill */}
        <g transform="translate(225, 475)">
          <rect
            x="0"
            y="0"
            width="110"
            height="24"
            rx="12"
            fill={current.accentSubtle}
            stroke={current.accent}
            strokeWidth="1"
          />
          <text
            x="55"
            y="16"
            fill={current.accent}
            fontSize="9"
            fontWeight="800"
            letterSpacing="0.08em"
            textAnchor="middle"
          >
            {current.roleTag}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default AuthHeroIllustration;

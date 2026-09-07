import React from 'react';

const SignupReviewIllustration = () => {
  return (
    <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto', position: 'relative' }}>
      <svg
        viewBox="0 0 560 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: 'auto',
          filter: 'drop-shadow(0 20px 32px rgba(79, 70, 229, 0.12))',
        }}
      >
        <defs>
          {/* Radial Ambient Glow */}
          <radialGradient id="isoGlowRefined" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#818CF8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#EEF2FF" stopOpacity="0" />
          </radialGradient>

          {/* 3D Gold Star Gradient */}
          <linearGradient id="star3dGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Glassmorphic Badge Background */}
          <linearGradient id="glassBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.85" />
          </linearGradient>

          {/* Storefront Roof & Awning Gradient (Strict #4F46E5 Harmony) */}
          <linearGradient id="brandIndigoRoof" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>

          {/* Character Shirt (Strict #4F46E5 Harmony) */}
          <linearGradient id="brandIndigoShirt" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="280" cy="260" r="230" fill="url(#isoGlowRefined)" />

        {/* Soft Glassmorphism Blur Spheres */}
        <circle cx="90" cy="350" r="48" fill="#C7D2FE" opacity="0.4" style={{ filter: 'blur(18px)' }} />
        <circle cx="440" cy="130" r="55" fill="#E0E7FF" opacity="0.55" style={{ filter: 'blur(22px)' }} />
        <circle cx="430" cy="410" r="32" fill="#C7D2FE" opacity="0.4" style={{ filter: 'blur(16px)' }} />

        {/* Subtle Geometric Dot Grid (Top Right & Bottom Right) */}
        <g opacity="0.32">
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <circle
                key={`tr-dots-${row}-${col}`}
                cx={430 + col * 16}
                cy={60 + row * 16}
                r="2"
                fill="#4F46E5"
              />
            ))
          )}
        </g>
        <g opacity="0.32">
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <circle
                key={`br-dots-${row}-${col}`}
                cx={430 + col * 16}
                cy={390 + row * 16}
                r="2"
                fill="#4F46E5"
              />
            ))
          )}
        </g>

        {/* 3D Isometric Ground Platform */}
        <g transform="translate(140, 240)">
          {/* Platform Floor Drop Shadow */}
          <ellipse cx="140" cy="190" rx="170" ry="50" fill="#1E1B4B" opacity="0.12" />

          {/* Deep Indigo Isometric Platform Base */}
          <path
            d="M 140 100 L 300 180 L 140 260 L -20 180 Z"
            fill="#312E81"
            stroke="#4338CA"
            strokeWidth="2"
          />
          <path
            d="M -20 180 L 140 260 L 140 280 L -20 200 Z"
            fill="#1E1B4B"
          />
          <path
            d="M 140 260 L 300 180 L 300 200 L 140 280 Z"
            fill="#1E1B4B"
          />
        </g>

        {/* ==============================================================
            3D ISOMETRIC DIGITAL STOREFRONT (#4F46E5 Unified)
            ============================================================== */}
        <g transform="translate(240, 110)">
          {/* Back Building Wall */}
          <path
            d="M 50 110 L 180 40 L 180 240 L 50 310 Z"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="2"
          />

          {/* Front Building Wall */}
          <path
            d="M -80 40 L 50 110 L 50 310 L -80 240 Z"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="2"
          />

          {/* StorePulse Brand Signboard on Top of Roof */}
          <g transform="translate(-15, -15)">
            <path
              d="M -60 30 L 60 90 L 60 135 L -60 75 Z"
              fill="url(#brandIndigoRoof)"
              stroke="#3730A3"
              strokeWidth="2"
            />
            {/* StorePulse Logo text */}
            <text
              x="5"
              y="92"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="800"
              fontFamily="Inter, sans-serif"
              letterSpacing="0.04em"
              transform="rotate(27 -15 90)"
            >
              StorePulse
            </text>
          </g>

          {/* Isometric Awning (Indigo & White Stripes) */}
          <g transform="translate(0, 45)">
            <path
              d="M -80 20 L 55 90 L 65 130 L -70 60 Z"
              fill="url(#brandIndigoRoof)"
            />
            <path d="M -50 35 L -30 45 L -20 85 L -40 75 Z" fill="#EEF2FF" />
            <path d="M 0 60 L 20 70 L 30 110 L 10 100 Z" fill="#EEF2FF" />
            <path d="M 40 82 L 55 90 L 65 130 L 50 122 Z" fill="#EEF2FF" />
          </g>

          {/* Glass Window with Analytics Chart Bars */}
          <path
            d="M -55 125 L 35 170 L 35 260 L -55 215 Z"
            fill="#EEF2FF"
            stroke="#818CF8"
            strokeWidth="1.5"
          />
          <path
            d="M -45 138 L 25 174 L 25 248 L -45 212 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />

          {/* Analytics Chart bars inside window */}
          <line x1="-32" y1="190" x2="-32" y2="204" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
          <line x1="-18" y1="180" x2="-18" y2="204" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
          <line x1="-4" y1="168" x2="-4" y2="204" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
          <line x1="10" y1="158" x2="10" y2="204" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* ==============================================================
            3D STYLIZED USER CHARACTER ADDING 3D GOLD STAR
            ============================================================== */}
        <g transform="translate(195, 205)">
          {/* Head & Face */}
          <ellipse cx="56" cy="48" rx="15" ry="17" fill="#F8FAFC" stroke="#1E1B4B" strokeWidth="2.5" />
          <path
            d="M 42 45 C 42 28 58 20 70 24 C 80 28 80 40 74 46 C 66 40 54 38 46 46 Z"
            fill="#1E1B4B"
          />
          <circle cx="64" cy="46" r="2.5" fill="#1E1B4B" />

          {/* Indigo Torso / Shirt */}
          <path
            d="M 42 70 C 47 64 66 64 71 70 L 80 162 C 80 167 70 172 56 172 C 42 172 32 167 32 162 Z"
            fill="url(#brandIndigoShirt)"
          />

          {/* Pants / Legs */}
          <path d="M 42 166 L 39 252 L 53 252 L 55 170" fill="#1E1B4B" />
          <path d="M 59 170 L 61 252 L 75 252 L 72 166" fill="#1E1B4B" />
          {/* Shoes */}
          <ellipse cx="46" cy="254" rx="9" ry="4.5" fill="#4F46E5" />
          <ellipse cx="68" cy="254" rx="9" ry="4.5" fill="#4F46E5" />

          {/* Arms Reaching Upwards with Gold Star */}
          <path
            d="M 45 80 Q 66 75 86 56"
            stroke="url(#brandIndigoShirt)"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <ellipse cx="88" cy="54" rx="6" ry="5.5" fill="#F8FAFC" stroke="#1E1B4B" strokeWidth="2" />
        </g>

        {/* ==============================================================
            3D GLOWING GOLD STAR
            ============================================================== */}
        <g transform="translate(280, 210)">
          <circle cx="26" cy="26" r="42" fill="#F59E0B" opacity="0.22" style={{ filter: 'blur(10px)' }} />

          {/* 3D Depth Extrusion */}
          <polygon
            points="26,2 34,18 52,20 39,32 43,49 26,40 9,49 13,32 0,20 18,18"
            transform="translate(4, 4)"
            fill="#B45309"
          />

          {/* Star Front Face */}
          <polygon
            points="26,2 34,18 52,20 39,32 43,49 26,40 9,49 13,32 0,20 18,18"
            fill="url(#star3dGold)"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 6px 12px rgba(245, 158, 11, 0.45))' }}
          />
          <line x1="26" y1="6" x2="26" y2="38" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        </g>

        {/* ==============================================================
            FLOATING GLASSMORPHIC VERIFIED BADGES
            ============================================================== */}
        {/* Badge 1: Top Right */}
        <g transform="translate(415, 125)" style={{ filter: 'drop-shadow(0 10px 20px rgba(16, 185, 129, 0.16))' }}>
          <rect x="0" y="0" width="125" height="40" rx="12" fill="url(#glassBadgeGrad)" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="22" cy="20" r="10" fill="#10B981" />
          <path d="M18 20 L20.5 22.5 L26.5 16.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="40" y="25" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="Inter, sans-serif">
            Verified
          </text>
        </g>

        {/* Badge 2: Center Left */}
        <g transform="translate(55, 235)" style={{ filter: 'drop-shadow(0 10px 20px rgba(16, 185, 129, 0.16))' }}>
          <rect x="0" y="0" width="125" height="40" rx="12" fill="url(#glassBadgeGrad)" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="22" cy="20" r="10" fill="#10B981" />
          <path d="M18 20 L20.5 22.5 L26.5 16.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="40" y="25" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="Inter, sans-serif">
            Verified
          </text>
        </g>

        {/* Badge 3: Bottom Right */}
        <g transform="translate(400, 360)" style={{ filter: 'drop-shadow(0 10px 20px rgba(16, 185, 129, 0.16))' }}>
          <rect x="0" y="0" width="125" height="40" rx="12" fill="url(#glassBadgeGrad)" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="22" cy="20" r="10" fill="#10B981" />
          <path d="M18 20 L20.5 22.5 L26.5 16.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="40" y="25" fill="#0F172A" fontSize="13" fontWeight="800" fontFamily="Inter, sans-serif">
            Verified
          </text>
        </g>

        {/* Delivery Box Parcel on Platform */}
        <g transform="translate(250, 310)">
          <path d="M 0 15 L 25 0 L 50 15 L 25 30 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M 0 15 L 25 30 L 25 65 L 0 50 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
          <path d="M 25 30 L 50 15 L 50 50 L 25 65 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
          <line x1="12" y1="22" x2="12" y2="57" stroke="#4F46E5" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
};

export default SignupReviewIllustration;

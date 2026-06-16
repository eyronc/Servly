import React from 'react';

/**
 * Servly Logo Component
 * Used consistently across all pages for brand identity
 * @param {number} size - icon size in px (default 32)
 * @param {boolean} showText - whether to show "Servly" wordmark (default true)
 * @param {string} theme - 'light' | 'dark' (default 'light')
 */
export default function Logo({ size = 32, showText = true, theme = 'light' }) {
  const textColor = theme === 'dark' ? '#ffffff' : '#0c0c0f';
  const subtextColor = theme === 'dark' ? '#a8a8b8' : '#6b7280';

  return (
    <div className="servly-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Icon Mark */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background rounded square */}
          <rect width="40" height="40" rx="12" fill="url(#logoGradient)" />

          {/* Fork tines */}
          <line x1="14" y1="9" x2="14" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="17" y1="9" x2="17" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="20" y1="9" x2="20" y2="16" stroke="white" strokeWidth="1.8" strokeLinecap="round" />

          {/* Fork handle neck */}
          <path d="M14 16 Q14 19 17 19 Q20 19 20 16" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <line x1="17" y1="19" x2="17" y2="31" stroke="white" strokeWidth="1.8" strokeLinecap="round" />

          {/* Sparkle star top-right */}
          <g transform="translate(24, 10)">
            <path d="M4 0 L4.8 2.8 L8 4 L4.8 5.2 L4 8 L3.2 5.2 L0 4 L3.2 2.8 Z" fill="white" opacity="0.95" />
          </g>

          {/* Small sparkle dot */}
          <circle cx="28" cy="19" r="1.2" fill="white" opacity="0.6" />

          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: size * 0.55,
              color: textColor,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            Servly
          </span>
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              fontSize: size * 0.28,
              color: subtextColor,
              letterSpacing: '0.04em',
              marginTop: 2,
              textTransform: 'uppercase',
            }}
          >
            Bespoke Dining
          </span>
        </div>
      )}
    </div>
  );
}

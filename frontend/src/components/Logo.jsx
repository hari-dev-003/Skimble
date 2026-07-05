/**
 * Skimble brand logo.
 *
 * <LogoMark />  – just the gradient app-tile mark (square). Use where an icon fits.
 * <Logo />      – mark + "Skimble" wordmark, matching the app's typography.
 *
 * The mark is inline SVG (crisp at any size, independent of light/dark theme).
 * IDs are suffixed with a stable per-instance key so multiple marks on one page
 * never clash on their gradient <defs>.
 */
import { useId } from 'react';

export function LogoMark({ size = 40, className = '', rounded = true }) {
  const uid = useId().replace(/:/g, '');
  const bg = `sk-bg-${uid}`;
  const sheen = `sk-sheen-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Skimble"
      className={className}
    >
      <defs>
        <linearGradient id={bg} x1="64" y1="48" x2="448" y2="464" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id={sheen} x1="128" y1="96" x2="384" y2="384" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.20" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="512" height="512" rx={rounded ? 128 : 0} fill={`url(#${bg})`} />
      <rect x="0" y="0" width="512" height="512" rx={rounded ? 128 : 0} fill={`url(#${sheen})`} />

      <path d="M256 116 L336 200 L300 316 L256 356 L212 316 L176 200 Z" fill="#ffffff" />
      <path d="M256 200 L256 344" stroke="#1D4ED8" strokeWidth="18" strokeLinecap="round" />
      <circle cx="256" cy="232" r="16" fill="#1D4ED8" />
      <path d="M150 408 Q256 456 366 380" stroke="#ffffff" strokeWidth="28" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function Logo({
  size = 40,
  showWordmark = true,
  wordmarkClassName = 'font-display font-extrabold tracking-tight text-sk-1',
  className = '',
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} className="shrink-0" />
      {showWordmark && (
        <span
          className={wordmarkClassName}
          style={{ fontSize: Math.round(size * 0.45) }}
        >
          Skimble
        </span>
      )}
    </div>
  );
}

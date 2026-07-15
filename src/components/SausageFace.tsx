/**
 * Плоский милый маскот-сосиска (инлайн SVG). Используется на сплэше,
 * в диалогах и 2D-фолбэке — везде, где 3D ещё/уже не нужен.
 */
export function SausageFace({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {/* тень */}
      <ellipse cx="80" cy="106" rx="46" ry="8" fill="#3a2e26" opacity="0.12" />
      <g transform="rotate(-14 80 60)">
        {/* тело */}
        <rect
          x="18"
          y="38"
          width="124"
          height="52"
          rx="26"
          fill="#E1764C"
          stroke="#B85433"
          strokeWidth="4"
        />
        {/* блик */}
        <rect
          x="30"
          y="46"
          width="72"
          height="12"
          rx="6"
          fill="#F2A48B"
          opacity="0.7"
        />
        {/* глаза */}
        <circle cx="66" cy="60" r="7" fill="#3A2E26" />
        <circle cx="94" cy="60" r="7" fill="#3A2E26" />
        <circle cx="68.5" cy="57.5" r="2.4" fill="#fff" />
        <circle cx="96.5" cy="57.5" r="2.4" fill="#fff" />
        {/* румянец */}
        <circle cx="52" cy="72" r="6" fill="#F2A48B" />
        <circle cx="108" cy="72" r="6" fill="#F2A48B" />
        {/* улыбка */}
        <path
          d="M72 74 q8 8 16 0"
          stroke="#3A2E26"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

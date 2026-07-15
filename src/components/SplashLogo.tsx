const CREAM = "#fff8ec";
const SAUSAGE = "#e1764c";
const SAUSAGE_DARK = "#b85433";
const SUN = "#ffd166";
const INK = "#3a2e26";
const BLUSH = "#f2a48b";
const CLOUD = "#c9d6df";
const CLOUD_EDGE = "#8fa3b3";
const RAIN = "#2f6fb5";

/**
 * Виток сосиски: один непрерывный путь, нарисованный ПОД словом WURST.
 * Хвост выходит справа-снизу, лента проходит под словом, поднимается по
 * левому краю, ныряет в «W», аркой идёт над словом и выныривает из-за «T»
 * вверх — к голове. Жирные буквы сами прячут места входа/выхода.
 */
const SAUSAGE_PATH =
  "M 592 216 C 560 232 480 242 380 240 C 260 238 140 230 96 206 " +
  "C 64 189 52 160 60 134 C 66 112 82 94 112 86 " +
  "C 150 44 260 26 380 30 C 466 33 520 42 546 60";

/** Логотип «The Wurst Case Scenario» для сплэша (чисто декоративный) */
export function SplashLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 340"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {/* «The» — рукописный росчерк над аркой */}
      <text
        x="62"
        y="36"
        transform="rotate(-10 62 36)"
        fontFamily="'Caveat', cursive"
        fontWeight="700"
        fontSize="52"
        fill={SUN}
      >
        The
      </text>

      {/* сосиска: тёмная подложка-контур + тело (под текстом) */}
      <path
        d={SAUSAGE_PATH}
        fill="none"
        stroke={SAUSAGE_DARK}
        strokeWidth="31"
        strokeLinecap="round"
      />
      <path
        d={SAUSAGE_PATH}
        fill="none"
        stroke={SAUSAGE}
        strokeWidth="24"
        strokeLinecap="round"
      />

      {/* голова на конце витка — над правым краем слова */}
      <g transform="translate(558 50) rotate(-16)">
        <rect
          x="-21"
          y="-16"
          width="42"
          height="34"
          rx="16"
          fill={SAUSAGE}
          stroke={SAUSAGE_DARK}
          strokeWidth="4"
        />
        <circle cx="-7" cy="-3" r="4.6" fill={INK} />
        <circle cx="7" cy="-3" r="4.6" fill={INK} />
        <circle cx="-5.4" cy="-4.6" r="1.5" fill="#ffffff" />
        <circle cx="8.6" cy="-4.6" r="1.5" fill="#ffffff" />
        <circle cx="-14" cy="4" r="3.4" fill={BLUSH} />
        <circle cx="14" cy="4" r="3.4" fill={BLUSH} />
        <path
          d="M -5 5 Q 0 10 5 5"
          fill="none"
          stroke={INK}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </g>

      {/* WURST — поверх сосиски: буквы прячут входы витка */}
      <text
        x="320"
        y="190"
        textAnchor="middle"
        textLength="470"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="'Lilita One', 'Rubik', sans-serif"
        fontSize="148"
        fill={CREAM}
      >
        WURST
      </text>

      {/* CASE SCENARIO */}
      <text
        x="308"
        y="312"
        textAnchor="middle"
        textLength="440"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="'Lilita One', 'Rubik', sans-serif"
        fontSize="56"
        fill={CREAM}
      >
        CASE SCENARIO
      </text>

      {/* тучка с дождём рядом со SCENARIO */}
      <g transform="translate(596 284) scale(1.25)">
        <g className="logo-drop">
          <line
            x1="-16"
            y1="16"
            x2="-16"
            y2="24"
            stroke={RAIN}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <g className="logo-drop" style={{ animationDelay: "0.5s" }}>
          <line
            x1="2"
            y1="18"
            x2="2"
            y2="26"
            stroke={RAIN}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <g className="logo-drop" style={{ animationDelay: "1s" }}>
          <line
            x1="19"
            y1="15"
            x2="19"
            y2="23"
            stroke={RAIN}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <g stroke={CLOUD_EDGE} strokeWidth="3" fill={CLOUD}>
          <circle cx="-17" cy="1" r="13" />
          <circle cx="2" cy="-6" r="16" />
          <circle cx="20" cy="2" r="12" />
        </g>
        <rect x="-24" y="1" width="52" height="12" rx="6" fill={CLOUD} />
      </g>
    </svg>
  );
}

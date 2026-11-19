// Iconos dibujados a mano en SVG: se ven nítidos en el iPhone y toman el color del texto (currentColor).
interface IconProps {
  className?: string;
  size?: number;
}

function Svg({ className, size = 24, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Bola de Navidad con su enganche y un brillo. */
export function OrnamentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M10.6 4.2a1.6 1.6 0 0 1 2.8 0"
      />
      <rect x="9.6" y="4.6" width="4.8" height="3" rx="1" fill="currentColor" />
      <circle cx="12" cy="14.6" r="7" fill="currentColor" />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity=".7"
        d="M5.4 13.2c2.2 1.3 4.4 1.9 6.6 1.9s4.4-.6 6.6-1.9"
      />
      <ellipse
        cx="9.3"
        cy="11.6"
        rx="1.7"
        ry="1.1"
        fill="#fff"
        opacity=".55"
        transform="rotate(-35 9.3 11.6)"
      />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
      />
      <rect x="5" y="10" width="14" height="10.5" rx="3.5" fill="currentColor" />
      <circle cx="12" cy="15" r="1.6" fill="#fff" opacity=".85" />
    </Svg>
  );
}

export function BowIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        d="M12 11.2c-1.6-2.6-4.9-5.4-7.3-4.3-2 .9-2 5.1 0 6.6 2 1.4 5.1.3 7.3-2.3Zm0 0c1.6-2.6 4.9-5.4 7.3-4.3 2 .9 2 5.1 0 6.6-2 1.4-5.1.3-7.3-2.3Z"
      />
      <path
        fill="currentColor"
        d="M11 12.4 8.2 19l2.3-.6 1.5 1.8.6-6.9Zm2 0L15.8 19l-2.3-.6-1.5 1.8-.6-6.9Z"
      />
      <circle cx="12" cy="11.4" r="2" fill="currentColor" />
      <circle cx="11.4" cy="10.8" r=".6" fill="#fff" opacity=".6" />
    </Svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        d="m12 3.2 2.5 5.3 5.7.7-4.2 4 1.1 5.7L12 16.1 6.9 18.9 8 13.2l-4.2-4 5.7-.7L12 3.2Z"
      />
    </Svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        fill="currentColor"
        d="M12 2c.6 4.6 2.4 7.4 7 8-4.6.6-6.4 3.4-7 10-.6-6.6-2.4-9.4-7-10 4.6-.6 6.4-3.4 7-8Z"
      />
    </Svg>
  );
}

export function SnowflakeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <g fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
        <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
        <path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2M4.6 10.6l3.1-.5-1-3M19.4 13.4l-3.1.5 1 3M6.7 17l1-3-3.1-.5M17.3 7l-1 3 3.1.5" />
      </g>
    </Svg>
  );
}

export function GiftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="9" width="17" height="4" rx="1.5" fill="currentColor" />
      <rect x="5" y="12.5" width="14" height="8" rx="2" fill="currentColor" opacity=".8" />
      <rect x="11" y="9" width="2" height="11.5" fill="#fff" opacity=".7" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M12 9C10.5 6 7.4 5 7 6.8 6.7 8.3 9.5 9 12 9Zm0 0c1.5-3 4.6-4 5-2.2.3 1.5-2.5 2.2-5 2.2Z"
      />
    </Svg>
  );
}

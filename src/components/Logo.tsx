"use client";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 48 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kali logo"
    >
      {/* Outer circle — subtle border */}
      <circle
        cx="32"
        cy="32"
        r="30"
        stroke="#F1B24A"
        strokeWidth="1.5"
        opacity="0.3"
      />

      {/* Sprout / seed base */}
      <path
        d="M32 52 C32 52, 28 44, 28 38 C28 34, 30 32, 32 32 C34 32, 36 34, 36 38 C36 44, 32 52, 32 52Z"
        fill="#F1B24A"
        opacity="0.2"
      />

      {/* Sprout stem */}
      <line
        x1="32"
        y1="52"
        x2="32"
        y2="30"
        stroke="#F1B24A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Left leaf */}
      <path
        d="M32 36 C28 32, 22 30, 20 26 C22 28, 28 30, 32 32"
        stroke="#F1B24A"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right leaf */}
      <path
        d="M32 32 C36 28, 40 24, 44 22 C42 26, 36 30, 32 32"
        stroke="#F1B24A"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Kannada ಕ character — stylized */}
      <text
        x="32"
        y="27"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F1B24A"
        fontFamily="'Tiro Kannada', serif"
        fontSize="22"
        fontWeight="400"
      >
        ಕ
      </text>
    </svg>
  );
}

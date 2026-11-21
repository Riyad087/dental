export function ClinicLogo({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 56"
      width="44"
      height="38"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 8C12.5 8 8 13.4 8 20.5C8 29.2 13.4 39.8 17.4 47.6C18.5 49.7 21.6 49.4 22.3 47.1L25.4 36.2C26.1 33.8 29.5 33.8 30.2 36.2L33.3 47.1C34 49.4 37.1 49.7 38.2 47.6C40.1 43.9 42.3 39.2 44.1 34.4"
        stroke="#dc2626"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 8C23.2 8 25.9 10.6 27.8 11.4C29.7 10.6 32.4 8 36.6 8C42.9 8 47.5 13.3 47.5 20.4C47.5 22.7 46.9 25.3 46.1 27.8"
        stroke="#0284c7"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M14.5 27.5C15.5 33.2 17.8 39.5 19.8 44.2"
        stroke="#65a30d"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M27.8 26H49.5"
        stroke="#dc2626"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <ellipse
        cx="53.8"
        cy="24.2"
        rx="5.8"
        ry="4.1"
        transform="rotate(-18 53.8 24.2)"
        fill="#e0f2fe"
        stroke="#94a3b8"
        strokeWidth="2"
      />
    </svg>
  );
}

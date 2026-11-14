const paths = {
  bag: (
    <>
      <path d="M6 7h12l2 14H4L6 7Z" />
      <path d="M9 7V5a3 3 0 0 1 6 0v2" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  check: <path d="m5 12 4 4L19 6" />,
  home: <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" />,
  map: (
    <>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  list: <path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  locate: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  floors: <path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5" />,
  "ads-off": <path d="M9 4.2A6 6 0 0 1 18 9c0 3 .6 5 1.4 6.4M17 17H3s3-2 3-8M10.3 21a2 2 0 0 0 3.4 0M3 3l18 18" />,
  start: <circle cx="12" cy="12" r="5" />,
  // Setas de instrução: o mesmo "kind" alimenta texto e ícone (research D4).
  straight: <path d="M12 20V4M6 10l6-6 6 6" />,
  right: <path d="M7 20v-7a4 4 0 0 1 4-4h9M16 5l4 4-4 4" />,
  left: <path d="M17 20v-7a4 4 0 0 0-4-4H4M8 5 4 9l4 4" />,
  "slight-right": <path d="M8 20v-6l9-9M11 5h6v6" />,
  "slight-left": <path d="M16 20v-6L7 5M13 5H7v6" />,
  "u-turn": <path d="M8 20V9a4 4 0 0 1 8 0v8M12 13l4 4 4-4" />,
  "floor-change": <path d="M4 20h5v-5h5v-5h5V5" />,
  arrive: <path d="M5 21V4h12l-2.5 4L17 12H5" />,
  // Telas do protótipo (01–08).
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9ZM10 20a2.2 2.2 0 0 0 4 0" />,
  eye: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": <path d="M3 3l18 18M10.6 5.6A10 10 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.2 3.9M6.6 6.7A16.7 16.7 0 0 0 2 12s3.6 6.5 10 6.5a9.6 9.6 0 0 0 4.4-1M9.9 10a3 3 0 0 0 4.2 4.1" />,
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="3.5" />
      <path d="m10 13 9-9M16 7l2.5 2.5M14 9l2 2" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
  filter: <path d="M4 7h16M7 12h10M10 17h4" />,
  back: <path d="M15 5 8 12l7 7" />,
  navigate: <path d="M12 3 19.5 20 12 16l-7.5 4L12 3Z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  "trend-down": <path d="M6 6l12 12M18 9v9H9" />,
  pulse: <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />,
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />,
  refresh: <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" />,
};

export function Icon({ name, size = 24, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

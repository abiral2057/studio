export const AppLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4h16v16H4z" fill="hsl(var(--primary))" stroke="none" />
    <path d="M8 8h8v8H8z" fill="hsl(var(--background))" stroke="none" />
    <path d="M10 10h4v4h-4z" fill="hsl(var(--primary))" stroke="none" />
  </svg>
);

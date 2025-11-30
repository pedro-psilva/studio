import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
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
      <path d="M12.5 3.5A8.5 8.5 0 0 0 4 12a8.5 8.5 0 0 0 8.5 8.5h0A8.5 8.5 0 0 0 21 12a8.5 8.5 0 0 0-8.5-8.5h0Z" fill="hsl(var(--primary))" stroke="none"/>
      <path d="M12.5 3.5A8.5 8.5 0 0 0 4 12a8.5 8.5 0 0 0 8.5 8.5h7.5" fill="none" stroke="currentColor"/>
      <path d="M12.5 8.5v3a2 2 0 0 1-2 2h-0.5" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5"/>
      <path d="M12.5 11.5a2 2 0 0 0-2-2" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5"/>
    </svg>
  );
}

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
      <path d="M12 22c-2 0-4-1-5-2-1-2-2-4-2-6 0-4 2-8 5-10 2-1 4-2 6-2 2 0 4 1 5 2 1 2 2 4 2 6 0 4-2 8-5 10-1 1-3 2-5 2z" />
      <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

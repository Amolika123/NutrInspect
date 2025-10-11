import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22c-2 0-3-4.5-3-9s1-9 3-9 3 4.5 3 9-1 9-3 9Z" />
      <path d="M12 22c3.5-4 4.5-9 4.5-9" />
      <path d="M7.5 13c-3.5-4-4.5-9-4.5-9" />
    </svg>
  );
}

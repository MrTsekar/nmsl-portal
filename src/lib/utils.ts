import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTitle(segment: string) {
  // Special cases for breadcrumbs
  const specialCases: Record<string, string> = {
    "settings": "Profile",
  };
  
  if (specialCases[segment.toLowerCase()]) {
    return specialCases[segment.toLowerCase()];
  }
  
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

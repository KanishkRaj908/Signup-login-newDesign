import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about the project's custom shadow scale so `shadow-7xl` etc. merge correctly.
const twMerge = extendTailwindMerge({
  extend: { theme: { shadow: ["xs", "md", "lg", "7xl"] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

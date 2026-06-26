import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer IQD amount, e.g. 53000 -> "53,000 IQD". */
export function formatIQD(amount: number): string {
  return `${amount.toLocaleString("en-US")} IQD`;
}

/** URL-safe slug from any string. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const DELIVERY_FEE = Number(process.env.DELIVERY_FEE ?? 5000);

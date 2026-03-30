import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function that combines clsx and tailwind-merge for conditional class handling.
 *
 * @param inputs - Class values to combine (strings, objects, arrays, etc.)
 * @returns A space-separated string of combined Tailwind CSS classes
 *
 * @example
 * ```tsx
 * cn("px-2 py-1", isActive && "bg-primary", { "text-muted": !isActive })
 * ```
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

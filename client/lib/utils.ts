// lib/utils.ts

import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names conditionally
 * This function combines Tailwind classes and handles conflicts
 * @param inputs - Class names to merge
 * @returns Combined class names string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

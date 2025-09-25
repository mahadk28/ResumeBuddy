/**
 * Format a byte count as a human-readable string.
 * @param bytes - Number of bytes
 * @returns e.g. "0 Bytes", "1 Byte", "1.23 MB"
 */

import {twMerge} from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]){
  return twMerge(clsx(...inputs));

}
export function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes === 0) return '0 Bytes';
  if (bytes === 1) return '1 Byte';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / Math.pow(k, i);

  // Trim trailing zeros (e.g., 1.20 -> 1.2)
  const num = parseFloat(value.toFixed(2));
  return `${num} ${sizes[i]}`;
}


export const generateUUID = () => crypto.randomUUID()
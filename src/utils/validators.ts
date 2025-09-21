/**
 * Converts a string to a URL-friendly slug
 * @param s - The string to convert
 * @returns A slugified string
 */
export function slugifyTitle(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

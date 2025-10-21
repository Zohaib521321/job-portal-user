/**
 * Generate SEO-friendly slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
}

/**
 * Generate SEO-friendly job URL slug: "id-job-title-at-company"
 */
export function generateJobSlug(id: number, title: string, company: string): string {
  const titleSlug = slugify(title);
  const companySlug = slugify(company);
  return `${id}-${titleSlug}-at-${companySlug}`;
}

/**
 * Extract job ID from slug
 * Supports both formats:
 * - "159" (old format)
 * - "159-software-engineer-at-google" (new SEO format)
 */
export function extractJobId(slug: string): number | null {
  const match = slug.match(/^(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Build job URL path (for use with Next.js Link)
 */
export function getJobUrl(id: number, title?: string, company?: string): string {
  if (title && company) {
    // Generate SEO-friendly URL
    return `/jobs/${generateJobSlug(id, title, company)}`;
  }
  // Fallback to simple ID format
  return `/jobs/${id}`;
}


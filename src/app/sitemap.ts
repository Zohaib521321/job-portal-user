import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';
import { apiGet } from '@/lib/api';

// This function will be called at build time or on-demand
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/suggest`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/resume-builder`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Fetch jobs dynamically with proper API key authentication
  let jobPages: MetadataRoute.Sitemap = [];
  
  try {
    // Fetch all active jobs from API using apiGet (includes API key)
    const data = await apiGet<{
      success: boolean;
      data: Array<{
        id: number;
        title: string;
        company_name: string;
        posted_at: string;
      }>;
    }>('/api/jobs?status=active&limit=1000');
    
    if (data.success && Array.isArray(data.data)) {
      jobPages = data.data.map((job) => {
        // Generate SEO-friendly slug
        const slugify = (text: string) => 
          text.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        const titleSlug = slugify(job.title);
        const companySlug = slugify(job.company_name);
        const slug = `${job.id}-${titleSlug}-at-${companySlug}`;
        
        return {
          url: `${baseUrl}/jobs/${slug}`,
          lastModified: new Date(job.posted_at || Date.now()),
          changeFrequency: 'daily' as const,
          priority: 0.9,
        };
      });
    }
  } catch (error) {
    console.error('Error fetching jobs for sitemap:', error);
    // Continue with static pages even if job fetch fails
  }

  // Fetch categories dynamically with proper API key authentication
  let categoryPages: MetadataRoute.Sitemap = [];
  
  try {
    // Fetch all active categories from API using apiGet (includes API key)
    const data = await apiGet<{
      success: boolean;
      data: Array<{
        id: number;
        name: string;
        updated_at?: string;
      }>;
    }>('/api/categories?status=active');
    
    if (data.success && Array.isArray(data.data)) {
      categoryPages = data.data.map((category) => {
        // Generate SEO-friendly slug
        const slugify = (text: string) => 
          text.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        const nameSlug = slugify(category.name);
        const slug = `${category.id}-${nameSlug}`;
        
        return {
          url: `${baseUrl}/categories/${slug}`,
          lastModified: new Date(category.updated_at || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      });
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    // Continue even if category fetch fails
  }

  return [...staticPages, ...jobPages, ...categoryPages];
}


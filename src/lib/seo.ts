import { Metadata } from 'next';

// Dynamically detect base URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return window.location.origin;
  }
  // Server-side
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://jobhunt.pk';
};

export const SITE_CONFIG = {
  name: 'jobhunt.pk',
  description: 'Find the best job opportunities in Pakistan. Browse thousands of jobs from top companies across all industries and locations.',
  url: getBaseUrl(),
  ogImage: `${getBaseUrl()}/og-image.png`,
  twitterHandle: '@jobhuntpk',
  locale: 'en_US',
  type: 'website',
};

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noindex?: boolean;
  canonical?: string;
}

/**
 * Generate comprehensive metadata for Next.js pages
 */
export function generateMetadata(props: SEOProps): Metadata {
  const {
    title,
    description = SITE_CONFIG.description,
    image = SITE_CONFIG.ogImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    keywords = [],
    noindex = false,
    canonical,
  } = props;

  const pageTitle = title ? `${title} | ${SITE_CONFIG.name}` : SITE_CONFIG.name;
  const pageUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url;
  const canonicalUrl = canonical ? `${SITE_CONFIG.url}${canonical}` : pageUrl;

  return {
    title: pageTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    ...(noindex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: type as 'website' | 'article',
      locale: SITE_CONFIG.locale,
      url: pageUrl,
      siteName: SITE_CONFIG.name,
      title: pageTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || SITE_CONFIG.name,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      title: pageTitle,
      description,
      images: [image],
    },
  };
}

/**
 * Generate JobPosting structured data (JSON-LD)
 */
export function generateJobPostingSchema(job: {
  id: number;
  title: string;
  description: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range?: string;
  posted_at: string;
  slug: string;
}) {
  const datePosted = new Date(job.posted_at).toISOString();
  const validThrough = new Date(
    new Date(job.posted_at).getTime() + 90 * 24 * 60 * 60 * 1000
  ).toISOString(); // 90 days validity

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: SITE_CONFIG.name,
      value: job.id.toString(),
    },
    datePosted,
    validThrough,
    employmentType: mapJobType(job.job_type),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name,
      sameAs: SITE_CONFIG.url,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'PK',
      },
    },
    ...(job.salary_range && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'PKR',
        value: {
          '@type': 'QuantitativeValue',
          value: job.salary_range,
          unitText: 'MONTH',
        },
      },
    }),
    url: `${SITE_CONFIG.url}/jobs/${job.slug}`,
  };

  return schema;
}

/**
 * Map job type to Schema.org employment type
 */
function mapJobType(jobType: string): string {
  const typeMap: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    contract: 'CONTRACTOR',
    temporary: 'TEMPORARY',
    internship: 'INTERN',
    remote: 'FULL_TIME',
  };
  return typeMap[jobType.toLowerCase()] || 'FULL_TIME';
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo_light.png`,
    description: SITE_CONFIG.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${SITE_CONFIG.url}/contact`,
    },
    sameAs: [
      // Add your social media URLs here
      'https://facebook.com/jobhuntpk',
      'https://twitter.com/jobhuntpk',
      'https://linkedin.com/company/jobhuntpk',
    ],
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Truncate text for meta descriptions (155 chars optimal)
 */
export function truncateDescription(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
}

/**
 * Generate keywords from job data
 */
export function generateJobKeywords(job: {
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  category_name?: string;
}): string[] {
  const keywords = [
    job.title,
    `${job.title} jobs`,
    `${job.title} in ${job.location}`,
    `jobs in ${job.location}`,
    `${job.company_name} jobs`,
    job.job_type,
    `${job.job_type} jobs`,
    'jobs in Pakistan',
    'Pakistan jobs',
    'career opportunities',
  ];

  if (job.category_name) {
    keywords.push(job.category_name, `${job.category_name} jobs`);
  }

  return keywords;
}


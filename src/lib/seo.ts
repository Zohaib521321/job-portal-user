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
 * Parse salary information from various formats
 */
export function parseSalary(salaryRange?: string): {
  minValue?: number;
  maxValue?: number;
  currency: string;
  unitText: string;
} | null {
  if (!salaryRange) return null;

  const salary = salaryRange.toLowerCase().trim();
  
  // Extract currency
  const currency = salary.includes('pkr') || salary.includes('rs') || salary.includes('rupees') ? 'PKR' : 'PKR';
  
  // Extract numbers from various formats
  const numberRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)/g;
  const numbers = salary.match(numberRegex);
  
  if (!numbers || numbers.length === 0) return null;
  
  // Convert to numbers (remove commas)
  const numericValues = numbers.map(num => parseFloat(num.replace(/,/g, '')));
  
  // Handle different formats
  let minValue: number | undefined;
  let maxValue: number | undefined;
  
  if (numericValues.length === 1) {
    // Single value: "40k", "PKR 40,000"
    minValue = numericValues[0];
  } else if (numericValues.length === 2) {
    // Range: "40k-50k", "40,000 - 50,000"
    minValue = Math.min(...numericValues);
    maxValue = Math.max(...numericValues);
  } else {
    // Multiple values, take first two
    minValue = Math.min(numericValues[0], numericValues[1]);
    maxValue = Math.max(numericValues[0], numericValues[1]);
  }
  
  // Convert K notation to full numbers
  if (salary.includes('k') && minValue && minValue < 1000) {
    minValue = minValue * 1000;
  }
  if (salary.includes('k') && maxValue && maxValue < 1000) {
    maxValue = maxValue * 1000;
  }
  
  return {
    minValue,
    maxValue,
    currency,
    unitText: 'MONTH'
  };
}

/**
 * Parse location information to extract address components
 */
export function parseLocation(location: string): {
  addressLocality: string;
  addressRegion?: string;
  addressCountry: string;
  postalCode?: string;
  streetAddress?: string;
} {
  if (!location) {
    return {
      addressLocality: 'Pakistan',
      addressCountry: 'PK'
    };
  }

  const loc = location.trim();
  
  // Common Pakistani cities and their regions
  const cityRegionMap: Record<string, string> = {
    // Major cities
    'karachi': 'Sindh',
    'lahore': 'Punjab',
    'islamabad': 'Islamabad Capital Territory',
    'rawalpindi': 'Punjab',
    'faisalabad': 'Punjab',
    'multan': 'Punjab',
    'peshawar': 'Khyber Pakhtunkhwa',
    'quetta': 'Balochistan',
    'hyderabad': 'Sindh',
    'sukkur': 'Sindh',
    'larkana': 'Sindh',
    'nawabshah': 'Sindh',
    'mardan': 'Khyber Pakhtunkhwa',
    'swat': 'Khyber Pakhtunkhwa',
    
    // Punjab cities
    'sialkot': 'Punjab',
    'gujranwala': 'Punjab',
    'sargodha': 'Punjab',
    'jhelum': 'Punjab',
    'sahiwal': 'Punjab',
    'bahawalpur': 'Punjab',
    'gujrat': 'Punjab',
    'kasur': 'Punjab',
    'rahim yar khan': 'Punjab',
    'chakwal': 'Punjab',
    'sheikhupura': 'Punjab',
    'jhang': 'Punjab',
    'daska': 'Punjab',
    'pakpattan': 'Punjab',
    'okara': 'Punjab',
    'burewala': 'Punjab',
    'vehari': 'Punjab',
    'attock': 'Punjab',
    'kot addu': 'Punjab',
    'khanpur': 'Punjab',
    'hasan abdal': 'Punjab',
    'kamoke': 'Punjab',
    'gojra': 'Punjab',
    'muridke': 'Punjab',
    'bahawalnagar': 'Punjab',
    'chishtian': 'Punjab',
    'bhalwal': 'Punjab',
    'kot mithan': 'Punjab',
    'mamoori': 'Punjab',
    'ahmadpur east': 'Punjab',
    'kamar mashani': 'Punjab',
    'chunian': 'Punjab',
    'kot samaba': 'Punjab',
    'dipalpur': 'Punjab',
    'pindi bhattian': 'Punjab',
    'bhawana': 'Punjab',
    'kot radha kishan': 'Punjab',
    'renala khurd': 'Punjab',
    'kot ishaq': 'Punjab',
    'dunga bunga': 'Punjab',
    'dullewala': 'Punjab',
    'chak jhumra': 'Punjab',
    'kot ghulam muhammad': 'Punjab',
    'kanganpur': 'Punjab',
    'khanewal': 'Punjab',
    'jauharabad': 'Punjab',
    'pattoki': 'Punjab',
    'lodhran': 'Punjab',
    'bhakkar': 'Punjab',
    'arifwala': 'Punjab',
    'gujar khan': 'Punjab',
    'qila didar singh': 'Punjab',
    'kot mumin': 'Punjab',
    'hasilpur': 'Punjab',
    'kharian': 'Punjab',
    'ahmadnagar': 'Punjab',
    'jaranwala': 'Punjab',
    
    // Sindh cities
    'gambat': 'Sindh',
    'naushahro firoz': 'Sindh',
    'shikarpur': 'Sindh',
    'tando adam': 'Sindh',
    'kandhkot': 'Sindh',
    'moro': 'Sindh',
    'mirpur khas': 'Sindh',
    'sanghar': 'Sindh',
    'tando allahyar': 'Sindh',
    'badin': 'Sindh',
    'thatta': 'Sindh',
    'matli': 'Sindh',
    'tando muhammad khan': 'Sindh',
    'ubauro': 'Sindh',
    'shahdadpur': 'Sindh',
    'hala': 'Sindh',
    'kotri': 'Sindh',
    'mirpur bathoro': 'Sindh',
    'tando jam': 'Sindh',
    'digri': 'Sindh',
    'khipro': 'Sindh',
    'sakrand': 'Sindh',
    'sujawal': 'Sindh',
    'shahdadkot': 'Sindh'
  };

  // Try to find city and region
  const lowerLoc = loc.toLowerCase();
  let addressRegion: string | undefined;
  let addressLocality = loc;
  
  // Check for exact matches first
  for (const [city, region] of Object.entries(cityRegionMap)) {
    if (lowerLoc.includes(city)) {
      addressRegion = region;
      addressLocality = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }
  
  // If no region found, try to extract from common patterns
  if (!addressRegion) {
    if (lowerLoc.includes('punjab') || lowerLoc.includes('lahore') || lowerLoc.includes('karachi')) {
      addressRegion = 'Punjab';
    } else if (lowerLoc.includes('sindh') || lowerLoc.includes('karachi') || lowerLoc.includes('hyderabad')) {
      addressRegion = 'Sindh';
    } else if (lowerLoc.includes('kpk') || lowerLoc.includes('peshawar') || lowerLoc.includes('mardan')) {
      addressRegion = 'Khyber Pakhtunkhwa';
    } else if (lowerLoc.includes('balochistan') || lowerLoc.includes('quetta')) {
      addressRegion = 'Balochistan';
    } else if (lowerLoc.includes('islamabad')) {
      addressRegion = 'Islamabad Capital Territory';
    }
  }

  return {
    addressLocality: addressLocality,
    addressRegion,
    addressCountry: 'PK',
    // For Pakistani addresses, we typically don't have postal codes in job listings
    // but we can try to extract if present
    postalCode: extractPostalCode(loc),
    // Street address is rarely provided in job listings
    streetAddress: extractStreetAddress(loc)
  };
}

/**
 * Extract postal code from location string
 */
function extractPostalCode(location: string): string | undefined {
  // Pakistani postal codes are 5 digits
  const postalCodeMatch = location.match(/\b\d{5}\b/);
  return postalCodeMatch ? postalCodeMatch[0] : undefined;
}

/**
 * Extract street address from location string
 */
function extractStreetAddress(location: string): string | undefined {
  // Look for common address patterns
  const addressPatterns = [
    /\d+\s+[a-zA-Z\s]+(?:street|st|road|rd|avenue|ave|boulevard|blvd|lane|ln|drive|dr)/i,
    /[a-zA-Z\s]+(?:street|st|road|rd|avenue|ave|boulevard|blvd|lane|ln|drive|dr)\s+\d+/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = location.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  
  return undefined;
}

/**
 * Generate JobPosting structured data (JSON-LD) with complete address and salary information
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

  // Parse location for complete address
  const addressInfo = parseLocation(job.location);
  
  // Parse salary information
  const salaryInfo = parseSalary(job.salary_range);

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
        addressLocality: addressInfo.addressLocality,
        addressCountry: addressInfo.addressCountry,
        ...(addressInfo.addressRegion && { addressRegion: addressInfo.addressRegion }),
        ...(addressInfo.postalCode && { postalCode: addressInfo.postalCode }),
        ...(addressInfo.streetAddress && { streetAddress: addressInfo.streetAddress }),
      },
    },
    ...(salaryInfo && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: salaryInfo.currency,
        value: {
          '@type': 'QuantitativeValue',
          ...(salaryInfo.minValue && { minValue: salaryInfo.minValue }),
          ...(salaryInfo.maxValue && { maxValue: salaryInfo.maxValue }),
          ...(salaryInfo.minValue && !salaryInfo.maxValue && { value: salaryInfo.minValue }),
          unitText: salaryInfo.unitText,
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


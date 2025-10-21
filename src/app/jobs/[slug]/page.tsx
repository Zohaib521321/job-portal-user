'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

import { apiGet } from '@/lib/api';
import { extractJobId, generateJobSlug } from '@/lib/slugify';
import { 
  SITE_CONFIG, 
  generateJobPostingSchema, 
  generateBreadcrumbSchema,
  truncateDescription,
  generateJobKeywords 
} from '@/lib/seo';

const SITE_URL = 'https://jobhunt.pk';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  company_name: string;
  job_type: string;
  salary_range: string;
  status: string;
  posted_at: string;
  category_name?: string;
  contact_email?: string;
  whatsapp?: string;
  apply_link?: string;
  total_clicks: number;
}

interface JobApiResponse {
  success: boolean;
  data: Job;
  error?: {
    message?: string;
  };
}

export default function JobDetails() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Helper function to update meta tags
  const updateMetaTag = (attribute: string, attributeValue: string, content: string) => {
    if (typeof document === 'undefined') return;
    
    let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, attributeValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Helper function to update link tags
  const updateLinkTag = (rel: string, href: string) => {
    if (typeof document === 'undefined') return;
    
    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  };

  // Helper function to add JSON-LD structured data
  const addStructuredData = (id: string, data: any) => {
    if (typeof document === 'undefined') return;
    
    let script = document.getElementById(id) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  };

  // Update SEO metadata when job is loaded
  useEffect(() => {
    if (job) {
      const seoSlug = generateJobSlug(job.id, job.title, job.company_name);
      const pageTitle = `${job.title} at ${job.company_name} - ${job.location} | ${SITE_CONFIG.name}`;
      const description = truncateDescription(job.description);
      const keywords = generateJobKeywords(job);
      const pageUrl = `${SITE_URL}/jobs/${seoSlug}`;

      // Update document title
      document.title = pageTitle;

      // Update or create meta tags
      updateMetaTag('name', 'description', description);
      updateMetaTag('name', 'keywords', keywords.join(', '));
      
      // Open Graph tags
      updateMetaTag('property', 'og:title', pageTitle);
      updateMetaTag('property', 'og:description', description);
      updateMetaTag('property', 'og:url', pageUrl);
      updateMetaTag('property', 'og:type', 'article');
      updateMetaTag('property', 'og:site_name', SITE_CONFIG.name);
      updateMetaTag('property', 'article:published_time', new Date(job.posted_at).toISOString());
      
      // Twitter Card tags
      updateMetaTag('name', 'twitter:card', 'summary_large_image');
      updateMetaTag('name', 'twitter:title', pageTitle);
      updateMetaTag('name', 'twitter:description', description);
      
      // Canonical URL
      updateLinkTag('canonical', pageUrl);

      // Add JSON-LD structured data
      addStructuredData('job-posting-schema', generateJobPostingSchema({
        ...job,
        slug: seoSlug
      }));
      
      addStructuredData('breadcrumb-schema', generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Jobs', url: '/' },
        { name: job.title, url: `/jobs/${seoSlug}` }
      ]));
    }
  }, [job]);

  useEffect(() => {
    if (params.slug) {
      const slug = params.slug as string;
      const jobId = extractJobId(slug);
      
      if (jobId) {
        fetchJob(jobId.toString());
      } else {
        setError('Invalid job URL');
        setIsLoading(false);
      }
    }
  }, [params.slug]);

  const fetchJob = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await apiGet<JobApiResponse>(`/api/jobs/${id}`);

      if (data.success) {
        setJob(data.data);
        
        // Redirect to SEO-friendly URL if accessing via numeric ID only
        const currentSlug = params.slug as string;
        const jobId = extractJobId(currentSlug);
        const seoSlug = generateJobSlug(data.data.id, data.data.title, data.data.company_name);
        
        // If the current slug is just the ID (no title), redirect to SEO-friendly URL
        if (jobId && currentSlug === jobId.toString()) {
          router.replace(`/jobs/${seoSlug}`, { scroll: false });
        }
      } else {
        setError('Job not found');
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-4">Loading job details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-error text-lg mb-4">{error || 'Job not found'}</p>
            <Link
              href="/"
              className="inline-block bg-primary text-background px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Jobs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const postedDate = new Date(job.posted_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate SEO-friendly URL for sharing
  const seoSlug = generateJobSlug(job.id, job.title, job.company_name);
  const jobUrl = `${SITE_URL}/jobs/${seoSlug}`;
  const jobTitle = `${job.title} at ${job.company_name}`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(jobUrl);
    const encodedTitle = encodeURIComponent(jobTitle);
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=Check out this job opportunity: ${encodedUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(jobUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Generate application email with template
  const generateApplicationEmail = () => {
    if (!job.contact_email) return '#';
    
    const subject = `Application for ${job.title} – [Your Name]`;
    
    const body = `Dear Hiring Manager,

I hope you are doing well. I am writing to express my interest in the ${job.title} position at ${job.company_name}. I have attached my resume for your review.

With my background in [your field or skills], I believe I can contribute effectively to your team. I would be glad to discuss how my experience aligns with your company's goals.

Thank you for your time and consideration.

Looking forward to your response.

Best regards,
[Your Full Name]
[Your Phone Number]
[Your LinkedIn profile link] (optional)`;

    return `mailto:${job.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Generate WhatsApp message with template
  const generateWhatsAppMessage = () => {
    if (!job.whatsapp) return '#';
    
    const message = `*Application for ${job.title} – [Your Name]*

Dear Hiring Manager,

I hope you are doing well. I am writing to express my interest in the *${job.title}* position at *${job.company_name}*.

With my background in [your field or skills], I believe I can contribute effectively to your team. I would be glad to discuss how my experience aligns with your company's goals.

Thank you for your time and consideration.

Looking forward to your response.

Best regards,
_[Your Full Name]_
_[Your Phone Number]_
_[Your LinkedIn profile link]_ (optional)`;

    const phoneNumber = job.whatsapp.replace(/[^0-9]/g, '');
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center text-primary hover:text-primary-dark mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>

        {/* Job Header Card */}
        <div className="bg-surface rounded-lg p-8 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {job.category_name && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {job.category_name}
                  </span>
                )}
                <span className="px-3 py-1 bg-accent text-text-secondary rounded-full text-sm capitalize">
                  {job.job_type}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-foreground mb-3">{job.title}</h1>
              <p className="text-xl text-primary font-semibold mb-4">{job.company_name}</p>
              
              <div className="flex flex-wrap gap-6 text-text-secondary">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Posted {postedDate}</span>
                </div>
              </div>
            </div>

            {job.salary_range && (
              <div className="lg:text-right">
                <p className="text-text-secondary text-sm mb-1">Salary Range</p>
                <p className="text-3xl font-bold text-primary">{job.salary_range}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-surface rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Job Description
              </h2>
              <div className="text-text-secondary leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Contact Information */}
            {(job.contact_email || job.whatsapp) && (
              <div className="bg-surface rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h2>
                <div className="space-y-4">
                  {job.contact_email && (
                    <a 
                      href={generateApplicationEmail()}
                      className="flex items-center gap-3 p-4 bg-accent hover:bg-primary/10 rounded-lg transition-all group"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-text-secondary">Apply via Email</p>
                        <p className="text-primary font-medium">{job.contact_email}</p>
                        <p className="text-xs text-text-secondary mt-1">📝 Template included</p>
                      </div>
                    </a>
                  )}
                  {job.whatsapp && (
                    <a 
                      href={generateWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-accent hover:bg-success/10 rounded-lg transition-all group"
                    >
                      <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center group-hover:bg-success/20 transition-colors">
                        <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-text-secondary">Apply via WhatsApp</p>
                        <p className="text-success font-medium">{job.whatsapp}</p>
                        <p className="text-xs text-text-secondary mt-1">📝 Template included</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Share Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-lg p-6 shadow-lg sticky top-8">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share this Job
              </h3>
              
              <div className="space-y-3">
                {/* WhatsApp */}
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="w-full flex items-center gap-3 p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-foreground rounded-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-[#25D366] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span className="font-medium">Share on WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-3 p-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-foreground rounded-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="font-medium">Share on Facebook</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-3 p-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-foreground rounded-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-[#1DA1F2] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </div>
                  <span className="font-medium">Share on Twitter</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-full flex items-center gap-3 p-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-foreground rounded-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <span className="font-medium">Share on LinkedIn</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => handleShare('telegram')}
                  className="w-full flex items-center gap-3 p-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-foreground rounded-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-[#0088cc] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <span className="font-medium">Share on Telegram</span>
                </button>

                {/* Email */}
                <button
                  onClick={() => handleShare('email')}
                  className="w-full flex items-center gap-3 p-3 bg-accent hover:bg-primary/10 text-foreground rounded-lg transition-all group"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">Share via Email</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-3 bg-accent hover:bg-primary/10 text-foreground rounded-lg transition-all group relative"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-medium">{copySuccess ? 'Link Copied!' : 'Copy Link'}</span>
                  {copySuccess && (
                    <svg className="w-5 h-5 text-success ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

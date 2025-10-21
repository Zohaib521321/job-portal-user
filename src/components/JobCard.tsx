'use client';

import Link from 'next/link';
import { getJobUrl } from '@/lib/slugify';

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  priority?: string;
}

export default function JobCard({ id, title, company, location, type, salary, description, priority }: JobCardProps) {
  return (
    <div className="bg-surface rounded-lg p-6 hover:border hover:border-primary transition-all duration-200 shadow-lg hover:shadow-xl">
      {/* Badges Row - Featured & Job Type */}
      <div className="flex items-center gap-2 mb-3">
        {priority === 'high' && (
          <span className="px-2.5 py-1 bg-error/10 text-error text-xs font-semibold rounded-md border border-error/20">
            ⭐ Featured
          </span>
        )}
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20 capitalize">
          {type}
        </span>
        <div className="flex-1"></div>
      </div>

      {/* Job Title */}
      <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
        {title}
      </h3>
      
      {/* Company Name */}
      <p className="text-primary font-semibold mb-3">{company}</p>
      
      <div className="flex items-center gap-4 text-text-secondary text-sm mb-4">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{location}</span>
        </div>
        {salary && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{salary}</span>
          </div>
        )}
      </div>
      
      <p className="text-text-secondary text-sm mb-4 line-clamp-2">{description}</p>
      
      <Link 
        href={getJobUrl(parseInt(id), title, company)}
        className="inline-block bg-primary text-background font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-all duration-200"
      >
        Apply Now
      </Link>
    </div>
  );
}


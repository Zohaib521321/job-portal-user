'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import JobCard from '@/components/JobCard';
import Link from 'next/link';

import { apiGet } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  job_count: number;
}

interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
}

interface CategoryApiResponse {
  success: boolean;
  data: Category;
  error?: {
    message?: string;
  };
}

interface JobsApiResponse {
  success: boolean;
  data: Job[];
  pagination: {
    totalPages: number;
  };
}

export default function CategoryJobs() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const limit = 9;

  useEffect(() => {
    if (params.id) {
      fetchCategory();
      fetchCategoryJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, currentPage]);

  const fetchCategory = async () => {
    try {
      const data = await apiGet<CategoryApiResponse>(`/api/categories/${params.id}`);

      if (data.success) {
        setCategory(data.data);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load category');
    }
  };

  const fetchCategoryJobs = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet<JobsApiResponse>(
        `/api/jobs?category_id=${params.id}&status=active&page=${currentPage}&limit=${limit}`
      );

      if (data.success) {
        setJobs(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-error text-lg mb-4">{error}</p>
            <Link
              href="/categories"
              className="inline-block bg-primary text-background px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Categories
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading && !category) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-4">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/categories"
          className="inline-flex items-center text-primary hover:text-primary-dark mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Categories
        </Link>

        {/* Category Header */}
        {category && (
          <div className="bg-surface rounded-lg p-8 mb-8 shadow-lg border border-accent">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-4xl">
                {category.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{category.name}</h1>
                <p className="text-text-secondary">{category.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-text-secondary mt-4">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-foreground font-semibold">{category.job_count}</span>
              <span>open positions</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-4">Loading jobs...</p>
          </div>
        ) : (
          <>
            {/* Job Listings */}
            {jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      id={job.id.toString()}
                      title={job.title}
                      company={job.company_name}
                      location={job.location || 'Not specified'}
                      type={job.job_type || 'Full-time'}
                      salary={job.salary_range}
                      description={job.description}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-surface text-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-primary text-background'
                              : 'bg-surface text-foreground hover:bg-accent'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-surface text-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-surface rounded-lg">
                <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-text-secondary text-lg">No jobs found in this category yet</p>
                <p className="text-text-secondary text-sm mt-2">Check back later for new opportunities!</p>
                <Link
                  href="/"
                  className="inline-block mt-4 bg-primary text-background px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Browse All Jobs
                </Link>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}


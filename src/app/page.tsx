'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import Footer from '@/components/Footer';
import { apiGet } from '@/lib/api';

interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_range: string;
  description: string;
  category_name?: string;
  priority?: string;
}

interface JobsApiResponse {
  success: boolean;
  data: Job[];
  pagination: {
    totalPages: number;
  };
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedType, setSelectedType] = useState('all');
  const limit = 9; // Jobs per page

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedType]);

  // Auto-fetch when search term is cleared
  useEffect(() => {
    if (searchTerm === '') {
      setCurrentPage(1);
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        status: 'active',
      });

      if (selectedType && selectedType !== 'all') {
        params.append('job_type', selectedType);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const data = await apiGet<JobsApiResponse>(`/api/jobs?${params}`);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchJobs();
  };

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 px-2">
             
              <>Find Your <span className="text-primary">Dream Job</span></>
            
          </h1>
          <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto px-2">
            {'Browse thousands of job opportunities from top companies around the world'}
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by job title, company, or location..."
                className="w-full bg-surface text-foreground border border-accent rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-primary transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              type="submit"
              className="bg-primary text-background font-semibold px-8 py-3 rounded-lg hover:bg-primary-dark transition-all duration-200 whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex gap-2 sm:gap-4 mb-8 flex-wrap">
          <button 
            onClick={() => handleTypeFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
              selectedType === 'all' 
                ? 'bg-primary text-background' 
                : 'bg-surface text-text-secondary hover:bg-accent hover:text-foreground'
            }`}
          >
            All Jobs
          </button>
          <button 
            onClick={() => handleTypeFilter('full-time')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
              selectedType === 'full-time' 
                ? 'bg-primary text-background' 
                : 'bg-surface text-text-secondary hover:bg-accent hover:text-foreground'
            }`}
          >
            Full-time
          </button>
          <button 
            onClick={() => handleTypeFilter('contract')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
              selectedType === 'contract' 
                ? 'bg-primary text-background' 
                : 'bg-surface text-text-secondary hover:bg-accent hover:text-foreground'
            }`}
          >
            Contract
          </button>
          <button 
            onClick={() => handleTypeFilter('remote')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
              selectedType === 'remote' 
                ? 'bg-primary text-background' 
                : 'bg-surface text-text-secondary hover:bg-accent hover:text-foreground'
            }`}
          >
            Remote
          </button>
          <button 
            onClick={() => handleTypeFilter('internship')}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
              selectedType === 'internship' 
                ? 'bg-primary text-background' 
                : 'bg-surface text-text-secondary hover:bg-accent hover:text-foreground'
            }`}
          >
            Internship
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-4">Loading jobs...</p>
          </div>
        ) : (
          <>
            {/* Job Listings */}
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
                  priority={job.priority}
                />
              ))}
            </div>

            {/* No Results */}
            {jobs.length === 0 && (
              <div className="text-center py-12 bg-surface rounded-lg">
                <p className="text-text-secondary text-lg">No jobs found</p>
                <p className="text-text-secondary text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2 bg-surface text-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
                >
                  Previous
                </button>

                <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
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
                  className="px-3 sm:px-4 py-2 bg-surface text-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

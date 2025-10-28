'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// Types
interface SafetyAlert {
  id: number;
  title: string;
  slug: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

type PaginatedResponse<T> = ApiResponse<{
  alerts: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'test123456789';

export default function SafetyAlertsPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Fetch safety alerts
  const fetchAlerts = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      const response = await fetch(`${API_BASE_URL}/api/safety-alerts/public?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaginatedResponse<SafetyAlert> = await response.json();

      if (data.success) {
        setAlerts(data.data.alerts);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch safety alerts');
    } finally {
      setIsLoading(false);
    }
  }, [token, currentPage]);

  // Fetch alerts when user and token are available
  useEffect(() => {
    if (user && token) {
      fetchAlerts();
    }
  }, [user, token, fetchAlerts]);

  // Priority badge styling
  const getPriorityBadge = (priority: string) => {
    const styles = {
      urgent: 'bg-error/10 text-error border-error/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-success/10 text-success border-success/20'
    };
    
    return styles[priority as keyof typeof styles] || styles.medium;
  };

  // Priority icon
  const getPriorityIcon = (priority: string) => {
    const icons = {
      urgent: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️'
    };
    
    return icons[priority as keyof typeof icons] || '⚡';
  };

  // Loading state
  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-foreground">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🛡️</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Job Seeker Safety Alerts
              </h1>
              <p className="text-text-secondary text-lg">
                Stay protected from job scams and unsafe interview practices
              </p>
              <p className="text-sm text-text-secondary mt-2">
                Welcome back, {user.full_name}!
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-error/10 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-error font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-text-secondary">Loading safety alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              /* No Alerts State */
              <div className="bg-surface border border-accent rounded-lg p-12 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🛡️</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No Safety Alerts</h3>
                <p className="text-text-secondary text-lg mb-6">
                  There are currently no safety alerts to display. Check back later for important job seeker safety updates.
                </p>
              </div>
            ) : (
              /* Safety Alerts List */
              <div className="space-y-6">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-surface border border-accent rounded-lg p-6 hover:border-primary/50 transition-all"
                  >
                    {/* Alert Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{getPriorityIcon(alert.priority)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-bold text-foreground mb-2">
                            {alert.title}
                          </h2>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(alert.priority)}`}>
                              {alert.priority.toUpperCase()} PRIORITY
                            </span>
                            <span className="text-text-secondary text-sm">
                              {new Date(alert.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alert Content */}
                    <div className="pl-16">
                      <div className="prose prose-sm max-w-none">
                        <div 
                          className="text-foreground leading-relaxed whitespace-pre-wrap"
                          style={{ wordBreak: 'break-word' }}
                        >
                          {alert.description}
                        </div>
                      </div>
                    </div>

                    {/* Alert Footer */}
                    <div className="pl-16 mt-4 pt-4 border-t border-accent">
                      <p className="text-text-secondary text-xs">
                        Last updated: {new Date(alert.updated_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-surface border border-accent rounded-lg text-foreground hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                              currentPage === page
                                ? 'bg-primary text-background font-semibold'
                                : 'bg-surface border border-accent text-foreground hover:bg-accent/20'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-surface border border-accent rounded-lg text-foreground hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="mt-12 bg-primary/5 border border-primary/20 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">About Job Seeker Safety Alerts</h3>
                  <p className="text-text-secondary leading-relaxed">
                    Job seeker safety alerts warn you about employment scams, fake job postings, 
                    unsafe interview practices, and fraudulent employers. We recommend reviewing all alerts 
                    to stay protected while job searching. These alerts help you identify red flags, 
                    avoid scams, and practice safe job hunting habits.
                  </p>
                </div>
              </div>
            </div>

            {/* Report Safety Alert CTA */}
            <div className="mt-6 bg-surface border border-accent rounded-lg p-6 hover:border-primary/50 transition-all">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Know a Job Scam or Safety Issue?
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      Help protect the community! If you&apos;ve encountered a job scam, fraudulent employer, 
                      or unsafe interview practice, contact us to report it. Your report could help others 
                      stay safe.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/contact')}
                  className="bg-primary hover:bg-primary-dark text-background font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </button>
              </div>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-12">
              <button
                onClick={() => router.push('/')}
                className="text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

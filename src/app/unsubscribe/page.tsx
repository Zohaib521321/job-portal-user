'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiPost } from '@/lib/api';

export default function Unsubscribe() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [hasUnsubscribed, setHasUnsubscribed] = useState(false);

  const token = searchParams?.get('token');

  useEffect(() => {
    // If token is provided in URL, auto-unsubscribe
    if (token) {
      handleUnsubscribeWithToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleUnsubscribeWithToken = async () => {
    if (!token) return;

    setIsLoading(true);
    setMessage('');

    try {
      const response = await apiPost<{ success: boolean; message?: string; error?: { message?: string } }>(
        '/api/job-alerts/unsubscribe',
        { token }
      );

      if (response.success) {
        setMessage(response.message || 'Successfully unsubscribed from job alerts.');
        setMessageType('success');
        setHasUnsubscribed(true);
      } else {
        setMessage(response.error?.message || 'Failed to unsubscribe. Please try again.');
        setMessageType('error');
      }
    } catch (err: unknown) {
      console.error('Unsubscribe error:', err);
      const error = err as { error?: { message?: string } };
      setMessage(error.error?.message || 'An error occurred. Please try manually with your email.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribeWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await apiPost<{ success: boolean; message?: string; error?: { message?: string } }>(
        '/api/job-alerts/unsubscribe',
        { email: email.toLowerCase().trim() }
      );

      if (response.success) {
        setMessage(response.message || 'Successfully unsubscribed from all job alerts.');
        setMessageType('success');
        setEmail('');
        setHasUnsubscribed(true);
      } else {
        setMessage(response.error?.message || 'Failed to unsubscribe. Please try again.');
        setMessageType('error');
      }
    } catch (err: unknown) {
      console.error('Unsubscribe error:', err);
      const error = err as { error?: { message?: string } };
      setMessage(error.error?.message || 'An error occurred. Please try again later.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Unsubscribe from Job Alerts</h1>
            <p className="text-text-secondary">
              We're sorry to see you go! You can unsubscribe from job alert emails below.
            </p>
          </div>

          {/* Auto-unsubscribe loading state */}
          {isLoading && token && !hasUnsubscribed && (
            <div className="bg-surface rounded-lg p-8 text-center border border-accent">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-foreground">Unsubscribing...</p>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              messageType === 'success' 
                ? 'bg-success/10 text-success border-success/30' 
                : messageType === 'error'
                ? 'bg-error/10 text-error border-error/30'
                : 'bg-primary/10 text-foreground border-primary/30'
            }`}>
              <div className="flex items-start gap-3">
                {messageType === 'success' ? (
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : messageType === 'error' ? (
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p>{message}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {hasUnsubscribed ? (
            <div className="bg-surface rounded-lg p-8 text-center border border-accent">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">You've Been Unsubscribed</h2>
              <p className="text-text-secondary mb-6">
                You will no longer receive job alert emails from us.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/categories"
                  className="inline-block bg-primary text-background font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Browse Categories
                </Link>
                <Link
                  href="/"
                  className="inline-block bg-surface text-foreground font-semibold px-6 py-3 rounded-lg hover:bg-accent transition-colors border border-accent"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          ) : !token && (
            /* Manual Unsubscribe Form */
            <div className="bg-surface rounded-lg p-8 border border-accent">
              <h2 className="text-xl font-semibold text-foreground mb-4">Unsubscribe with Email</h2>
              <p className="text-text-secondary mb-6">
                Enter the email address you used to subscribe to job alerts:
              </p>
              
              <form onSubmit={handleUnsubscribeWithEmail} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-background text-foreground border border-accent rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-error text-white font-semibold px-6 py-3 rounded-lg hover:bg-error/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Unsubscribing...
                    </span>
                  ) : (
                    'Unsubscribe from All Alerts'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-accent">
                <p className="text-text-secondary text-sm text-center">
                  Changed your mind?{' '}
                  <Link href="/categories" className="text-primary hover:text-primary-dark font-medium">
                    Browse job categories
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {!hasUnsubscribed && (
            <div className="mt-8 bg-primary/5 rounded-lg p-6 border border-primary/20">
              <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Note
              </h3>
              <p className="text-text-secondary text-sm">
                Unsubscribing will remove you from all job alert emails. If you want to stop receiving alerts for specific categories only, you can manage your subscriptions by clicking the unsubscribe link in any job alert email.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}


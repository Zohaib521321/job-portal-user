'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';

interface JobAlertSubscriptionProps {
  categoryId: number;
  categoryName: string;
}

export default function JobAlertSubscription({ categoryId, categoryName }: JobAlertSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubscribe = async (e: React.FormEvent) => {
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
        '/api/job-alerts/subscribe',
        {
          email: email.toLowerCase().trim(),
          category_id: categoryId
        }
      );

      if (response.success) {
        setMessage(response.message || 'Successfully subscribed! Check your email for confirmation.');
        setMessageType('success');
        setEmail(''); // Clear the input
      } else {
        setMessage(response.error?.message || 'Failed to subscribe. Please try again.');
        setMessageType('error');
      }
    } catch (err: unknown) {
      console.error('Subscription error:', err);
      const error = err as { error?: { message?: string } };
      setMessage(error.error?.message || 'An error occurred. Please try again later.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/30 rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground">Get Job Alerts</h3>
          </div>
          <p className="text-text-secondary text-sm">
            Subscribe to receive email notifications when new <strong className="text-foreground">{categoryName}</strong> jobs are posted
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 md:w-64 bg-background text-foreground border border-accent rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-background font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Subscribing...
              </span>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-success/10 text-success border border-success/30' 
            : 'bg-error/10 text-error border border-error/30'
        }`}>
          <div className="flex items-center gap-2">
            {messageType === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="text-sm">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}


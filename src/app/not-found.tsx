import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Page Not Found
            </h2>
            <p className="text-text-secondary text-lg mb-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. The page might have been moved or doesn&apos;t exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-primary text-background font-semibold px-8 py-3 rounded-lg hover:bg-primary-dark transition-all duration-200"
            >
              Browse Jobs
            </Link>
            <Link
              href="/categories"
              className="inline-block bg-surface border border-primary text-primary font-semibold px-8 py-3 rounded-lg hover:bg-primary/10 transition-all duration-200"
            >
              View Categories
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/"
              className="bg-surface rounded-lg p-6 hover:border hover:border-primary transition-all duration-200"
            >
              <svg className="w-12 h-12 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-foreground font-semibold mb-2">Browse Jobs</h3>
              <p className="text-text-secondary text-sm">Find your dream job</p>
            </Link>

            <Link
              href="/categories"
              className="bg-surface rounded-lg p-6 hover:border hover:border-primary transition-all duration-200"
            >
              <svg className="w-12 h-12 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-foreground font-semibold mb-2">Categories</h3>
              <p className="text-text-secondary text-sm">Browse by category</p>
            </Link>

            <Link
              href="/suggest"
              className="bg-surface rounded-lg p-6 hover:border hover:border-primary transition-all duration-200"
            >
              <svg className="w-12 h-12 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h3 className="text-foreground font-semibold mb-2">Suggest</h3>
              <p className="text-text-secondary text-sm">Suggest a category</p>
            </Link>
          </div>

          <div className="mt-12 bg-surface rounded-lg p-6 border border-accent">
            <p className="text-text-secondary">
              If you believe this is an error, please{' '}
              <Link href="/contact" className="text-primary hover:text-primary-dark">
                contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}



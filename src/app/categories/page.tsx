'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

import { apiGet } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  job_count: number;
  status: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet('/api/categories?status=active');
      
      if (data.success) {
        setCategories(data.data);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
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
            <p className="text-text-secondary mt-4">Loading categories...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-error">{error}</p>
            <button 
              onClick={fetchCategories}
              className="mt-4 bg-primary text-background px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Browse by <span className="text-primary">Category</span>
          </h1>
          <p className="text-text-secondary text-lg">
            Find jobs that match your expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="bg-surface rounded-lg p-6 hover:border hover:border-primary transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              <div className="text-4xl mb-4">{category.icon || '🏷️'}</div>
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-text-secondary">
                {category.job_count} open positions
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-surface rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Don't see your category?
          </h2>
          <p className="text-text-secondary mb-6">
            Help us improve by suggesting a new category
          </p>
          <Link
            href="/suggest"
            className="inline-block bg-primary text-background font-semibold px-8 py-3 rounded-lg hover:bg-primary-dark transition-all duration-200"
          >
            Suggest a Category
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}


'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();

  return (
    <nav className="bg-background border-b border-accent">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src={resolvedTheme === 'dark' ? '/logo_dark.png' : '/logo_light.png'}
              alt="Job Hunt Logo"
              width={180}
              height={180}
              className="object-contain"
            />
          
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
            >
              Home
            </Link>
            <Link 
              href="/categories" 
              className="text-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
            >
              Categories
            </Link>
            <Link 
              href="/suggest" 
              className="text-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
            >
              Suggest
            </Link>
            <Link 
              href="/feedback" 
              className="text-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
            >
              Feedback
            </Link>
            <Link 
              href="/contact" 
              className="text-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
            >
              Contact
            </Link>
            
            {/* Resume Builder - Conditional based on auth */}
            {user ? (
              <Link 
                href="/resume-builder" 
                className="text-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
              >
                Resume Builder
              </Link>
            ) : (
              <Link 
                href="/auth/login" 
                className="text-foreground hover:text-primary transition-all duration-200 hover:underline underline-offset-4"
              >
                Resume Builder
              </Link>
            )}
            
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link 
              href="/" 
              className="block text-foreground hover:text-primary transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/categories" 
              className="block text-foreground hover:text-primary transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/suggest" 
              className="block text-foreground hover:text-primary transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Suggest
            </Link>
            <Link 
              href="/feedback" 
              className="block text-foreground hover:text-primary transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Feedback
            </Link>
            <Link 
              href="/contact" 
              className="block text-foreground hover:text-primary transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Resume Builder - Conditional based on auth */}
            {user ? (
              <Link 
                href="/resume-builder" 
                className="block text-foreground hover:text-primary transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Resume Builder
              </Link>
            ) : (
              <Link 
                href="/auth/login" 
                className="block text-foreground hover:text-primary transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
            
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


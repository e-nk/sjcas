'use client';

import { ReactNode, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer'; 

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
  suppressHeaderSpacing?: boolean;
}

export default function MainLayout({ 
  children, 
  className = '',
  suppressHeaderSpacing = false
}: MainLayoutProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering (prevents hydration mismatches)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <main 
        className={`relative ${
          suppressHeaderSpacing ? '' : 'pt-20 lg:pt-24'
        } ${className}`}
        role="main"
      >
        <div className="min-h-screen">
          {children}
        </div>
      </main>
      
      {/* Footer - Uncomment when ready */}
      <Footer />
      
      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}

// Scroll to Top Button Component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 p-3 bg-crux-primary text-white rounded-full shadow-lg hover:bg-crux-primary/90 focus:outline-none focus:ring-2 focus:ring-crux-primary/20 focus:ring-offset-2 transition-all duration-300 ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-0 pointer-events-none'
      }`}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 10l7-7m0 0l7 7m-7-7v18" 
        />
      </svg>
    </button>
  );
}

// Alternative MainLayout variant for pages that need custom header spacing
export function MainLayoutFullHeight({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main 
        className={`relative ${className}`}
        role="main"
      >
        {children}
      </main>
      {/* <Footer /> */}
      <ScrollToTopButton />
    </div>
  );
}

// Layout variant for authentication pages or special layouts
export function MinimalLayout({ 
  children, 
  className = '',
  showHeader = true
}: { 
  children: ReactNode; 
  className?: string;
  showHeader?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {showHeader && <Header />}
      <main 
        className={`relative ${showHeader ? 'pt-20 lg:pt-24' : ''} ${className}`}
        role="main"
      >
        {children}
      </main>
      {showHeader && <ScrollToTopButton />}
    </div>
  );
}
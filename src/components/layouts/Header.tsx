'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, Mail } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Learn', href: '/learn' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled 
          ? 'shadow-md' 
          : 'shadow-sm'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar with contact info */}
        <div className="hidden lg:flex items-center justify-between py-2 text-sm border-b border-gray-200">
          <div className="flex items-center space-x-6 text-school-primary-red/70">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+254 (0) 700 000 000</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>info@sjca-sironoi.ac.ke</span>
            </div>
          </div>
          <div className="text-school-primary-blue font-medium">
            A GOOD ACADEMIC FOUNDATION FOR A BRIGHTER FUTURE
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4 lg:py-6">
          {/* Logo and School Name */}
          <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="St. Joseph's Logo" 
                  className="h-12 lg:h-16 w-auto transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-one-primary-plum scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
              <div>
                <h1 className="font-garamond font-bold text-lg sm:text-xl lg:text-2xl text-one-primary-black group-hover:text-school-primary-black transition-colors duration-300">
                  St. Joseph's Central Academy
                </h1>
                <div className="text-xs text-one-primary-teal font-colfax font-medium tracking-wider uppercase">
                  Sironoi
                </div>
              </div>
            </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-3 py-2 text-base font-medium text-school-primary-black hover:text-school-primary-red/80 transition-colors duration-200 group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-school-primary-blue group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
            
            {/* Pay Button */}
            <Link
              href="/pay"
              className="ml-4 px-6 py-2.5 bg-school-primary-black text-white font-medium rounded-md hover:bg-school-primary-red/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-school-primary-red/20 focus:ring-offset-2"
            >
              Pay Fees
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-school-primary-red hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 pointer-events-none'
        } overflow-hidden bg-white border-t border-gray-200`}
      >
        <nav className="px-4 py-6 space-y-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-4 py-3 text-base font-medium text-school-primary-red hover:text-school-primary-red/80 hover:bg-gray-50 rounded-md transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Mobile Pay Button */}
          <Link
            href="/pay"
            className="block w-full mt-6 px-6 py-3 bg-school-primary-red text-white font-medium text-center rounded-md hover:bg-school-primary-red/90 transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Pay Fees
          </Link>
        </nav>
      </div>
    </header>
  );
}
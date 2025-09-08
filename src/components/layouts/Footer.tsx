'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Learn', href: '/learn' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Pay Fees', href: '/pay' },
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'YouTube', href: '#', icon: Youtube },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-school-primary-red text-white">
      
      {/* Main footer content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* School Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/logo.png" 
                alt="St. Joseph's Central Academy Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h3 className="text-lg font-bold">ST. JOSEPH'S CENTRAL ACADEMY</h3>
                <p className="text-school-primary-lightBlue">SIRONOI</p>
              </div>
            </div>
            
            <p className="text-white/90 mb-4 text-sm">
              A Good Academic Foundation for a Brighter Future
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-school-primary-lightBlue flex-shrink-0" />
                <span className="text-white/80">Sironoi, Nandi County, Kenya</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-school-primary-lightBlue flex-shrink-0" />
                <span className="text-white/80">+254 (0) 700 000 000</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-school-primary-lightBlue flex-shrink-0" />
                <span className="text-white/80">info@sjca-sironoi.ac.ke</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/80 hover:text-white text-sm transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect With Us</h3>
            
            {/* Social Links */}
            <div className="flex space-x-3 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded flex items-center justify-center transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </Link>
                );
              })}
            </div>

            {/* Legal Links */}
            <div className="space-y-1 text-sm">
              <Link href="/privacy" className="block text-white/80 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-white/80 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-white/70 text-sm">
            © {currentYear} St. Joseph's Central Academy - Sironoi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
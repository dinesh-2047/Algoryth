'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // 🔥 Sticky shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/problems', label: 'Problems' },
    { href: '/bookmarks', label: 'Bookmarks' },
    { href: '/contests', label: 'Contests' },
    { href: '/badges', label: 'Achievements' },
    { href: '/rating', label: 'Rating' },
    { href: '/submissions', label: 'Submissions' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 
      backdrop-blur-xl bg-white/70 dark:bg-[#0b1120]/70
      border-b border-gray-200/40 dark:border-gray-800/40
      ${scrolled ? 'py-2 shadow-md' : 'py-4 shadow-lg'}`}
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/algoryth-logo.png"
              alt="Logo"
              width={scrolled ? 36 : 44}
              height={scrolled ? 36 : 44}
              className="rounded-full transition-all duration-300 group-hover:scale-110"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Algoryth
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-10 relative">

            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 group"
                >
                  {link.label}

                  {/* 🔥 Animated Underline Slide */}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300
                    ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                  />
                </Link>
              );
            })}

            {/* 🔎 Integrated Search */}
            <div className="relative group ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition" />
              <input
                placeholder="Search..."
                className="w-36 focus:w-52 transition-all duration-300 h-9 pl-9 pr-3 rounded-full 
                bg-gray-100 dark:bg-gray-800 text-sm outline-none
                focus:ring-2 focus:ring-indigo-500"
              />
            </div>

          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-4 ml-6">
            <ThemeToggle />
            <AuthButton />
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            isMenuOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="rounded-xl bg-white/95 dark:bg-[#111827]/95 shadow-lg p-4 flex flex-col gap-3">

            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <AuthButton />
            </div>

          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;

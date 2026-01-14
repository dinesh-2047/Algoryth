'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Close menu when resizing to larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/problems', label: 'Problems' },
    { href: '/contests', label: 'Contests' },
    { href: '/rating', label: 'Rating' },
    { href: '/submissions', label: 'Submissions' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-[#e0d5c2] bg-[#fdf7ed]/90 backdrop-blur dark:border-[#3c3347] dark:bg-[#1f1b27]/90">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="flex items-center gap-4 py-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/algoryth-logo.png"
              alt="Algoryth logo"
              width={140}
              height={60}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation - Hidden on small screens */}
          <div className="hidden flex-1 sm:block">
            <input
              aria-label="Search"
              placeholder="Search"
              className="h-9 w-full rounded-full border border-[#deceb7] bg-[#fdf7ed] px-4 text-sm text-[#2b2116] outline-none placeholder:text-[#8a7a67] focus:ring-2 focus:ring-[#c99a4c]/30 dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0] dark:placeholder:text-[#a89cae] dark:focus:ring-[#f2c66f]/30"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <AuthButton />
          </div>

          {/* Mobile menu button - Only visible on small screens */}
          <div className="sm:hidden ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-[#2b2116] dark:text-[#f6ede0] hover:bg-[#f2e3cc] dark:hover:bg-[#2d2535] focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-label="Main menu"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
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
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden sm:flex items-center gap-2 pb-3 text-xs font-semibold uppercase tracking-wide text-[#8a7a67] dark:text-[#b5a59c]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-[#5d5245] hover:bg-[#f2e3cc] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu - Only visible when menu is open */}
        {isMenuOpen && (
          <div className="sm:hidden py-3 border-t border-[#e0d5c2] dark:border-[#3c3347]">
            <div className="mb-3">
              <input
                aria-label="Search"
                placeholder="Search"
                className="h-9 w-full rounded-full border border-[#deceb7] bg-[#fdf7ed] px-4 text-sm text-[#2b2116] outline-none placeholder:text-[#8a7a67] focus:ring-2 focus:ring-[#c99a4c]/30 dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0] dark:placeholder:text-[#a89cae] dark:focus:ring-[#f2c66f]/30"
              />
            </div>
            
            <div className="flex flex-col gap-1 pb-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-full px-3 py-2 text-[#5d5245] hover:bg-[#f2e3cc] dark:text-[#d7ccbe] dark:hover:bg-[#2d2535]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="pt-3 border-t border-[#e0d5c2] dark:border-[#3c3347]">
              <AuthButton />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
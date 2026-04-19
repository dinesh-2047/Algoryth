'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';
import { useAuth } from '../context/AuthContext';

const baseNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/problems', label: 'Problems' },
  { href: '/contests', label: 'Contests' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = user?.role === 'admin'
    ? [...baseNavLinks, { href: '/admin', label: 'Admin' }]
    : baseNavLinks;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b-2 border-black bg-[#f8fbff] transition-all dark:border-[#7d8fc4] dark:bg-[#10182c] ${
        scrolled
          ? 'shadow-[0_1px_0_0_#000] dark:shadow-[0_1px_0_0_#7d8fc4]'
          : 'shadow-[0_2px_0_0_#000] dark:shadow-[0_2px_0_0_#7d8fc4]'
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-[#fff9d0] p-1.5 transition-colors hover:bg-[#fff4a3] dark:bg-[#18233f] dark:hover:bg-[#233358]"
          aria-label="Algoryth home"
        >
          <Image
            src="/algoryth-logo.png"
            alt="Algoryth logo"
            width={84}
            height={84}
            className="rounded-md"
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl border border-black px-3 py-1 text-xs font-black uppercase tracking-wide transition dark:border-[#7d8fc4] ${
                  isActive
                    ? 'bg-[#0f92ff] text-black dark:bg-[#ff8a65] dark:text-[#1f1010]'
                    : 'bg-[#fff9d0] text-black hover:bg-[#44d07d] dark:bg-[#161f38] dark:text-[#d9e5ff] dark:hover:bg-[#25335a]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black dark:text-[#9ac9ff]" />
            <input
              placeholder="Search"
              className="h-9 w-44 bg-[#fff9d0] pl-9 pr-3 text-sm font-semibold text-black dark:bg-[#161f38] dark:text-[#edf2ff]"
            />
          </div>
          <ThemeToggle />
          <AuthButton />
        </div>

        <button
          onClick={() => setIsMenuOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center border border-black bg-white text-black md:hidden dark:border-[#7d8fc4] dark:bg-[#161f38] dark:text-[#d9e5ff]"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t-2 border-black bg-[#fff9d0] px-6 py-4 md:hidden dark:border-[#7d8fc4] dark:bg-[#141d34]">
          <div className="grid gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-xl border border-black px-3 py-2 text-sm font-bold uppercase tracking-wide dark:border-[#7d8fc4] ${
                    isActive
                      ? 'bg-[#0f92ff] text-black dark:bg-[#ff8a65] dark:text-[#1f1010]'
                      : 'bg-white text-black dark:bg-[#111a2f] dark:text-[#edf2ff]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      )}
    </header>
  );
}

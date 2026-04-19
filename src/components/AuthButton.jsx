'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const { user, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ensure we're running on the client side (defer to avoid hydration mismatch)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !mounted) {
    // Render nothing or a loading state while checking auth status
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-[#263458]"></div>
    );
  }

  if (user) {
    // User is logged in - show profile icon with dropdown
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] dark:bg-[#56d5ff] dark:text-[#07131d] dark:hover:bg-[#35bee9]"
          aria-label="User profile"
        >
          <span className="font-medium">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 z-50 mt-2 w-52 rounded-md border border-black/10 bg-white shadow-lg dark:border-[#7d8fc4]/45 dark:bg-[#101a31]">
            <div className="py-1" role="menu">
              <div className="border-b border-gray-200 px-4 py-2 text-sm text-gray-700 dark:border-[#304267] dark:text-[#dbe7ff]" role="none">
                Signed in as<br />
                <span className="font-medium">{user.email || user.name}</span>
              </div>
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#e8f0ff] dark:text-[#dbe7ff] dark:hover:bg-[#1d2f55] dark:hover:text-white"
                role="menuitem"
              >
                Profile
              </Link>
              <Link
                href="/badges"
                onClick={() => setDropdownOpen(false)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#e8f0ff] dark:text-[#dbe7ff] dark:hover:bg-[#1d2f55] dark:hover:text-white"
                role="menuitem"
              >
                Achievements
              </Link>
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#e8f0ff] dark:text-[#dbe7ff] dark:hover:bg-[#1d2f55] dark:hover:text-white"
                role="menuitem"
              >
                Settings
              </Link>
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#e8f0ff] dark:text-[#dbe7ff] dark:hover:bg-[#1d2f55] dark:hover:text-white"
                  role="menuitem"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-[#ffe9e9] dark:text-red-300 dark:hover:bg-[#41263a] dark:hover:text-red-200"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } else {
    // User is not logged in - show sign in button
    return (
      <Link
        href="/auth"
        className="inline-flex h-9 items-center justify-center rounded-full bg-[#2563eb] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8] dark:bg-[#63f3b6] dark:text-[#07150f] dark:hover:bg-[#47d89a]"
      >
        Sign in
      </Link>
    );
  }
}
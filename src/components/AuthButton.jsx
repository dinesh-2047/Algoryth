'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const { user, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ensure we're running on the client side
  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  if (loading || !mounted) {
    // Render nothing or a loading state while checking auth status
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    );
  }

  if (user) {
    // User is logged in - show profile icon with dropdown
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#d69a44] text-white hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
          aria-label="User profile"
        >
          <span className="font-medium">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </button>
        
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#211d27] ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-[#3c3347]" role="none">
                Signed in as<br />
                <span className="font-medium">{user.email || user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-[#2d2535] dark:text-red-400 dark:hover:text-red-300"
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
        className="inline-flex h-9 items-center justify-center rounded-full bg-[#d69a44] px-4 text-sm font-medium text-[#2b1a09] hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
      >
        Sign in
      </Link>
    );
  }
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ToastNotification from '../../components/ToastNotification';

export default function AuthPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Check URL hash to determine initial view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#signup') {
        setIsFlipped(true);
      }
    }
  }, []);

  const handleSubmit = async (e, formType) => {
    e.preventDefault();
    
    if (formType === 'signup') {
      // Get form values
      const name = document.getElementById('name-signup').value;
      const email = document.getElementById('email-signup').value;
      const password = document.getElementById('password-signup').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Basic validation
      if (!name || !email || !password || !confirmPassword) {
        setNotification({ show: true, message: 'Please fill in all fields', type: 'error' });
        return;
      }
      
      if (password !== confirmPassword) {
        setNotification({ show: true, message: 'Passwords do not match', type: 'error' });
        return;
      }
      
      // Create user object
      const userData = { name, email, password };
      
      // Call signup function from context
      const result = await signup(userData);
      
      if (result.success) {
        // Show success notification
        setNotification({ show: true, message: 'Account created successfully!', type: 'success' });
        
        // Redirect to homepage after a short delay to allow notification to show
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        // Show error notification
        setNotification({ show: true, message: result.error || 'An error occurred during registration', type: 'error' });
      }
    } else if (formType === 'login') {
      // Get form values
      const email = document.getElementById('email-login').value;
      const password = document.getElementById('password-login').value;
      
      // Basic validation
      if (!email || !password) {
        setNotification({ show: true, message: 'Please fill in all fields', type: 'error' });
        return;
      }
      
      // Create credentials object
      const credentials = { email, password };
      
      // Call login function from context
      const result = await login(credentials);
      
      if (result.success) {
        // Show success notification
        setNotification({ show: true, message: 'Login successful!', type: 'success' });
        
        // Redirect to homepage after a short delay to allow notification to show
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        // Show error notification
        setNotification({ show: true, message: result.error || 'An error occurred during login', type: 'error' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f3e6] to-[#e6ddd2] dark:from-[#18131f] dark:to-[#2d2535] p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
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
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Left side - Image */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/code.jpg"
                alt="Coding illustration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/fallback-image.jpg';
                }}
              />
            </div>
          </div>

          {/* Right side - Flip Card */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div 
              className="flip-container relative w-full max-w-md h-96"
            >
              <div 
                className={`flip-card ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                <div className="card-face absolute inset-0 w-full h-full rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27] shadow-xl p-6 flex flex-col">
                  <h2 className="text-2xl font-bold text-[#2b2116] dark:text-[#f6ede0] mb-6">Welcome Back</h2>
                  
                  <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-3 flex-grow">
                    <div>
                      <label htmlFor="email-login" className="block text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email-login"
                        className="w-full px-3 py-2 rounded-lg border border-[#deceb7] bg-[#fdf7ed] text-[#2b2116] outline-none focus:ring-2 focus:ring-[#c99a4c]/30 focus:border-[#c99a4c] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0]"
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password-login" className="block text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password-login"
                        className="w-full px-3 py-2 rounded-lg border border-[#deceb7] bg-[#fdf7ed] text-[#2b2116] outline-none focus:ring-2 focus:ring-[#c99a4c]/30 focus:border-[#c99a4c] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0]"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        className="h-4 w-4 rounded border-[#deceb7] bg-[#fdf7ed] text-[#c99a4c] focus:ring-[#c99a4c] dark:border-[#40364f] dark:bg-[#221d2b]"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-[#5d5245] dark:text-[#d7ccbe]">
                        Remember me
                      </label>
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full mt-4 inline-flex h-14 items-center justify-center rounded-full bg-[#d69a44] px-6 text-base font-medium text-[#2b1a09] hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857] shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      Sign In
                    </button>
                  </form>
                  
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setIsFlipped(true)}
                      className="text-sm text-[#8a7a67] hover:text-[#d69a44] dark:text-[#b5a59c] dark:hover:text-[#f2c66f] font-medium underline decoration-transparent hover:decoration-[#d69a44] dark:hover:decoration-[#f2c66f] transition-all duration-200 cursor-pointer"
                    >
                      Don't have an account? <span className="hover:text-[#d69a44] dark:hover:text-[#f2c66f]">Sign up</span>
                    </button>
                  </div>
                </div>
                
                {/* Signup Card Back */}
                <div className="card-face card-back absolute inset-0 w-full h-full rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] dark:border-[#3c3347] dark:bg-[#211d27] shadow-xl p-6 flex flex-col">
                  <h2 className="text-2xl font-bold text-[#2b2116] dark:text-[#f6ede0] mb-6">Create Account</h2>
                  
                  <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-3 flex-grow">
                    <div>
                      <label htmlFor="name-signup" className="block text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name-signup"
                        className="w-full px-3 py-2 rounded-lg border border-[#deceb7] bg-[#fdf7ed] text-[#2b2116] outline-none focus:ring-2 focus:ring-[#c99a4c]/30 focus:border-[#c99a4c] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0]"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email-signup" className="block text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email-signup"
                        className="w-full px-3 py-2 rounded-lg border border-[#deceb7] bg-[#fdf7ed] text-[#2b2116] outline-none focus:ring-2 focus:ring-[#c99a4c]/30 focus:border-[#c99a4c] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0]"
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="password-signup" className="block text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password-signup"
                        className="w-full px-3 py-2 rounded-lg border border-[#deceb7] bg-[#fdf7ed] text-[#2b2116] outline-none focus:ring-2 focus:ring-[#c99a4c]/30 focus:border-[#c99a4c] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0]"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-[#5d5245] dark:text-[#d7ccbe] mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        className="w-full px-3 py-2 rounded-lg border border-[#deceb7] bg-[#fdf7ed] text-[#2b2116] outline-none focus:ring-2 focus:ring-[#c99a4c]/30 focus:border-[#c99a4c] dark:border-[#40364f] dark:bg-[#221d2b] dark:text-[#f6ede0]"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full mt-4 inline-flex h-14 items-center justify-center rounded-full bg-[#d69a44] px-6 text-base font-medium text-[#2b1a09] hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857] shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      Sign Up
                    </button>
                  </form>
                  
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setIsFlipped(false)}
                      className="text-sm text-[#8a7a67] hover:text-[#d69a44] dark:text-[#b5a59c] dark:hover:text-[#f2c66f] font-medium underline decoration-transparent hover:decoration-[#d69a44] dark:hover:decoration-[#f2c66f] transition-all duration-200 cursor-pointer"
                    >
                      Already have an account? <span className="hover:text-[#d69a44] dark:hover:text-[#f2c66f]">Sign in</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification component */}
      <ToastNotification 
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      <style jsx global>{`
        .flip-container {
          perspective: 1000px;
        }
        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s;
          transform-style: preserve-3d;
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 1rem;
        }
        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
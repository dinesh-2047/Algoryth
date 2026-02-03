'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ToastNotification from '../../components/ToastNotification';
import { Mail, Lock, User, Github, ArrowLeft, Chrome, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    
    try {
      if (formType === 'signup') {
        const name = document.getElementById('name-signup').value;
        const email = document.getElementById('email-signup').value;
        const password = document.getElementById('password-signup').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!name || !email || !password || !confirmPassword) {
          setNotification({ show: true, message: 'Please fill in all fields', type: 'error' });
          setIsLoading(false);
          return;
        }
        
        if (password !== confirmPassword) {
          setNotification({ show: true, message: 'Passwords do not match', type: 'error' });
          setIsLoading(false);
          return;
        }
        
        const result = await signup({ name, email, password });
        
        if (result.success) {
          setNotification({ show: true, message: 'Account created successfully!', type: 'success' });
          setTimeout(() => router.push('/'), 1000);
        } else {
          setNotification({ show: true, message: result.error || 'Registration failed', type: 'error' });
        }
      } else if (formType === 'login') {
        const email = document.getElementById('email-login').value;
        const password = document.getElementById('password-login').value;
        
        if (!email || !password) {
          setNotification({ show: true, message: 'Please fill in all fields', type: 'error' });
          setIsLoading(false);
          return;
        }
        
        const result = await login({ email, password });
        
        if (result.success) {
          setNotification({ show: true, message: 'Login successful!', type: 'success' });
          setTimeout(() => router.push('/'), 1000);
        } else {
          setNotification({ show: true, message: result.error || 'Login failed', type: 'error' });
        }
      }
    } catch (error) {
      setNotification({ show: true, message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#f8f3e6] via-[#f2e9d9] to-[#e6ddd2] dark:from-[#130f18] dark:via-[#18131f] dark:to-[#211d27] p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#d69a44]/10 dark:bg-[#f2c66f]/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#c99a4c]/10 dark:bg-[#c99a4c]/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-lg z-10">
        {/* Header/Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="group mb-6">
            <Image
              src="/algoryth-logo.png"
              alt="Algoryth logo"
              width={220}
              height={80}
              priority
              className="h-14 w-auto opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-sm"
            />
          </Link>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#8a7a67] hover:text-[#d69a44] dark:text-[#b5a59c] dark:hover:text-[#f2c66f] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to homepage
          </Link>
        </div>

        {/* Auth Content Card */}
        <div className="w-full perspective-1000 min-h-[500px]">
          <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            
            {/* Login Face */}
            <div className="backface-hidden absolute inset-0 w-full h-fit bg-[#fff8ed]/80 dark:bg-[#1c1822]/90 backdrop-blur-2xl border border-[#e0d5c2] dark:border-[#3c3347] rounded-[2.5rem] shadow-2xl p-10">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-black text-[#2b2116] dark:text-[#f6ede0] tracking-tighter sm:text-4xl">
                  Welcome back
                </h2>
                <p className="text-[#8a7a67] dark:text-[#b5a59c] mt-2 font-semibold text-base">
                  Sign in to continue your journey.
                </p>
              </div>

              <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#5d5245] dark:text-[#d7ccbe] flex items-center gap-2 uppercase tracking-widest opacity-70">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    id="email-login"
                    className="w-full px-5 py-3 rounded-2xl border-2 border-[#deceb7] bg-white/40 dark:bg-white/5 text-[#2b2116] dark:text-[#f6ede0] outline-none focus:border-[#d69a44] dark:focus:border-[#f2c66f] transition-all text-base shadow-sm"
                    placeholder="name@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-[#5d5245] dark:text-[#d7ccbe] flex items-center gap-2 uppercase tracking-widest opacity-70">
                      <Lock className="w-3.5 h-3.5" /> Password
                    </label>
                    <button type="button" className="text-[10px] font-bold text-[#d69a44] dark:text-[#f2c66f] hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      id="password-login"
                      className="w-full px-5 py-3 rounded-2xl border-2 border-[#deceb7] bg-white/40 dark:bg-white/5 text-[#2b2116] dark:text-[#f6ede0] outline-none focus:border-[#d69a44] dark:focus:border-[#f2c66f] transition-all text-base shadow-sm pr-12"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a7a67] dark:text-[#b5a59c] hover:text-[#d69a44] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-[#d69a44] dark:bg-[#f2c66f] text-[#2b1a09] dark:text-[#231406] py-4 rounded-2xl font-black text-base shadow-xl shadow-[#d69a44]/20 hover:shadow-[#d69a44]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </button>

                <div className="text-center pt-2">
                  <p className="text-[#8a7a67] dark:text-[#b5a59c] font-bold text-sm">
                    New to Algoryth?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsFlipped(true); setShowPassword(false); }}
                      className="text-[#d69a44] dark:text-[#f2c66f] hover:underline decoration-2 underline-offset-4"
                    >
                      Create account
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Signup Face */}
            <div className="card-back backface-hidden absolute inset-0 rotate-y-180 w-full h-fit bg-[#fff8ed]/80 dark:bg-[#1c1822]/90 backdrop-blur-2xl border border-[#e0d5c2] dark:border-[#3c3347] rounded-[2.5rem] shadow-2xl p-10">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-extrabold text-[#2b2116] dark:text-[#f6ede0] tracking-tighter sm:text-4xl">
                  Join Algoryth
                </h2>
                <p className="text-[#8a7a67] dark:text-[#b5a59c] mt-2 font-semibold text-sm">
                  Start your journey today.
                </p>
              </div>

              <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#5d5245] dark:text-[#d7ccbe] flex items-center gap-2 uppercase tracking-widest opacity-70">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input
                    required
                    type="text"
                    id="name-signup"
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#deceb7] bg-white/40 dark:bg-white/5 text-[#2b2116] dark:text-[#f6ede0] outline-none focus:border-[#d69a44] dark:focus:border-[#f2c66f] transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#5d5245] dark:text-[#d7ccbe] flex items-center gap-2 uppercase tracking-widest opacity-70">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <input
                    required
                    type="email"
                    id="email-signup"
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#deceb7] bg-white/40 dark:bg-white/5 text-[#2b2116] dark:text-[#f6ede0] outline-none focus:border-[#d69a44] dark:focus:border-[#f2c66f] transition-all text-sm"
                    placeholder="name@example.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#5d5245] dark:text-[#d7ccbe] flex items-center gap-2 uppercase tracking-widest opacity-70">
                      <Lock className="w-3.5 h-3.5" /> Password
                    </label>
                    <input
                      required
                      type="password"
                      id="password-signup"
                      className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#deceb7] bg-white/40 dark:bg-white/5 text-[#2b2116] dark:text-[#f6ede0] outline-none focus:border-[#d69a44] dark:focus:border-[#f2c66f] transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#5d5245] dark:text-[#d7ccbe] uppercase tracking-widest opacity-70 pl-2">Confirm</label>
                    <input
                      required
                      type="password"
                      id="confirm-password"
                      className="w-full px-4 py-2.5 rounded-2xl border-2 border-[#deceb7] bg-white/40 dark:bg-white/5 text-[#2b2116] dark:text-[#f6ede0] outline-none focus:border-[#d69a44] dark:focus:border-[#f2c66f] transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input required type="checkbox" id="terms" className="w-4 h-4 rounded-lg accent-[#d69a44] cursor-pointer" />
                  <label htmlFor="terms" className="text-[10px] text-[#8a7a67] dark:text-[#b5a59c] font-bold cursor-pointer">
                    I agree to the <Link href="/terms" className="text-[#d69a44] dark:text-[#f2c66f] underline decoration-2 underline-offset-2">Terms</Link> and <Link href="/privacy" className="text-[#d69a44] dark:text-[#f2c66f] underline decoration-2 underline-offset-2">Privacy</Link>
                  </label>
                </div>

                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-[#d69a44] dark:bg-[#f2c66f] text-[#2b1a09] dark:text-[#231406] py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-[#d69a44]/20 hover:shadow-[#d69a44]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>

                <div className="text-center pt-2">
                  <p className="text-[#8a7a67] dark:text-[#b5a59c] font-bold text-sm">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsFlipped(false); setShowPassword(false); }}
                      className="text-[#d69a44] dark:text-[#f2c66f] hover:underline decoration-2 underline-offset-4"
                    >
                      Sign in instead
                    </button>
                  </p>
                </div>
              </form>
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
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

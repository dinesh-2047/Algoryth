'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Define routes where navbar and footer should be hidden
  const hideLayout = pathname.startsWith('/auth') || pathname.startsWith('/signup');

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
      <Footer />
    </>
  );
}

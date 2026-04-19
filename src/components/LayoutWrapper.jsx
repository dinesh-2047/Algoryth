'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Define routes where navbar and footer should be hidden
  const hideLayout = pathname.startsWith('/auth') || pathname.startsWith('/signup');
  const isProblemWorkspaceRoute = pathname.startsWith('/problems/') && pathname !== '/problems';

  if (hideLayout) {
    return <>{children}</>;
  }

  const mainClassName = isProblemWorkspaceRoute
    ? 'w-full max-w-none flex min-h-[100dvh] flex-col overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4 md:h-[100dvh] md:min-h-0 md:overflow-hidden'
    : 'mx-auto w-full max-w-7xl px-6 py-8';

  return (
    <>
      {!isProblemWorkspaceRoute && <Navbar />}
      <main className={mainClassName}>{children}</main>
      {!isProblemWorkspaceRoute && <Footer />}
    </>
  );
}

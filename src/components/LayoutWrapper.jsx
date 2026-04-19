'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import MigrationPrompt from './MigrationPrompt';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const { user, token } = useAuth();
  
  // Define routes where navbar and footer should be hidden
  const hideLayout = pathname.startsWith('/auth') || pathname.startsWith('/signup');
  const isProblemWorkspaceRoute = pathname.startsWith('/problems/') && pathname !== '/problems';

  if (hideLayout) {
    return <>{children}</>;
  }

  const mainClassName = isProblemWorkspaceRoute
    ? 'w-full max-w-none flex h-[100dvh] min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4'
    : 'mx-auto w-full max-w-7xl px-6 py-8';

  return (
    <>
      {!isProblemWorkspaceRoute && <Navbar />}
      <main className={mainClassName}>{children}</main>
      {!isProblemWorkspaceRoute && <Footer />}
      {/* Migration prompt for authenticated users */}
      {user && token && (
        <MigrationPrompt
          userId={user.id || user._id}
          authToken={token}
          onComplete={() => {
            // Refresh dashboard or submissions data after migration
            console.log('Migration completed, reload data if needed');
          }}
        />
      )}
    </>
  );
}

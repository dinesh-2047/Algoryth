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

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
      <Footer />
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

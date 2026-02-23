'use client';

import { useAuth } from '../../context/AuthContext';
import BadgePage from '../../components/BadgePage';

export default function BadgesPage() {
  const { token } = useAuth();
  return (
    <div className="min-h-screen">
      <BadgePage token={token} />
    </div>
  );
}

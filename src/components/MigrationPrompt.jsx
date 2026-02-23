'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Database } from 'lucide-react';
import {
  shouldPromptForMigration,
  migrateSubmissionsToServer,
  getMigrationStats,
} from '../lib/migration/submission-migration.js';

/**
 * Migration Prompt Component
 * Appears as a modal to prompt user to migrate localStorage submissions
 * This should be rendered inside an authenticated context
 */
export default function MigrationPrompt({ userId, authToken, onComplete }) {
  const [show, setShow] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [stats, setStats] = useState(null);

  // Check if migration is needed on mount
  useEffect(() => {
    const checkMigration = async () => {
      const needsMigration = await shouldPromptForMigration(authToken, userId);
      if (needsMigration) {
        const migrationStats = getMigrationStats();
        setStats(migrationStats);
        setShow(true);
      }
    };

    if (userId && authToken) {
      checkMigration();
    }
  }, [userId, authToken]);

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const result = await migrateSubmissionsToServer(authToken, userId);
      setMigrationResult(result);

      // Auto-close on success after 3 seconds
      if (result.success) {
        setTimeout(() => {
          setShow(false);
          if (onComplete) onComplete();
        }, 3000);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        error: error.message,
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-[#e0d5c2] bg-[#fff8ed] p-6 dark:border-[#3c3347] dark:bg-[#211d27] shadow-lg">
        {migrationResult === null ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-[#d69a44]" />
              <h2 className="text-2xl font-bold text-[#2b2116] dark:text-[#f6ede0]">
                Migrate Submissions
              </h2>
            </div>

            {/* Description */}
            <p className="mb-4 text-[#5d5245] dark:text-[#d7ccbe]">
              We found {stats?.totalSubmissions || 0} submissions stored locally in your browser. 
              Migrate them to your account for permanent storage and cross-device access.
            </p>

            {/* Stats */}
            {stats && stats.totalSubmissions > 0 && (
              <div className="mb-6 rounded-lg bg-[#f2e3cc] p-4 dark:bg-[#2d2535]">
                <h3 className="font-semibold text-[#2b2116] dark:text-[#f6ede0] mb-2">
                  Submissions to Migrate
                </h3>
                <ul className="space-y-1 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
                  {Object.entries(stats.byVerdict).map(([verdict, count]) => (
                    <li key={verdict}>
                      {verdict}: <span className="font-semibold">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            <div className="mb-6 space-y-2">
              <h3 className="font-semibold text-[#2b2116] dark:text-[#f6ede0]">Benefits:</h3>
              <ul className="space-y-2 text-sm text-[#5d5245] dark:text-[#d7ccbe]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Permanent storage in your account
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Access from any device
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Never lose your progress
                </li>
              </ul>
            </div>

            {/* Warning */}
            <div className="mb-6 flex items-start gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Local submissions will remain in your browser. This process creates a backup on your account.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                disabled={migrating}
                className="flex-1 rounded-lg border border-[#deceb7] bg-white px-4 py-2 font-medium text-[#2b2116] hover:bg-[#f7f0e0] disabled:opacity-50 dark:border-[#40364f] dark:bg-[#211d27] dark:text-[#f6ede0]"
              >
                Later
              </button>
              <button
                onClick={handleMigrate}
                disabled={migrating}
                className="flex-1 rounded-lg bg-[#d69a44] px-4 py-2 font-medium text-white hover:bg-[#c4852c] disabled:opacity-50 dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
              >
                {migrating ? 'Migrating...' : 'Migrate Now'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Result */}
            <div className="text-center">
              {migrationResult.success ? (
                <>
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-[#2b2116] dark:text-[#f6ede0] mb-2">
                    Migration Complete!
                  </h2>
                  <p className="text-[#5d5245] dark:text-[#d7ccbe] mb-4">
                    {migrationResult.migrated} of {migrationResult.total} submissions migrated successfully
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-[#2b2116] dark:text-[#f6ede0] mb-2">
                    Migration Failed
                  </h2>
                  <p className="text-[#5d5245] dark:text-[#d7ccbe] mb-4">
                    {migrationResult.error || 'An error occurred during migration'}
                  </p>
                  {migrationResult.failed && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {migrationResult.failed} submissions failed to migrate
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

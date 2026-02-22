/**
 * Submission Data Migration Service
 * Handles migration of localStorage submissions to MongoDB
 */

/**
 * Get all submissions from localStorage
 * @returns {Array} Array of submission objects
 */
export function getLocalStorageSubmissions() {
  try {
    const raw = localStorage.getItem('algoryth_submissions');
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading localStorage submissions:', error);
    return [];
  }
}

/**
 * Check if user has already migrated their data
 * @param {string} userId - User ID
 * @returns {boolean} True if migration has been completed
 */
export function isMigrationComplete(userId) {
  try {
    const migrationStatus = localStorage.getItem(`algoryth_migration_${userId}`);
    return migrationStatus === 'completed';
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Mark migration as complete
 * @param {string} userId - User ID
 */
export function markMigrationComplete(userId) {
  try {
    localStorage.setItem(`algoryth_migration_${userId}`, 'completed');
    localStorage.setItem(`algoryth_migration_${userId}_timestamp`, new Date().toISOString());
  } catch (error) {
    console.error('Error marking migration complete:', error);
  }
}

/**
 * Migrate submissions from localStorage to server database
 * @param {string} token - JWT authentication token
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Migration result with success count and errors
 */
export async function migrateSubmissionsToServer(token, userId) {
  try {
    // Check if already migrated
    if (isMigrationComplete(userId)) {
      console.log('Migration already completed for user:', userId);
      return { success: true, migrated: 0, total: 0, reason: 'already_migrated' };
    }

    // Get local submissions
    const submissions = getLocalStorageSubmissions();
    
    if (submissions.length === 0) {
      console.log('No submissions found in localStorage to migrate');
      markMigrationComplete(userId);
      return { success: true, migrated: 0, total: 0, reason: 'no_submissions' };
    }

    console.log(`Starting migration of ${submissions.length} submissions...`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Migrate submissions one by one
    for (const submission of submissions) {
      try {
        // Validate required fields
        if (!submission.slug || !submission.code) {
          errorCount++;
          errors.push({
            submission: submission.slug || 'unknown',
            error: 'Missing required fields (slug, code)',
          });
          continue;
        }

        // Prepare submission for server
        const serverSubmission = {
          slug: submission.slug || submission.problemId,
          code: submission.code,
          language: submission.language || 'javascript',
          verdict: submission.status || submission.verdict || 'Pending',
          testsPassed: submission.testsPassed || 0,
          totalTests: submission.totalTests || 0,
          executionTime: submission.executionTime || 0,
          memoryUsage: submission.memoryUsage || 0,
          submittedAt: submission.timestamp ? new Date(submission.timestamp) : new Date(),
        };

        // Send to server
        const response = await fetch('/api/submissions/migrate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(serverSubmission),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          errors.push({
            submission: submission.slug || submission.problemId,
            error: errorData.message || `HTTP ${response.status}`,
          });
        }
      } catch (error) {
        errorCount++;
        errors.push({
          submission: submission.slug || 'unknown',
          error: error.message,
        });
      }
    }

    // Mark migration complete
    if (successCount > 0) {
      markMigrationComplete(userId);
    }

    const result = {
      success: errorCount === 0,
      migrated: successCount,
      total: submissions.length,
      failed: errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('Migration complete:', result);
    return result;
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      error: error.message,
      migrated: 0,
    };
  }
}

/**
 * Perform automatic migration with user consent
 * This should be called on first app load after authentication
 * @param {string} token - JWT authentication token
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if migration is needed and should be prompted
 */
export async function shouldPromptForMigration(token, userId) {
  try {
    if (isMigrationComplete(userId)) {
      return false;
    }

    const submissions = getLocalStorageSubmissions();
    return submissions.length > 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Get migration statistics from localStorage
 * @returns {Object} Count of submissions ready for migration
 */
export function getMigrationStats() {
  const submissions = getLocalStorageSubmissions();
  const byVerdict = {};

  submissions.forEach((s) => {
    const verdict = s.status || s.verdict || 'Pending';
    byVerdict[verdict] = (byVerdict[verdict] || 0) + 1;
  });

  return {
    totalSubmissions: submissions.length,
    byVerdict,
  };
}

/**
 * Clear migration flag (for testing/reset purposes)
 * @param {string} userId - User ID
 */
export function resetMigrationFlag(userId) {
  try {
    localStorage.removeItem(`algoryth_migration_${userId}`);
    localStorage.removeItem(`algoryth_migration_${userId}_timestamp`);
  } catch (error) {
    console.error('Error resetting migration flag:', error);
  }
}

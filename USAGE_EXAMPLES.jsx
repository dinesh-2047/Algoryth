/**
 * Example: Using the Auth System in Components
 * 
 * This file demonstrates how to use the authentication and backend features
 * in your React components.
 */

'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// Example 1: Login Component
// ============================================

export function LoginExample() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    setLoading(false);

    if (result.success) {
      console.log('Login successful!', result.user);
      router.push('/problems'); // Redirect after login
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// ============================================
// Example 2: Protected Page Component
// ============================================

export function ProtectedPageExample() {
  const { user, loading, isAuthenticated, fetchProfile, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/auth');
      return;
    }

    // Fetch profile if authenticated but profile not loaded
    if (isAuthenticated && !profile) {
      fetchProfile();
    }
  }, [user, loading, isAuthenticated, profile, fetchProfile, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      
      {profile && (
        <div>
          <p>Rating: {profile.rating}</p>
          <p>Rank: {profile.rank}</p>
          <p>Problems Solved: {profile.solvedProblems.total}</p>
          <ul>
            <li>Easy: {profile.solvedProblems.easy}</li>
            <li>Medium: {profile.solvedProblems.medium}</li>
            <li>Hard: {profile.solvedProblems.hard}</li>
          </ul>
          <p>Acceptance Rate: {profile.submissions.acceptanceRate}%</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Example 3: User Profile Edit
// ============================================

export function ProfileEditExample() {
  const { profile, updateProfile, fetchProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    github: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    } else {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        github: profile.socialLinks?.github || '',
      });
    }
  }, [profile, fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const updates = {
      username: formData.username,
      bio: formData.bio,
      socialLinks: {
        github: formData.github,
      },
    };

    const result = await updateProfile(updates);
    setSaving(false);

    if (result.success) {
      setMessage('Profile updated successfully!');
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
      </div>

      <div>
        <label>Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          maxLength={500}
        />
      </div>

      <div>
        <label>GitHub</label>
        <input
          type="url"
          value={formData.github}
          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
        />
      </div>

      {message && <p>{message}</p>}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

// ============================================
// Example 4: Code Submission
// ============================================

export function SubmissionExample({ problem }) {
  const { submitCode, isAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (code, language, testResults) => {
    if (!isAuthenticated) {
      alert('Please login to submit your solution');
      return;
    }

    setSubmitting(true);

    const submissionData = {
      problemId: problem.id,
      problemTitle: problem.title,
      language: language,
      code: code,
      status: testResults.allPassed ? 'Accepted' : 'Wrong Answer',
      testCasesPassed: testResults.passed,
      totalTestCases: testResults.total,
      executionTime: testResults.executionTime,
      memoryUsed: testResults.memoryUsed,
      difficulty: problem.difficulty,
      errorMessage: testResults.error || null,
    };

    const result = await submitCode(submissionData);
    setSubmitting(false);

    if (result.success) {
      alert('Submission successful! Your stats have been updated.');
    } else {
      alert(`Submission failed: ${result.error}`);
    }
  };

  return (
    <button 
      onClick={() => handleSubmit(code, 'javascript', results)}
      disabled={submitting || !isAuthenticated}
    >
      {submitting ? 'Submitting...' : 'Submit Solution'}
    </button>
  );
}

// ============================================
// Example 5: Submission History
// ============================================

export function SubmissionHistoryExample() {
  const { getSubmissions, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    status: '',
    language: '',
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      const result = await getSubmissions(filters);
      setLoading(false);

      if (result.success) {
        setSubmissions(result.submissions);
      }
    };

    fetchSubmissions();
  }, [filters, isAuthenticated, getSubmissions]);

  if (!isAuthenticated) {
    return <div>Please login to view submissions</div>;
  }

  if (loading) {
    return <div>Loading submissions...</div>;
  }

  return (
    <div>
      <h2>My Submissions</h2>
      
      {/* Filters */}
      <div>
        <select 
          value={filters.status} 
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="Accepted">Accepted</option>
          <option value="Wrong Answer">Wrong Answer</option>
        </select>

        <select 
          value={filters.language} 
          onChange={(e) => setFilters({ ...filters, language: e.target.value })}
        >
          <option value="">All Languages</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      {/* Submissions List */}
      <div>
        {submissions.length === 0 ? (
          <p>No submissions yet. Start solving problems!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Status</th>
                <th>Language</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.problemTitle}</td>
                  <td className={sub.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}>
                    {sub.status}
                  </td>
                  <td>{sub.language}</td>
                  <td>{sub.executionTime}ms</td>
                  <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================
// Example 6: User Stats Widget
// ============================================

export function UserStatsWidget() {
  const { profile, isAuthenticated } = useAuth();

  if (!isAuthenticated || !profile) {
    return null;
  }

  return (
    <div className="stats-widget">
      <div className="stat">
        <h3>{profile.rating}</h3>
        <p>Rating</p>
      </div>
      
      <div className="stat">
        <h3>{profile.rank}</h3>
        <p>Rank</p>
      </div>
      
      <div className="stat">
        <h3>{profile.solvedProblems.total}</h3>
        <p>Solved</p>
      </div>
      
      <div className="stat">
        <h3>{profile.submissions.acceptanceRate}%</h3>
        <p>Acceptance</p>
      </div>
    </div>
  );
}

// ============================================
// Example 7: Logout Button
// ============================================

export function LogoutButton() {
  const { logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

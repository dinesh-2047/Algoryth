'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardStats from '../../components/DashboardStats';
import { 
  User, Mail, Calendar, MapPin, Link as LinkIcon, 
  Github, Twitter, Edit3, Award, Activity, Star, Zap,
  Clock, ExternalLink, CheckCircle, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    github: '',
    twitter: '',
    website: ''
  });

  // Initialize form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        username: user.username || user.email?.split('@')[0] || '',
        bio: user.bio || '',
        location: user.location || '',
        github: user.github || '',
        twitter: user.twitter || '',
        website: user.website || ''
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    // In a real app, you would make an API call here to save the user data
    // For now, we'll just update the local storage to simulate it
    const updatedUser = { ...user, ...editForm };
    localStorage.setItem('algoryth_user', JSON.stringify(updatedUser));
    
    // Force a reload to reflect changes (or you could update context)
    window.location.reload();
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('algoryth_token');
        if (!token) {
          const raw = localStorage.getItem('algoryth_submissions');
          const parsed = raw ? JSON.parse(raw) : [];
          setSubmissions(Array.isArray(parsed) ? parsed : []);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/submissions/history?limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch submissions: ${response.status}`);
        }

        const data = await response.json();
        setSubmissions(data.submissions || []);
        setStats(data.stats || {});
      } catch (e) {
        console.error('Failed to fetch submissions:', e);

        try {
          const raw = localStorage.getItem('algoryth_submissions');
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) setSubmissions(parsed);
        } catch (fallbackError) {
          console.error('Fallback failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubmissions();
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[600px] flex-col items-center justify-center text-center">
        <User className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Not Signed In</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to view your profile.</p>
        <Link 
          href="/auth" 
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Calculate some derived stats
  const totalSubmissions = submissions.length;
  const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;
  const acceptanceRate = totalSubmissions > 0 
    ? Math.round((acceptedSubmissions / totalSubmissions) * 100) 
    : 0;

  // Get unique days active
  const activeDays = new Set(submissions.map(s => new Date(s.timestamp).toDateString())).size;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl space-y-8 pb-24 pt-8 px-4 sm:px-6 lg:px-8"
    >
      {/* Profile Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#17171d] shadow-xl border border-gray-200 dark:border-gray-800">
        {/* Cover Banner */}
        <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
        </div>

        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 sm:-mt-20 mb-6">
            {/* Avatar */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white dark:border-[#17171d] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center shadow-lg overflow-hidden shrink-0"
            >
              <span className="text-5xl sm:text-6xl font-bold text-indigo-600 dark:text-indigo-300">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </motion.div>

            {/* User Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {user.name || 'Developer'}
                  </h1>
                  <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-1">
                    @{user.username || user.email?.split('@')[0] || 'user'}
                  </p>
                </div>
                
                <button 
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors self-start sm:self-auto"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              {isEditing ? (
                <div className="space-y-4 bg-gray-50 dark:bg-[#21212b] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                      <input 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#17171d] px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                      <input 
                        type="text" 
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#17171d] px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                    <textarea 
                      rows="3"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#17171d] px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                      <input 
                        type="text" 
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#17171d] px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                      <input 
                        type="url" 
                        value={editForm.website}
                        onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#17171d] px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub Username</label>
                      <input 
                        type="text" 
                        value={editForm.github}
                        onChange={(e) => setEditForm({...editForm, github: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#17171d] px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter Username</label>
                      <input 
                        type="text" 
                        value={editForm.twitter}
                        onChange={(e) => setEditForm({...editForm, twitter: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#17171d] px-4 py-2 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {user.bio || "Passionate developer solving algorithmic challenges and building awesome software. Always learning and exploring new technologies."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{user.location || 'Earth'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    {user.github && (
                      <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {user.twitter && (
                      <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {user.website && (
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-500 transition-colors">
                        <LinkIcon className="h-5 w-5" />
                      </a>
                    )}
                    {!user.github && !user.twitter && !user.website && (
                      <span className="text-sm text-gray-400 italic">No social links added yet.</span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gray-50 dark:bg-[#21212b] p-4 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{activeDays}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Active Days</span>
              </div>
              
              <div className="rounded-2xl bg-gray-50 dark:bg-[#21212b] p-4 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{acceptanceRate}%</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Acceptance</span>
              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-[#21212b] p-4 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{user.rating || 1200}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Rating</span>
              </div>

              <div className="rounded-2xl bg-gray-50 dark:bg-[#21212b] p-4 border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2">
                  <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{user.streak || 0}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-500" />
          Problem Solving Stats
        </h2>
        <DashboardStats submissions={submissions} stats={stats} />
      </div>

      {/* Recent Activity */}
      <div className="rounded-3xl bg-white dark:bg-[#17171d] shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1f1f27]">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <Link
            href="/submissions"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-200"
          >
            View all history →
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {submissions.length > 0 ? (
            submissions.slice(0, 10).map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-4 hover:bg-gray-50 dark:hover:bg-[#23232d] transition-colors gap-4 sm:gap-0"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    s.status === 'Accepted' 
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {s.status === 'Accepted' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  
                  <div className="min-w-0">
                    <Link href={`/problems/${s.problemId?.replace('p-', '') || ''}`} className="text-base font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors">
                      {s.problemTitle || s.problemId}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{s.language}</span>
                      <span>•</span>
                      <span>{new Date(s.timestamp).toLocaleString()}</span>
                      {s.runtime && (
                        <>
                          <span>•</span>
                          <span>{s.runtime}ms</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:ml-4 pl-14 sm:pl-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    s.status === 'Accepted'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                  }`}>
                    {s.status}
                  </span>
                  <Link
                    href={`/problems/${s.problemId?.replace('p-', '') || ''}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="px-8 py-16 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No activity yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                You haven&apos;t submitted any solutions yet. Start solving problems to build your profile!
              </p>
              <Link 
                href="/problems" 
                className="inline-block mt-6 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Explore Problems
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token and restore session on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('algoryth_token');
      
      if (token) {
        try {
          const res = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('algoryth_user', JSON.stringify(data.user));
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('algoryth_token');
            localStorage.removeItem('algoryth_user');
          }
        } catch (error) {
          console.error('Token verification error:', error);
        }
      }
      
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('algoryth_user', JSON.stringify(data.user));
        localStorage.setItem('algoryth_token', data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (res.ok) {
        // Note: Registration doesn't auto-login, user needs to login separately
        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('algoryth_user');
    localStorage.removeItem('algoryth_token');
  };

  // Fetch user profile
  const fetchProfile = async () => {
    const token = localStorage.getItem('algoryth_token');
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const res = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.profile);
        setUser(data.user);
        return { success: true, profile: data.profile };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    const token = localStorage.getItem('algoryth_token');
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.profile);
        return { success: true, profile: data.profile };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Submit code solution
  const submitCode = async (submissionData) => {
    const token = localStorage.getItem('algoryth_token');
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh profile to update stats
        await fetchProfile();
        return { success: true, submission: data.submission };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Submit code error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Get submissions with filters
  const getSubmissions = async (filters = {}) => {
    const token = localStorage.getItem('algoryth_token');
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/submissions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        return { success: true, submissions: data.submissions, pagination: data.pagination };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get submissions error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    user,
    profile,
    login,
    logout,
    signup,
    fetchProfile,
    updateProfile,
    submitCode,
    getSubmissions,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
'use client';

import { createContext, useCallback, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);

  const refreshUser = useCallback(
    async (tokenOverride) => {
      const activeToken = tokenOverride || token || localStorage.getItem('algoryth_token');
      if (!activeToken) return null;

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('algoryth_user', JSON.stringify(data.user));
          return data.user;
        }

        return null;
      } catch (error) {
        console.error('Failed to refresh user:', error);
        return null;
      }
    },
    [token]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem('algoryth_token');
    const storedUser = localStorage.getItem('algoryth_user');

    const timer = setTimeout(async () => {
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          await refreshUser(storedToken);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [refreshUser]);

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
        setToken(data.token);
        localStorage.setItem('algoryth_user', JSON.stringify(data.user));
        localStorage.setItem('algoryth_token', data.token);
        await refreshUser(data.token);
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
        if (data.token) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem('algoryth_user', JSON.stringify(data.user));
          localStorage.setItem('algoryth_token', data.token);
          await refreshUser(data.token);
          return { success: true, user: data.user, autoLoggedIn: true };
        }

        // Registration succeeded but session token not issued.
        return { success: true, user: data.user, autoLoggedIn: false };
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
    setToken(null);
    localStorage.removeItem('algoryth_user');
    localStorage.removeItem('algoryth_token');
  };

  const value = {
    user,
    token,
    login,
    logout,
    signup,
    refreshUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
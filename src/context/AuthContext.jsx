'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage or session storage
    const storedToken = localStorage.getItem('algoryth_token');
    const storedUser = localStorage.getItem('algoryth_user');
    
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // eslint-disable-line react-hooks/set-state-in-effect
        setToken(storedToken); // eslint-disable-line react-hooks/set-state-in-effect
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    setLoading(false);
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
        setToken(data.token);
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
        setUser(data.user);
        // In a real app, you might want to auto-login after registration
        // For now, we'll store the user data
        localStorage.setItem('algoryth_user', JSON.stringify(data.user));
        // You could also store a token if registration returns one
        return { success: true, user: data.user };
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
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
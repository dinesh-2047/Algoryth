/**
 * API Helper Utilities
 * Provides helper functions for making authenticated API requests
 */

/**
 * Get authorization header with token
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('algoryth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Make authenticated GET request
 */
export const authGet = async (url) => {
  try {
    const res = await fetch(url, {
      headers: {
        ...getAuthHeader(),
      },
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/**
 * Make authenticated POST request
 */
export const authPost = async (url, body) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/**
 * Make authenticated PUT request
 */
export const authPut = async (url, body) => {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/**
 * Make authenticated DELETE request
 */
export const authDelete = async (url) => {
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('algoryth_token');
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('algoryth_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

/**
 * Handle API errors with user-friendly messages
 */
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return fallbackMessage;
};

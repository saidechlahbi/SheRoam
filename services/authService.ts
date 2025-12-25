import { UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Token management
// Note: Storing tokens in localStorage provides convenience but has XSS vulnerability.
// The primary authentication is via HTTP-only cookies set by the server.
// localStorage is used as a backup for when cookies are not available.
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API call helper
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
};

// Auth functions
export const register = async (email: string, password: string, name?: string): Promise<{ user: UserProfile; token: string }> => {
  const data = await apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
};

export const login = async (email: string, password: string): Promise<{ user: UserProfile; token: string }> => {
  const data = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (data.token) {
    setToken(data.token);
  }
  
  return data;
};

export const loginWithGoogle = (): void => {
  // Redirect to Google OAuth
  window.location.href = `${API_URL}/api/auth/google`;
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const data = await apiCall('/api/auth/me');
    return data.user;
  } catch (error) {
    removeToken();
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await apiCall('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Handle OAuth callback (check for success parameter)
export const handleOAuthCallback = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const authSuccess = urlParams.get('auth');
  
  if (authSuccess === 'success') {
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }
  
  return false;
};

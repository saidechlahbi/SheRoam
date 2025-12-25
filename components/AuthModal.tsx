
import React, { useState, useEffect } from 'react';
import { X, Mail, Facebook, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

type AuthStep = 'SELECT' | 'EMAIL_SIGNUP' | 'EMAIL_SIGNIN';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [step, setStep] = useState<AuthStep>('SELECT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('SELECT');
      setEmail('');
      setPassword('');
      setName('');
      setError('');
      setIsLoading(null);
    }
  }, [isOpen]);

  // Check for OAuth callback token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const auth = params.get('auth');
    
    if (token && auth === 'success') {
      // Store token
      localStorage.setItem('authToken', token);
      
      // Fetch user profile
      fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            onLogin(data.user);
          }
        })
        .catch(err => console.error('Failed to fetch user:', err));
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onLogin]);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setIsLoading('Google');
    // Redirect to Google OAuth
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading('email');

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to sign up');
        setIsLoading(null);
        return;
      }

      // Store token
      localStorage.setItem('authToken', data.token);

      // Login user
      onLogin(data.user);
      setIsLoading(null);
    } catch (error) {
      console.error('Signup error:', error);
      setError('Network error. Please try again.');
      setIsLoading(null);
    }
  };

  const handleEmailSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 1) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading('email');

    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to sign in');
        setIsLoading(null);
        return;
      }

      // Store token
      localStorage.setItem('authToken', data.token);

      // Login user
      onLogin(data.user);
      setIsLoading(null);
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
      setIsLoading(null);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'EMAIL_SIGNUP':
        return (
          <form onSubmit={handleEmailSignup} className="space-y-4 animate-fade-in">
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                required
                autoFocus
              />
            </div>
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                required
                minLength={8}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-left">{error}</p>}
            <button 
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-medium hover:bg-rose-700 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading === 'email' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign Up'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('EMAIL_SIGNIN')}
              className="text-sm text-gray-500 hover:text-rose-600 transition"
            >
              Already have an account? Sign in
            </button>
          </form>
        );

      case 'EMAIL_SIGNIN':
        return (
          <form onSubmit={handleEmailSignin} className="space-y-4 animate-fade-in">
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                required
                autoFocus
              />
            </div>
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-left">{error}</p>}
            <button 
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-medium hover:bg-rose-700 transition flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading === 'email' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
            </button>
            <button 
              type="button"
              onClick={() => setStep('EMAIL_SIGNUP')}
              className="text-sm text-gray-500 hover:text-rose-600 transition"
            >
              Don't have an account? Sign up
            </button>
          </form>
        );

      case 'SELECT':
      default:
        return (
          <div className="space-y-4 animate-fade-in">
            <button 
              onClick={handleGoogleLogin}
              disabled={!!isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700 relative group overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
               {isLoading === 'Google' ? (
                 <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
               ) : (
                 <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                 </>
               )}
            </button>
            
            <button 
               onClick={() => setStep('EMAIL_SIGNUP')}
               disabled={!!isLoading}
               className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
               <Mail className="w-5 h-5" />
               <span>Sign Up with Email</span>
            </button>

            <div className="text-center">
              <button 
                onClick={() => setStep('EMAIL_SIGNIN')}
                className="text-sm text-gray-500 hover:text-rose-600 transition"
              >
                Already have an account? <span className="font-semibold">Sign in</span>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up overflow-hidden">
        <div className="flex items-center justify-between mb-6">
           {step !== 'SELECT' ? (
             <button onClick={() => setStep('SELECT')} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
                <ArrowLeft className="w-5 h-5" />
             </button>
           ) : <div />}
           
           <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            {step === 'EMAIL_SIGNIN' ? 'Welcome Back' : step === 'EMAIL_SIGNUP' ? 'Create Account' : 'Join SheRoam'}
          </h3>
          <p className="text-gray-500">
            {step === 'EMAIL_SIGNIN' ? 'Sign in to continue your journey' : 'Connect with travelers, share stories, and explore safely.'}
          </p>
        </div>

        {renderContent()}

        {step === 'SELECT' && (
          <div className="mt-8 text-center text-xs text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

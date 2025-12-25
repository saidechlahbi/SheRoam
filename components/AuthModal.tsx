
import React, { useState, useEffect } from 'react';
import { X, Mail, Facebook, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { UserProfile } from '../types';
import * as authService from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

type AuthStep = 'SELECT' | 'EMAIL_SIGNUP' | 'EMAIL_LOGIN';

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

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setIsLoading('Google');
    authService.loginWithGoogle();
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setIsLoading('email_signup');
    
    try {
      const { user } = await authService.register(email, password, name);
      onLogin(user);
      setIsLoading(null);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setIsLoading('email_login');
    
    try {
      const { user } = await authService.login(email, password);
      onLogin(user);
      setIsLoading(null);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm text-left">{error}</p>}
            <button 
              type="submit"
              disabled={!!isLoading}
              className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-medium hover:bg-rose-700 transition flex justify-center items-center disabled:opacity-70"
            >
              {isLoading === 'email_signup' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign Up'}
            </button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => { setStep('EMAIL_LOGIN'); setError(''); }}
                className="text-rose-600 font-medium hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        );

      case 'EMAIL_LOGIN':
        return (
          <form onSubmit={handleEmailLogin} className="space-y-4 animate-fade-in">
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
              className="w-full bg-rose-600 text-white py-3.5 rounded-xl font-medium hover:bg-rose-700 transition flex justify-center items-center disabled:opacity-70"
            >
              {isLoading === 'email_login' ? <Loader2 className="animate-spin w-5 h-5" /> : 'Sign In'}
            </button>
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => { setStep('EMAIL_SIGNUP'); setError(''); }}
                className="text-rose-600 font-medium hover:underline"
              >
                Sign Up
              </button>
            </div>
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
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <button 
               onClick={() => setStep('EMAIL_SIGNUP')}
               disabled={!!isLoading}
               className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
               {isLoading === 'Email' ? (
                 <Loader2 className="w-5 h-5 animate-spin text-white" />
               ) : (
                 <>
                  <Mail className="w-5 h-5" />
                  <span>Continue with Email</span>
                 </>
               )}
            </button>
            
            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => setStep('EMAIL_LOGIN')}
                className="text-rose-600 font-medium hover:underline"
              >
                Sign In
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
             <button onClick={() => { setStep('SELECT'); setError(''); }} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
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
            {step === 'EMAIL_SIGNUP' ? 'Create Account' : step === 'EMAIL_LOGIN' ? 'Welcome Back' : 'Join SheRoam'}
          </h3>
          <p className="text-gray-500">
            {step === 'EMAIL_SIGNUP' ? 'Sign up to start your journey.' : step === 'EMAIL_LOGIN' ? 'Sign in to continue your adventure.' : 'Connect with travelers, share stories, and explore safely.'}
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

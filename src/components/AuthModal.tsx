import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>('login');
  const { login, register, forgotPassword, resetPassword } = useAuth();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('user');
  const [resetToken, setResetToken] = useState('');

  // Status
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
    setUsername('');
    setRole('user');
    setResetToken('');
    setView('login');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (view === 'login') {
        const res = await login(email, password);
        if (res.success) {
          handleClose();
        } else {
          setError(res.message);
        }
      } else if (view === 'register') {
        const res = await register(username, email, password, role);
        if (res.success) {
          handleClose();
        } else {
          setError(res.message);
        }
      } else if (view === 'forgot') {
        const res = await forgotPassword(email);
        if (res.success) {
          setMessage(res.message || 'Password reset link generated.');
          // Prepopulate token for easy developer testing
          if (res.resetToken) {
            setResetToken(res.resetToken);
          }
        } else {
          setError(res.message);
        }
      } else if (view === 'reset') {
        const res = await resetPassword(resetToken, password);
        if (res.success) {
          setMessage(res.message || 'Password updated successfully! Please log in.');
          setView('login');
          setPassword('');
        } else {
          setError(res.message);
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[440px] bg-background border border-outline-variant/30 rounded-2xl shadow-xl z-10 overflow-hidden flex flex-col p-8 transition-transform duration-300 transform scale-100">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="mb-6">
          <h2 className="text-headline-md font-extrabold text-primary tracking-tight">
            {view === 'login' && 'Welcome Back'}
            {view === 'register' && 'Create Creator Account'}
            {view === 'forgot' && 'Reset Password'}
            {view === 'reset' && 'Set New Password'}
          </h2>
          <p className="text-[13px] text-on-secondary-container mt-1">
            {view === 'login' && 'Sign in to access library, likes, and comments.'}
            {view === 'register' && 'Join CreatorHub as a viewer or administrator.'}
            {view === 'forgot' && 'Provide your email to receive a recovery token.'}
            {view === 'reset' && 'Choose a strong password to recover your account.'}
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="bg-error-container text-error px-4 py-2.5 rounded-xl text-[13px] flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-surface-container text-primary px-4 py-2.5 rounded-xl text-[13px] font-medium mb-4">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Username (Register only) */}
          {view === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                Username
              </label>
              <div className="flex items-center bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 gap-2">
                <User className="w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  required
                  placeholder="creator_john"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent border-none outline-none text-label-md w-full placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>
          )}

          {/* Email (Login, Register, Forgot) */}
          {view !== 'reset' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                Email Address
              </label>
              <div className="flex items-center bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 gap-2">
                <Mail className="w-4 h-4 text-on-surface-variant" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none outline-none text-label-md w-full placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>
          )}

          {/* Reset Token (Reset only) */}
          {view === 'reset' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                Reset Token
              </label>
              <div className="flex items-center bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Paste reset token here"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="bg-transparent border-none outline-none text-label-md w-full placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>
          )}

          {/* Password (Login, Register, Reset) */}
          {view !== 'forgot' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Password
                </label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMessage(null);
                      setView('forgot');
                    }}
                    className="text-[12px] text-primary font-semibold hover:underline"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="flex items-center bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 gap-2">
                <Lock className="w-4 h-4 text-on-surface-variant" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none outline-none text-label-md w-full placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>
          )}

          {/* Role Select (Register only, convenient for testing admin features) */}
          {view === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30 outline-none text-label-md text-on-surface-variant"
              >
                <option value="user">User (Viewer)</option>
                <option value="admin">Admin (Publisher)</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-full text-label-md mt-2 transition-transform active:scale-95 flex items-center justify-center gap-2 hover:bg-primary-container"
          >
            {loading ? 'Processing...' : (
              view === 'login' ? 'Sign In' :
              view === 'register' ? 'Sign Up' :
              view === 'forgot' ? 'Send Reset Token' : 'Update Password'
            )}
          </button>
        </form>

        {/* View Toggles */}
        <div className="mt-6 border-t border-outline-variant/20 pt-6 text-center text-[13px] text-on-secondary-container">
          {view === 'login' && (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setView('register');
                }}
                className="text-primary font-bold hover:underline"
              >
                Sign Up
              </button>
            </span>
          )}

          {view === 'register' && (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setView('login');
                }}
                className="text-primary font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}

          {view === 'forgot' && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setView('login');
                }}
                className="text-primary font-bold hover:underline"
              >
                Back to Sign In
              </button>
              {resetToken && (
                <button
                  onClick={() => {
                    setError(null);
                    setMessage(null);
                    setView('reset');
                  }}
                  className="text-secondary font-bold hover:underline mt-2 text-[12px]"
                >
                  Have a reset token? Enter it here
                </button>
              )}
            </div>
          )}

          {view === 'reset' && (
            <button
              onClick={() => {
                setError(null);
                setMessage(null);
                setView('login');
              }}
              className="text-primary font-bold hover:underline"
            >
              Cancel and Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

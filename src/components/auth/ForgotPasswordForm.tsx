'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToSignIn?: () => void;
}

export default function ForgotPasswordForm({ onSuccess, onBackToSignIn }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateEmail()) {
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({ email });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError(null);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Check your email!</h3>
          <p className="text-green-700 mb-4">
            We&apos;ve sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-green-600 mb-6">
            Please check your email and click the link to reset your password.
          </p>
          <button
            type="button"
            onClick={onBackToSignIn}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600">Enter your email to receive a reset link</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 ml-3">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              emailError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="john@example.com"
          />
          {emailError && (
            <p className="text-red-600 text-sm mt-1">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Reset Link...
            </div>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBackToSignIn}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

type AuthMode = 'signin' | 'signup' | 'forgot-password';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-3 text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the auth forms if user is authenticated
  if (user) {
    return null;
  }

  const handleSignInSuccess = () => {
    router.push('/');
  };

  const handleSignUpSuccess = () => {
    // Stay on the page to show the email confirmation message
  };

  const handleForgotPasswordSuccess = () => {
    // Stay on the page to show the email sent message
  };

  const renderForm = () => {
    switch (mode) {
      case 'signin':
        return (
          <SignInForm
            onSuccess={handleSignInSuccess}
            onSwitchToSignUp={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot-password')}
          />
        );
      case 'signup':
        return (
          <SignUpForm
            onSuccess={handleSignUpSuccess}
            onSwitchToSignIn={() => setMode('signin')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSuccess={handleForgotPasswordSuccess}
            onBackToSignIn={() => setMode('signin')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4 shadow-lg border border-white/30">
              <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Schedz
            </h1>
          </div>
        </div>

        {/* Auth Form */}
        {renderForm()}

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
} 
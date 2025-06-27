'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  onClose?: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, signOut, updatePassword, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const result = await signOut();
      if (result.error) {
        setError(result.error.message);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!passwordData.password) {
      errors.password = 'Password is required';
    } else if (passwordData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.password !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validatePasswordForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await updatePassword({ password: passwordData.password });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess('Password updated successfully!');
        setPasswordData({ password: '', confirmPassword: '' });
        setShowPasswordForm(false);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const result = await deleteAccount();
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess('Account data deleted successfully. You have been signed out.');
        // Close the modal after a short delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!user) {
    return null;
  }

  const userFullName = user.user_metadata?.full_name || user.email;
  const userFirstName = user.user_metadata?.first_name || '';
  const userLastName = user.user_metadata?.last_name || '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-700 ml-3">{success}</p>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {userFullName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{userFullName}</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">First Name:</span>
              <span className="text-gray-900">{userFirstName || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Name:</span>
              <span className="text-gray-900">{userLastName || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member since:</span>
              <span className="text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Password Change Form */}
        {showPasswordForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {passwordErrors.password && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full text-left px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </div>
          </button>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full text-left px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </div>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-left px-4 py-3 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </div>
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                This will delete all your activities and sign you out. Your account data will be permanently removed. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
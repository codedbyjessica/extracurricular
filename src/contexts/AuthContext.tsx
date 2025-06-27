'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { authService, SignUpData, SignInData, ResetPasswordData, UpdatePasswordData, AuthError } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (data: SignInData) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (data: ResetPasswordData) => Promise<{ error: AuthError | null }>;
  updatePassword: (data: UpdatePasswordData) => Promise<{ error: AuthError | null }>;
  deleteAccount: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: SignUpData) => {
    const result = await authService.signUp(data);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signIn = async (data: SignInData) => {
    const result = await authService.signIn(data);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signOut = async () => {
    const result = await authService.signOut();
    if (!result.error) {
      setUser(null);
    }
    return result;
  };

  const resetPassword = async (data: ResetPasswordData) => {
    return await authService.resetPassword(data);
  };

  const updatePassword = async (data: UpdatePasswordData) => {
    return await authService.updatePassword(data);
  };

  const deleteAccount = async () => {
    const result = await authService.deleteAccount();
    if (!result.error) {
      setUser(null);
    }
    return result;
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export const authService = {
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
          }
        }
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.name } };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during sign up' } 
      };
    }
  },

  // Sign in with email and password
  async signIn(data: SignInData): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.name } };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during sign in' } 
      };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred during sign out' } 
      };
    }
  },

  // Send password reset email
  async resetPassword(data: ResetPasswordData): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred while sending reset email' } 
      };
    }
  },

  // Update password (for authenticated users)
  async updatePassword(data: UpdatePasswordData): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred while updating password' } 
      };
    }
  },

  // Delete account (client-side approach - deletes data and signs out)
  async deleteAccount(): Promise<{ error: AuthError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: { message: 'No user found' } };
      }

      // Delete all user's activities
      const { error: activitiesError } = await supabase
        .from('activities')
        .delete()
        .eq('user_id', user.id);

      if (activitiesError) {
        console.error('Error deleting user activities:', activitiesError);
        return { error: { message: 'Failed to delete user data. Please try again.' } };
      }

      // Sign out the user (this will clear their session)
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        return { error: { message: signOutError.message, code: signOutError.name } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred while deleting account' } 
      };
    }
  },

  // Get user profile
  async getUserProfile(): Promise<{ profile: any; error: AuthError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { profile: null, error: { message: 'No user found' } };
      }

      return { profile: user.user_metadata, error: null };
    } catch (error) {
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while fetching profile' } 
      };
    }
  },

  // Update user profile
  async updateProfile(updates: { firstName?: string; lastName?: string }): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: updates.firstName,
          last_name: updates.lastName,
          full_name: updates.firstName && updates.lastName 
            ? `${updates.firstName} ${updates.lastName}` 
            : undefined,
        }
      });

      if (error) {
        return { error: { message: error.message, code: error.name } };
      }

      return { error: null };
    } catch (error) {
      return { 
        error: { message: 'An unexpected error occurred while updating profile' } 
      };
    }
  }
}; 
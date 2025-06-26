import { supabase } from '@/lib/supabase';
import { Activity } from '@/types/activity';

export const activityService = {
  // Get all activities
  async getActivities(): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
    
    return data || [];
  },

  // Add a new activity
  async addActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
    
    return data;
  },

  // Update an activity
  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
    
    return data;
  },

  // Delete an activity
  async deleteActivity(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  // Update activity dates
  async updateActivityDates(id: string, dates: string[], notesDates?: Record<string, string>): Promise<Activity> {
    const updates: Partial<Activity> = { dates };
    if (notesDates !== undefined) {
      updates.notesDates = notesDates;
    }
    
    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating activity dates:', error);
      throw error;
    }
    
    return data;
  }
}; 
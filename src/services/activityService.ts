import { supabase } from '@/lib/supabase';
import { Activity } from '@/types/activity';

// Interface for database row
interface DbRow {
  id: string;
  user_id: string;
  name: string;
  attendee: string;
  dates: string[];
  start_time: string;
  end_time: string;
  location?: string;
  contact?: string;
  website?: string;
  notes?: string;
  notes_dates?: Record<string, string>;
  unconfirmed?: boolean;
}

// Helper function to convert database row to Activity
const mapDbRowToActivity = (row: DbRow): Activity => ({
  id: row.id,
  user_id: row.user_id,
  name: row.name.charAt(0).toUpperCase() + row.name.slice(1), // capitalize first letter
  attendee: row.attendee.charAt(0).toUpperCase() + row.attendee.slice(1), // capitalize first letter
  dates: row.dates || [],
  startTime: row.start_time,
  endTime: row.end_time,
  location: row.location || '',
  contact: row.contact || '',
  website: row.website || '',
  notes: row.notes || '',
  notesDates: row.notes_dates || {},
  unconfirmed: row.unconfirmed || false
});

// Helper function to convert Activity to database row
const mapActivityToDbRow = (activity: Omit<Activity, 'id'>) => ({
  user_id: activity.user_id,
  name: activity.name,
  attendee: activity.attendee,
  dates: activity.dates,
  start_time: activity.startTime,
  end_time: activity.endTime,
  location: activity.location,
  contact: activity.contact,
  website: activity.website,
  notes: activity.notes,
  notes_dates: activity.notesDates || {},
  unconfirmed: activity.unconfirmed || false
});

export const activityService = {
  // Get all activities (optionally filter by user_id)
  async getActivities(user_id?: string): Promise<Activity[]> {
    let query = supabase
      .from('activities')
      .select('*')
      .order('name');
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
    return (data || []).map(mapDbRowToActivity);
  },

  // Add a new activity (requires user_id)
  async addActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
    if (!activity.user_id) throw new Error('user_id is required');
    const dbRow = mapActivityToDbRow(activity);
    const { data, error } = await supabase
      .from('activities')
      .insert([dbRow])
      .select()
      .single();
    if (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
    return mapDbRowToActivity(data);
  },

  // Update an activity
  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    // Convert camelCase updates to snake_case for database
    const dbUpdates: Record<string, string | string[] | boolean | Record<string, string>> = {};
    if (updates.user_id !== undefined) dbUpdates.user_id = updates.user_id;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.attendee !== undefined) dbUpdates.attendee = updates.attendee;
    if (updates.dates !== undefined) dbUpdates.dates = updates.dates;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.notesDates !== undefined) dbUpdates.notes_dates = updates.notesDates;
    if (updates.unconfirmed !== undefined) dbUpdates.unconfirmed = updates.unconfirmed;
    const { data, error } = await supabase
      .from('activities')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
    return mapDbRowToActivity(data);
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
  async updateActivityDates(id: string, dates: string[], notesDates?: Record<string, string>, user_id?: string): Promise<Activity> {
    const updates: Partial<Activity> = { dates };
    if (notesDates) {
      updates.notesDates = notesDates;
    }
    if (user_id) {
      updates.user_id = user_id;
    }
    return this.updateActivity(id, updates);
  }
}; 
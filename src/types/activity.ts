export interface Activity {
  id: string;
  user_id: string; // Supabase UID of the user
  name: string;
  attendee: string; // Person this activity is for
  dates: string[]; // ISO date strings for scheduled days
  startTime: string;
  endTime: string;
  location: string;
  contact?: string;
  website?: string;
  notes?: string;
  notesDates?: Record<string, string>; // Maps date strings to notes for specific dates
  unconfirmed?: boolean; // Whether the activity is confirmed or not
}

export interface WeekendSchedule {
  saturday: Activity[];
  sunday: Activity[];
}

export interface TimeSlot {
  time: string;
  activities: Activity[];
} 
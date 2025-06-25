export interface Activity {
  id: string;
  name: string;
  dates: string[]; // ISO date strings for scheduled days
  startTime: string;
  endTime: string;
  location: string;
  contact: string;
  notes?: string;
  notesDates?: Record<string, string>; // Maps date strings to notes for specific dates
}

export interface WeekendSchedule {
  saturday: Activity[];
  sunday: Activity[];
}

export interface TimeSlot {
  time: string;
  activities: Activity[];
} 
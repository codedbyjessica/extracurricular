import { Activity } from '@/types/activity';

export function getWeekendDates(): { saturday: Date; sunday: Date } {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  let saturday: Date;
  let sunday: Date;
  
  if (currentDay === 0) { // Sunday
    saturday = new Date(today);
    saturday.setDate(today.getDate() - 1);
    sunday = today;
  } else if (currentDay === 6) { // Saturday
    saturday = today;
    sunday = new Date(today);
    sunday.setDate(today.getDate() + 1);
  } else { // Monday to Friday
    const daysUntilSaturday = 6 - currentDay;
    saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSaturday);
    sunday = new Date(saturday);
    sunday.setDate(saturday.getDate() + 1);
  }
  
  return { saturday, sunday };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(time: string): string {
  return time;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function hasTimeConflict(activity1: any, activity2: any): boolean {
  if (activity1.day !== activity2.day) return false;
  
  const start1 = timeToMinutes(activity1.startTime);
  const end1 = timeToMinutes(activity1.endTime);
  const start2 = timeToMinutes(activity2.startTime);
  const end2 = timeToMinutes(activity2.endTime);
  
  return (start1 < end2 && end1 > start2);
}

export function hasTimeConflictOnDate(activity1: Activity, activity2: Activity, date: string): boolean {
  // Check if both activities occur on the same date
  if (!activity1.dates.includes(date) || !activity2.dates.includes(date)) {
    return false;
  }
  
  const start1 = timeToMinutes(activity1.startTime);
  const end1 = timeToMinutes(activity1.endTime);
  const start2 = timeToMinutes(activity2.startTime);
  const end2 = timeToMinutes(activity2.endTime);
  
  return (start1 < end2 && end1 > start2);
}

export function getConflictingActivities(activities: Activity[], date: string): Activity[] {
  const conflictingActivities: Activity[] = [];
  
  for (let i = 0; i < activities.length; i++) {
    for (let j = i + 1; j < activities.length; j++) {
      if (hasTimeConflictOnDate(activities[i], activities[j], date)) {
        if (!conflictingActivities.includes(activities[i])) {
          conflictingActivities.push(activities[i]);
        }
        if (!conflictingActivities.includes(activities[j])) {
          conflictingActivities.push(activities[j]);
        }
      }
    }
  }
  
  return conflictingActivities;
} 
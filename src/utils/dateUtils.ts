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

export function hasTimeConflict(activity1: Activity, activity2: Activity): boolean {
  if (activity1.dates.length === 0 || activity2.dates.length === 0) return false;
  
  // Check if activities have overlapping dates
  const commonDates = activity1.dates.filter(date => activity2.dates.includes(date));
  if (commonDates.length === 0) return false;
  
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

function doTimeSlotsOverlap(timeSlot1: string, timeSlot2: string): boolean {
  const [start1, end1] = timeSlot1.split('-');
  const [start2, end2] = timeSlot2.split('-');
  
  // Convert times to minutes for easier comparison
  const start1Minutes = timeToMinutes(start1);
  const end1Minutes = timeToMinutes(end1);
  const start2Minutes = timeToMinutes(start2);
  const end2Minutes = timeToMinutes(end2);
  
  // Check if time slots overlap
  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

export function getConflictingActivities(activities: Activity[], date: string): Activity[] {
  const activitiesOnDate = activities.filter(activity => 
    activity.dates.includes(date)
  );

  if (activitiesOnDate.length <= 1) {
    return [];
  }

  // Group activities by time slots and find conflicts
  const timeSlots = new Map<string, Activity[]>();
  
  activitiesOnDate.forEach(activity => {
    const timeKey = `${activity.startTime}-${activity.endTime}`;
    if (!timeSlots.has(timeKey)) {
      timeSlots.set(timeKey, []);
    }
    timeSlots.get(timeKey)!.push(activity);
  });

  // Find overlapping time slots
  const conflicts: Activity[] = [];
  const timeSlotArray = Array.from(timeSlots.entries());
  
  for (let i = 0; i < timeSlotArray.length; i++) {
    for (let j = i + 1; j < timeSlotArray.length; j++) {
      const [timeSlot1, activities1] = timeSlotArray[i];
      const [timeSlot2, activities2] = timeSlotArray[j];
      
      if (doTimeSlotsOverlap(timeSlot1, timeSlot2)) {
        conflicts.push(...activities1, ...activities2);
      }
    }
  }

  return conflicts;
} 
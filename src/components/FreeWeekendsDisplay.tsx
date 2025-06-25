'use client';

import { Activity } from '@/types/activity';

interface FreeWeekendsDisplayProps {
  activities: Activity[];
  currentPageWeeks: { 
    monday: Date; 
    tuesday: Date; 
    wednesday: Date; 
    thursday: Date; 
    friday: Date; 
    saturday: Date; 
    sunday: Date; 
  }[];
}

export default function FreeWeekendsDisplay({ activities, currentPageWeeks }: FreeWeekendsDisplayProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get date string in local timezone
  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Detect free weekends for the current page range
  const getFreeWeekends = () => {
    const freeDays: { day: string; date: string }[] = [];
    
    currentPageWeeks.forEach(week => {
      const saturdayStr = getDateString(week.saturday);
      const sundayStr = getDateString(week.sunday);
      
      // Check if there are any activities on Saturday or Sunday
      const hasSaturdayActivity = activities.some(activity => 
        activity.dates.includes(saturdayStr)
      );
      const hasSundayActivity = activities.some(activity => 
        activity.dates.includes(sundayStr)
      );
      
      // If Saturday has no activities, add it to free days
      if (!hasSaturdayActivity) {
        freeDays.push({ day: 'Sat', date: formatDate(week.saturday) });
      }
      
      // If Sunday has no activities, add it to free days
      if (!hasSundayActivity) {
        freeDays.push({ day: 'Sun', date: formatDate(week.sunday) });
      }
    });
    
    return freeDays;
  };

  const freeWeekends = getFreeWeekends();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="text-sm font-medium text-gray-700 mb-2">Free weekend days in current range:</div>
      {freeWeekends.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {freeWeekends.map((day, index) => (
            <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {day.day} {day.date}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500">No free weekend days in current range</div>
      )}
    </div>
  );
} 
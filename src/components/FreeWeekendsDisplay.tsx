'use client';

import { Activity } from '@/types/activity';
import { formatDateWithYear, getDateString } from '@/utils/commonUtils';

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
  // Detect free weekends for the current page range
  const getFreeWeekends = () => {
    const freeDays: { day: string; date: string }[] = [];
    const unconfirmedDays: { day: string; date: string; activityName: string }[] = [];
    
    currentPageWeeks.forEach(week => {
      const saturdayStr = getDateString(week.saturday);
      const sundayStr = getDateString(week.sunday);
      
      // Check for confirmed activities on Saturday or Sunday
      const saturdayActivities = activities.filter(activity => 
        activity.dates.includes(saturdayStr) && !activity.unconfirmed
      );
      const sundayActivities = activities.filter(activity => 
        activity.dates.includes(sundayStr) && !activity.unconfirmed
      );
      
      // Check for unconfirmed activities
      const saturdayUnconfirmed = activities.filter(activity => 
        activity.dates.includes(saturdayStr) && activity.unconfirmed
      );
      const sundayUnconfirmed = activities.filter(activity => 
        activity.dates.includes(sundayStr) && activity.unconfirmed
      );
      
      // If Saturday has no confirmed activities AND no unconfirmed activities, add it to free days
      if (saturdayActivities.length === 0 && saturdayUnconfirmed.length === 0) {
        freeDays.push({ day: 'Sat', date: formatDateWithYear(week.saturday) });
      }
      
      // If Sunday has no confirmed activities AND no unconfirmed activities, add it to free days
      if (sundayActivities.length === 0 && sundayUnconfirmed.length === 0) {
        freeDays.push({ day: 'Sun', date: formatDateWithYear(week.sunday) });
      }
      
      // Add unconfirmed activities to separate list
      saturdayUnconfirmed.forEach(activity => {
        unconfirmedDays.push({ 
          day: 'Sat', 
          date: formatDateWithYear(week.saturday), 
          activityName: activity.name 
        });
      });
      
      sundayUnconfirmed.forEach(activity => {
        unconfirmedDays.push({ 
          day: 'Sun', 
          date: formatDateWithYear(week.sunday), 
          activityName: activity.name 
        });
      });
    });
    
    return { freeDays, unconfirmedDays };
  };

  const { freeDays, unconfirmedDays } = getFreeWeekends();

  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-800 mb-4 text-center">Weekend Status (within current date range)</h3>
      
      {/* Free Weekends */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Free Weekend Days</h4>
        {freeDays.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {freeDays.map((day, index) => (
              <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {day.day} {day.date}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500">No free weekend days in current range</div>
        )}
      </div>
      
      {/* Unconfirmed Activities */}
      {unconfirmedDays.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Unconfirmed Weekend days</h4>
          <div className="flex flex-wrap gap-2">
            {unconfirmedDays.map((day, index) => (
              <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                {day.day} {day.date} - {day.activityName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
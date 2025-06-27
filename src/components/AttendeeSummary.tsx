'use client';

import { Activity } from '@/types/activity';
import { getDateString, formatTime12Hour, getDayOfWeek, getDayOfWeekIndex } from '@/utils/commonUtils';

interface AttendeeSummaryProps {
  activities: Activity[];
}

export default function AttendeeSummary({ activities }: AttendeeSummaryProps) {
  console.log(activities);
  // Get current date for comparison
  const today = new Date();
  const todayString = getDateString(today);

  // Filter activities that are active (not ended before today)
  const activeActivities = activities.filter(activity => {
    if (activity.dates.length === 0) return false;
    
    // Get the last date of this activity
    const sortedDates = [...activity.dates].sort();
    const lastActivityDate = sortedDates[sortedDates.length - 1];
    
    // Only include if the activity hasn't ended before today
    return lastActivityDate >= todayString;
  });

  // Group activities by attendee
  const attendeeGroups = activeActivities.reduce((groups, activity) => {
    const attendee = activity.attendee || 'Unknown';
    if (!groups[attendee]) {
      groups[attendee] = [];
    }
    groups[attendee].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  // Sort activities by day of week and then by time
  const sortActivities = (activities: Activity[]): Activity[] => {
    return activities.sort((a, b) => {
      // First sort by day of week
      const dayA = getDayOfWeekIndex(a.dates[0] || '');
      const dayB = getDayOfWeekIndex(b.dates[0] || '');
      
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      // If same day, sort by start time
      return a.startTime.localeCompare(b.startTime);
    });
  };

  if (Object.keys(attendeeGroups).length === 0) {
    return (
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">No active activities found</div>
        <div className="text-xs text-gray-500">All activities have ended or no activities are scheduled</div>
      </div>
    );
  }

  return (
    <div>
      
      <h3 className="text-lg font-semibold text-neutral-800 mb-4 text-center">Attendee Summary</h3>
      <div className="space-y-4">
        {Object.entries(attendeeGroups).map(([attendee, attendeeActivities]) => (
          <div key={attendee}>
            <div className="text-left font-semibold text-gray-800 mb-2 underline">{attendee}</div>
            <div className="space-y-2 text-left">
              {sortActivities(attendeeActivities).map(activity => {
                
                return (
                  <div key={activity.id} className={`flex items-center justify-between text-sm ${activity.unconfirmed ? 'opacity-50' : ''}`}>
                    <div className="flex-1">
                      <span className="font-bold text-gray-700">{activity.name}</span> {activity.unconfirmed && <span className="text-xs">(unconfirmed)</span>}
                      <br />
                      <span className="text-gray-500 ml-2">
                        {getDayOfWeek(activity.dates[0] || '')} • {formatTime12Hour(activity.startTime)} - {formatTime12Hour(activity.endTime)}
                      </span> 
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
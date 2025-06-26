'use client';

import { Activity } from '@/types/activity';

interface AttendeeSummaryProps {
  activities: Activity[];
}

export default function AttendeeSummary({ activities }: AttendeeSummaryProps) {
  console.log(activities);
  // Helper function to get date string in local timezone
  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  // Format time to 12-hour format
  const formatTime12Hour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Get day of week for an activity
  const getDayOfWeek = (activity: Activity): string => {
    if (activity.dates.length === 0) return 'No dates';
    
    // Parse the date string properly in local timezone
    const [year, month, day] = activity.dates[0].split('-').map(Number);
    const firstDate = new Date(year, month - 1, day); // month is 0-indexed, creates date in local timezone
    return firstDate.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Get day of week index for sorting (0 = Monday, 1 = Tuesday, etc.)
  const getDayOfWeekIndex = (activity: Activity): number => {
    if (activity.dates.length === 0) return 7; // Put activities with no dates at the end
    
    // Parse the date string properly in local timezone
    const [year, month, day] = activity.dates[0].split('-').map(Number);
    const firstDate = new Date(year, month - 1, day); // month is 0-indexed, creates date in local timezone
    const dayOfWeek = firstDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Convert to Monday-first (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  // Sort activities by day of week and then by time
  const sortActivities = (activities: Activity[]): Activity[] => {
    return activities.sort((a, b) => {
      // First sort by day of week
      const dayA = getDayOfWeekIndex(a);
      const dayB = getDayOfWeekIndex(b);
      
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
                        {getDayOfWeek(activity)} • {formatTime12Hour(activity.startTime)} - {formatTime12Hour(activity.endTime)}
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
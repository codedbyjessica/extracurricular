'use client';

import { Activity } from '@/types/activity';
import { formatTime } from '@/utils/dateUtils';

interface ActivityCardProps {
  activity: Activity;
  hasConflict: boolean;
  isFreeDay: boolean;
}

export default function ActivityCard({ activity, hasConflict, isFreeDay }: ActivityCardProps) {
  const getDuration = () => {
    const start = new Date(`2000-01-01T${activity.startTime}:00`);
    const end = new Date(`2000-01-01T${activity.endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `${diffMinutes}m`;
    } else if (diffMinutes === 0) {
      return `${diffHours}h`;
    } else {
      return `${diffHours}h ${diffMinutes}m`;
    }
  };

  if (isFreeDay) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center text-green-700 font-medium">
          Free Time
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
      hasConflict 
        ? 'bg-red-50 border-red-300 shadow-sm' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-lg ${
          hasConflict ? 'text-red-700' : 'text-gray-800'
        }`}>
          {activity.name}
        </h3>
        <span className={`text-sm px-2 py-1 rounded-full ${
          hasConflict 
            ? 'bg-red-100 text-red-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {getDuration()}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(activity.startTime)} - {formatTime(activity.endTime)}</span>
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{activity.location}</span>
        </div>
        
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{activity.contact}</span>
        </div>
        
        {activity.notes && (
          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-gray-500 italic">{activity.notes}</span>
          </div>
        )}
      </div>
      
      {hasConflict && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-xs">
          ⚠️ Time conflict detected
        </div>
      )}
    </div>
  );
} 
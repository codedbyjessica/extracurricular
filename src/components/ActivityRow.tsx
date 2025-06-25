'use client';

import { Activity } from '@/types/activity';
import ActivityDetails from './ActivityDetails';

interface ActivityRowProps {
  activity: Activity;
  weekends: { saturday: Date; sunday: Date }[];
  dayType: 'saturday' | 'sunday';
  colorIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  getActivityColor: (idx: number) => string;
}

export default function ActivityRow({
  activity,
  weekends,
  dayType,
  colorIndex,
  isExpanded,
  onToggle,
  getActivityColor
}: ActivityRowProps) {
  return (
    <div>
      <div className="flex border-b last:border-b-0 hover:bg-gray-50 transition-colors">
        <div 
          className="flex-shrink-0 w-[200px] p-4 font-medium text-gray-900 flex items-center cursor-pointer"
          onClick={onToggle}
        >
          {activity.name}
          <svg 
            className={`w-4 h-4 ml-2 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <div className="flex-shrink-0 w-[120px] p-4 text-gray-700 text-sm">
          {activity.startTime} - {activity.endTime}
        </div>
        {/* Scrollable weekend columns */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {weekends.map((w, widx) => {
              const dateStr = dayType === 'saturday' 
                ? w.saturday.toISOString().slice(0, 10)
                : w.sunday.toISOString().slice(0, 10);
              const isActive = activity.dates.includes(dateStr);
              return (
                <div
                  key={widx}
                  className={`h-8 rounded flex items-center justify-center min-w-[120px] mx-2 ${
                    isActive ? getActivityColor(colorIndex) + ' font-semibold' : 'bg-gray-50'
                  }`}
                >
                  {/* No checkmark, just color */}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Accordion Details */}
      {isExpanded && <ActivityDetails activity={activity} />}
    </div>
  );
} 
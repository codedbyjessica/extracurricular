'use client';

import { Activity } from '@/types/activity';

interface ActivityDetailsProps {
  activity: Activity;
}

export default function ActivityDetails({ activity }: ActivityDetailsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <div className="font-medium text-gray-700">Location</div>
            <div className="text-gray-600">{activity.location}</div>
          </div>
        </div>
        <div className="flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div>
            <div className="font-medium text-gray-700">Contact</div>
            <div className="text-gray-600">{activity.contact}</div>
          </div>
        </div>
        <div className="flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <div className="font-medium text-gray-700">General Notes</div>
            <div className="text-gray-600">{activity.notes || 'No general notes'}</div>
          </div>
        </div>
      </div>
      
      {/* Date-specific notes */}
      {activity.dateNotes && Object.keys(activity.dateNotes).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="font-medium text-gray-700">Date-Specific Notes</div>
          </div>
          <div className="space-y-2">
            {Object.entries(activity.dateNotes).map(([date, note]) => (
              <div key={date} className="bg-white p-3 rounded border border-gray-200">
                <div className="font-medium text-sm text-gray-800 mb-1">
                  {formatDate(date)}
                </div>
                <div className="text-sm text-gray-600">
                  {note}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
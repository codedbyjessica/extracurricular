'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';

interface ActivityDetailsProps {
  activity: Activity;
  onUpdateActivity?: (activityId: string, updates: Partial<Activity>) => void;
}

export default function ActivityDetails({ activity, onUpdateActivity }: ActivityDetailsProps) {
  const [editing, setEditing] = useState<{
    location: boolean;
    contact: boolean;
    website: boolean;
    notes: boolean;
  }>({
    location: false,
    contact: false,
    website: false,
    notes: false
  });

  const [editValues, setEditValues] = useState({
    location: activity.location || '',
    contact: activity.contact || '',
    website: activity.website || '',
    notes: activity.notes || ''
  });

  const handleEdit = (field: keyof typeof editing) => {
    setEditing(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = (field: keyof typeof editing) => {
    if (onUpdateActivity) {
      onUpdateActivity(activity.id, { [field]: editValues[field] });
    }
    setEditing(prev => ({ ...prev, [field]: false }));
  };

  const handleCancel = (field: keyof typeof editing) => {
    setEditValues(prev => ({
      ...prev,
      [field]: activity[field as keyof Activity] || ''
    }));
    setEditing(prev => ({ ...prev, [field]: false }));
  };

  const handleChange = (field: keyof typeof editValues, value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateWithDay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get start and end dates
  const getStartAndEndDates = () => {
    if (activity.dates.length === 0) return { startDate: null, endDate: null };
    
    const sortedDates = [...activity.dates].sort();
    return {
      startDate: sortedDates[0],
      endDate: sortedDates[sortedDates.length - 1]
    };
  };

  // Get gaps in the schedule
  const getGaps = () => {
    if (activity.dates.length < 2) return [];
    
    const sortedDates = [...activity.dates].sort();
    const startDate = new Date(sortedDates[0]);
    const endDate = new Date(sortedDates[sortedDates.length - 1]);
    const dayOfWeek = startDate.getDay();
    
    const gaps: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      
      // Check if this date is the same day of the week as the activity
      if (currentDate.getDay() === dayOfWeek) {
        // If it's not in the planned dates, it's a gap
        if (!activity.dates.includes(dateStr)) {
          gaps.push(dateStr);
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return gaps;
  };

  const { startDate, endDate } = getStartAndEndDates();
  const gaps = getGaps();
  const sortedDates = [...activity.dates].sort();

  return (
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
        <div className="flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-gray-700">Location</div>
              {!editing.location && (
                <button
                  onClick={() => handleEdit('location')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
            </div>
            {editing.location ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editValues.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter location"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave('location')}
                    className="px-2 py-1 text-xs bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded hover:from-blue-700 hover:to-teal-600 transition-all duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleCancel('location')}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">{activity.location || 'No location specified'}</div>
            )}
          </div>
        </div>
        <div className="flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-gray-700">Contact</div>
              {!editing.contact && (
                <button
                  onClick={() => handleEdit('contact')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
            </div>
            {editing.contact ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editValues.contact}
                  onChange={(e) => handleChange('contact', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter contact information"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave('contact')}
                    className="px-2 py-1 text-xs bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded hover:from-blue-700 hover:to-teal-600 transition-all duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleCancel('contact')}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">{activity.contact || 'No contact specified'}</div>
            )}
          </div>
        </div>
        <div className="flex items-start">
          <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
          </svg>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="font-bold text-gray-700">Website</div>
              {!editing.website && (
                <button
                  onClick={() => handleEdit('website')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
            </div>
            {editing.website ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editValues.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter website URL"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSave('website')}
                    className="px-2 py-1 text-xs bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded hover:from-blue-700 hover:to-teal-600 transition-all duration-200"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleCancel('website')}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                {activity.website ? (
                  <a 
                    href={activity.website.startsWith('http') ? activity.website : `https://${activity.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {activity.website}
                  </a>
                ) : (
                  'No website specified'
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* General Notes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">General Notes</h4>
          {!editing.notes && (
            <button
              onClick={() => handleEdit('notes')}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
        </div>
        {editing.notes ? (
          <div className="space-y-2">
            <textarea
              value={editValues.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter general notes"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleSave('notes')}
                className="px-3 py-1 text-xs bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded hover:from-blue-700 hover:to-teal-600 transition-all duration-200"
              >
                Save
              </button>
              <button
                onClick={() => handleCancel('notes')}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-3 rounded border border-gray-200">
            <div className="text-gray-600">{activity.notes || 'No general notes'}</div>
          </div>
        )}
      </div>

      {/* Schedule Information */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Schedule Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="font-medium text-gray-700">Start Date</div>
              <div className="text-gray-600">
                {startDate ? formatDateWithDay(startDate) : 'No dates scheduled'}
              </div>
            </div>
          </div>
          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <div className="font-medium text-gray-700">End Date</div>
              <div className="text-gray-600">
                {endDate ? formatDateWithDay(endDate) : 'No dates scheduled'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Dates */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Planned Dates ({sortedDates.length} session{sortedDates.length === 1 ? '' : 's'})</h4>
        <div className="bg-white p-3 rounded border border-gray-200 max-h-32 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {sortedDates.map((date) => (
              <div key={date} className="text-gray-600">
                {formatDateWithDay(date)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gaps in Schedule */}
      {gaps.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Gaps in Schedule ({gaps.length} session{gaps.length === 1 ? '' : 's'})</h4>
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200 max-h-32 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
              {gaps.map((date) => (
                <div key={date} className="text-yellow-700">
                  {formatDateWithDay(date)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Date-specific notes */}
      {activity.notesDates && Object.keys(activity.notesDates).length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="font-semibold text-gray-700">Date-Specific Notes</div>
          </div>
          <div className="space-y-3">
            {Object.entries(activity.notesDates).map(([date, note]) => (
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
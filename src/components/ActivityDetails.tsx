'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';

interface ActivityDetailsProps {
  activity: Activity;
  onUpdateActivity?: (activityId: string, updates: Partial<Activity>) => void;
  onDeleteActivity?: (activityId: string) => void;
}

export default function ActivityDetails({ activity, onUpdateActivity, onDeleteActivity }: ActivityDetailsProps) {
  const [editing, setEditing] = useState<{
    attendee: boolean;
    location: boolean;
    contact: boolean;
    website: boolean;
    notes: boolean;
    unconfirmed: boolean;
  }>({
    attendee: false,
    location: false,
    contact: false,
    website: false,
    notes: false,
    unconfirmed: false
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editValues, setEditValues] = useState({
    attendee: activity.attendee || '',
    location: activity.location || '',
    contact: activity.contact || '',
    website: activity.website || '',
    notes: activity.notes || '',
    unconfirmed: activity.unconfirmed || false
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

  const handleChange = (field: keyof typeof editValues, value: string | boolean) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  // Nested EditableField component that can access state directly
  const EditableField = ({ 
    icon, 
    label, 
    field, 
    placeholder,
    isWebsite = false
  }: {
    icon: React.ReactNode;
    label: string;
    field: keyof typeof editing;
    placeholder: string;
    isWebsite?: boolean;
  }) => {
    const value = editValues[field] as string;
    const isEditing = editing[field];
    const displayValue = (activity[field as keyof Activity] as string) || '';

    return (
      <div className="flex items-start">
        {icon}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-1">
            <SectionTitles title={label} />
            {!isEditing && (
              <button
                onClick={() => handleEdit(field)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={placeholder}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSave(field)}
                  className="px-2 py-1 text-xs bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded hover:from-blue-700 hover:to-teal-600 transition-all duration-200"
                >
                  Save
                </button>
                <button
                  onClick={() => handleCancel(field)}
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">
              {isWebsite && displayValue ? (
                <a 
                  href={displayValue.startsWith('http') ? displayValue : `https://${displayValue}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {displayValue}
                </a>
              ) : (
                displayValue || `No ${label.toLowerCase()} specified`
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SectionTitles = ({ title }: { title: string }) => {
    return (
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
    );
  };

  const SectionBox = ({ title, children, className }: { title?: string; children: React.ReactNode, className?: string }) => {
    return (
      <div className="mb-6">
        {title && <SectionTitles title={title} />}
        <div className={`mt-2 text-xs bg-white p-3 rounded border border-gray-200 text-gray-600 ${className}`}>{children}</div>
      </div>
    );
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

  const handleDelete = () => {
    if (onDeleteActivity) {
      onDeleteActivity(activity.id);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-gray-50 p-4 border-b border-gray-200">
      {/* Header with delete button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Activity Details</h3>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
        <EditableField
          icon={<svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>}
          label="Attendee"
          field="attendee"
          placeholder="Enter attendee name"
        />

          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <SectionTitles title="Start Date" />
              {startDate ? formatDateWithDay(startDate) : 'No dates scheduled'}
            </div>
          </div>

          <div className="flex items-start">
            <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <SectionTitles title="End Date" />
              {endDate ? formatDateWithDay(endDate) : 'No dates scheduled'}
            </div>
          </div>


        <EditableField
          icon={<svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>}
          label="Location"
          field="location"
          placeholder="Enter location"
        />
        <EditableField
          icon={<svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>}
          label="Contact"
          field="contact"
          placeholder="Enter contact information"
        />
        <EditableField
          icon={<svg className="w-4 h-4 mr-2 mt-0.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
          </svg>}
          label="Website"
          field="website"
          placeholder="Enter website URL"
          isWebsite={true}
        />
      </div>

      {/* General Notes */}
      <div>
        <div className="flex items-center gap-4">
          <SectionTitles title="Notes" />
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
          <div className="mt-2">
            <textarea
              value={editValues.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter general notes"
            />
            <div className="flex space-x-2 mb-2">
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
          <SectionBox>
            <div className="text-sm text-gray-600 mb-2">
              General notes about this activity (optional)
            </div>
            <div className="italic">{activity.notes || 'No general notes'}</div>
          </SectionBox>
        )}
      </div>

      {/* Planned Dates */}
      <SectionBox title={`Planned Dates (${sortedDates.length} session${sortedDates.length === 1 ? '' : 's'})`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {sortedDates.map((date) => (
              <div key={date}>
                {formatDateWithDay(date)}
              </div>
            ))}
          </div>
      </SectionBox>

      {/* Gaps in Schedule */}
      {gaps.length > 0 && (
        <SectionBox title={`Gaps in Schedule (${gaps.length} session${gaps.length === 1 ? '' : 's'})`} className="bg-yellow-50 border-yellow-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {gaps.map((date) => (
                <div key={date} className="text-yellow-700">
                  {formatDateWithDay(date)}
                </div>
              ))}
            </div>
        </SectionBox>
      )}
      
      {/* Date-specific notes */}
      {activity.notesDates && Object.keys(activity.notesDates).length > 0 && (
        <SectionBox title="Date specific notes">
          <div className="space-y-3">
            {Object.entries(activity.notesDates).map(([date, note]) => (
              <div key={date}>
                  {formatDate(date)}: <span className="italic">
                  {note}
                </span>
              </div>
            ))}
          </div>
        </SectionBox>
      )}

      <div className="mt-6 flex items-center justify-end gap-8">

        {/* Unconfirmed Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={editValues.unconfirmed}
            onChange={(e) => {
              const newValue = e.target.checked;
              handleChange('unconfirmed', newValue);
              if (onUpdateActivity) {
                onUpdateActivity(activity.id, { unconfirmed: newValue });
              }
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-1 text-sm text-gray-700">
            Unconfirmed
          </label>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-700 hover:text-white transition-colors"
        >
          Delete Activity
        </button>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Activity</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{activity.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
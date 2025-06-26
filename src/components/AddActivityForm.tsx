'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';

interface AddActivityFormProps {
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
}

export default function AddActivityForm({ onAddActivity }: AddActivityFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    attendee: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    website: '',
    notes: '',
    unconfirmed: false
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate dates for every week on the same day between start and end date
    const dates = generateWeeklyDates(formData.startDate, formData.endDate);
    
    // Create new activity
    const newActivity: Omit<Activity, 'id'> = {
      name: formData.name,
      attendee: formData.attendee,
      dates: dates,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      website: formData.website,
      notes: formData.notes,
      unconfirmed: formData.unconfirmed
    };
    
    onAddActivity(newActivity);
    
    // Reset form
    setFormData({
      name: '',
      attendee: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      website: '',
      notes: '',
      unconfirmed: false
    });
    setIsExpanded(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate dates for every week on the same day between start and end date
  const generateWeeklyDates = (startDate: string, endDate: string): string[] => {
    if (!startDate) return [];
    
    // Create dates in local timezone by parsing the date string properly
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay); // month is 0-indexed
    
    let end: Date;
    if (endDate) {
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      end = new Date(endYear, endMonth - 1, endDay);
    } else {
      end = start;
    }
    
    const dates: string[] = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      // Format date as YYYY-MM-DD in local timezone
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      
      currentDate.setDate(currentDate.getDate() + 7); // Add 7 days (1 week)
    }
    
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isEndDateValid = !formData.endDate || new Date(formData.endDate) >= new Date(formData.startDate);
  const generatedDates = generateWeeklyDates(formData.startDate, formData.endDate);
  
  // Get day of week in local timezone
  const getDayOfWeek = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  const dayOfWeek = getDayOfWeek(formData.startDate);

  const getLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <div>
      <div className="flex justify-end">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all duration-200 shadow-md"
        >
          {isExpanded ? 'Cancel' : 'Add Activity'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-4 pt-4 bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Activity Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Soccer Practice"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Attendee *
              </label>
              <input
                type="text"
                name="attendee"
                value={formData.attendee}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                End Date (Optional)
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {!isEndDateValid && (
                <p className="text-red-500 text-sm mt-1">End date must be after start date</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Community Park"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bring water bottle and shin guards"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="unconfirmed"
              checked={formData.unconfirmed}
              onChange={(e) => setFormData(prev => ({ ...prev, unconfirmed: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Unconfirmed activity (will appear in dark grey)
            </label>
          </div>

          {/* Schedule Preview */}
          {formData.startDate && isEndDateValid && generatedDates.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Schedule Preview</h4>
              <p className="text-sm text-blue-700 mb-2">
                This activity will be scheduled every <span className="font-medium">{dayOfWeek}</span>
                {formData.endDate && formData.endDate !== formData.startDate 
                  ? ` from ${formatDate(getLocalDate(formData.startDate))} to ${formatDate(getLocalDate(formData.endDate))}`
                  : ` starting ${formatDate(getLocalDate(formData.startDate))}`
                }
              </p>
              <p className="text-sm text-blue-600">
                Total sessions: <span className="font-medium">{generatedDates.length}</span>
              </p>
              {generatedDates.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-blue-600 mb-2">First few dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedDates.slice(0, 5).map((date, idx) => (
                      <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {formatDate(getLocalDate(date))}
                      </span>
                    ))}
                    {generatedDates.length > 5 && (
                      <span className="text-xs text-blue-600 px-2 py-1">
                        +{generatedDates.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.attendee || !formData.startDate || !isEndDateValid || generatedDates.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Add Activity
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 
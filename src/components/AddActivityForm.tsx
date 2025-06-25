'use client';

import { useState } from 'react';
import { Activity } from '@/types/activity';

interface AddActivityFormProps {
  onAddActivity: (activity: Activity) => void;
  weeks: { 
    monday: Date; 
    tuesday: Date; 
    wednesday: Date; 
    thursday: Date; 
    friday: Date; 
    saturday: Date; 
    sunday: Date; 
  }[];
}

export default function AddActivityForm({ onAddActivity, weeks }: AddActivityFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    selectedDays: [] as ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[],
    startTime: '',
    endTime: '',
    location: '',
    contact: '',
    notes: '',
    weeksSpan: 1,
    selectedDates: [] as string[]
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new activity
    const newActivity: Activity = {
      id: Date.now().toString(), // Simple ID generation
      name: formData.name,
      dates: formData.selectedDates,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      contact: formData.contact,
      notes: formData.notes
    };
    
    onAddActivity(newActivity);
    
    // Reset form
    setFormData({
      name: '',
      selectedDays: [],
      startTime: '',
      endTime: '',
      location: '',
      contact: '',
      notes: '',
      weeksSpan: 1,
      selectedDates: []
    });
    setIsExpanded(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weeksSpan' ? parseInt(value) : value
    }));
  };

  const handleDayToggle = (day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday') => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const handleDateToggle = (date: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDates: prev.selectedDates.includes(date)
        ? prev.selectedDates.filter(d => d !== date)
        : [...prev.selectedDates, date]
    }));
  };

  const handleSelectAllDates = () => {
    const allDates = getAvailableDates();
    const dateStrings = allDates.map(dateInfo => dateInfo.date.toISOString().slice(0, 10));
    setFormData(prev => ({
      ...prev,
      selectedDates: dateStrings
    }));
  };

  const handleClearAllDates = () => {
    setFormData(prev => ({
      ...prev,
      selectedDates: []
    }));
  };

  const formatWeekendDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get available dates for all selected days of the week from the weeks data, limited by weeksSpan
  const getAvailableDates = () => {
    if (weeks.length === 0 || formData.selectedDays.length === 0) return [];
    
    const allDates: { date: Date; day: string; weekIndex: number }[] = [];
    
    // Limit to the specified number of weeks
    const weeksToShow = Math.min(formData.weeksSpan, weeks.length);
    
    for (let weekIndex = 0; weekIndex < weeksToShow; weekIndex++) {
      const week = weeks[weekIndex];
      formData.selectedDays.forEach(day => {
        const date = week[day as keyof typeof week] as Date;
        allDates.push({ 
          date, 
          day: dayOptions.find(d => d.value === day)?.label || day,
          weekIndex: weekIndex + 1
        });
      });
    }
    
    // Sort by date
    return allDates.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const availableDates = getAvailableDates();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Add New Activity</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isExpanded ? 'Cancel' : 'Add Activity'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weeks Duration *
              </label>
              <select
                name="weeksSpan"
                value={formData.weeksSpan}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: Math.min(12, weeks.length) }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'week' : 'weeks'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Community Park"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact *
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Coach Mike (555-0123)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Day of Week Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Days of Week *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {dayOptions.map(option => {
                const isSelected = formData.selectedDays.includes(option.value as any);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleDayToggle(option.value as any)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {formData.selectedDays.length === 0 && (
              <p className="text-red-500 text-sm mt-1">Please select at least one day of the week</p>
            )}
          </div>

          {/* Date Selection */}
          {formData.selectedDays.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Specific Dates *
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllDates}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllDates}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableDates.map((dateInfo, idx) => {
                  const dateStr = dateInfo.date.toISOString().slice(0, 10);
                  const isSelected = formData.selectedDates.includes(dateStr);
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDateToggle(dateStr)}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>{formatWeekendDate(dateInfo.date)}</div>
                      <div className="text-xs opacity-75">{dateInfo.day}</div>
                      <div className="text-xs opacity-50">Week {dateInfo.weekIndex}</div>
                    </button>
                  );
                })}
              </div>
              {formData.selectedDates.length === 0 && (
                <p className="text-red-500 text-sm mt-1">Please select at least one date</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Showing dates for {formData.weeksSpan} {formData.weeksSpan === 1 ? 'week' : 'weeks'} 
                ({availableDates.length} total dates available)
              </p>
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
              disabled={formData.selectedDays.length === 0 || formData.selectedDates.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Activity
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 
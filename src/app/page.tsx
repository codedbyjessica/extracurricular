'use client';

import { useState, useEffect } from 'react';
import { Activity, WeekendSchedule } from '@/types/activity';
import { getWeekendDates, hasTimeConflict } from '@/utils/dateUtils';
import DaySection from '@/components/WeekendSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddActivityForm from '@/components/AddActivityForm';
import FreeWeekendsDisplay from '@/components/FreeWeekendsDisplay';
import { activityService } from '@/services/activityService';

// Helper function to get date string in local timezone
const getDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get all dates from activity dates
function getAllDatesFromActivities(activities: Activity[]) {
  const allDates = new Set<string>();
  
  // Collect all unique dates from activities
  activities.forEach(activity => {
    activity.dates.forEach(date => allDates.add(date));
  });
  
  // Convert dates to Date objects and group by week
  const weeks = new Map<string, { 
    monday: Date; 
    tuesday: Date; 
    wednesday: Date; 
    thursday: Date; 
    friday: Date; 
    saturday: Date; 
    sunday: Date; 
  }>();
  
  allDates.forEach(dateStr => {
    // Create date in local timezone by parsing the date string properly
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed, creates date in local timezone
    const dayOfWeek = date.getDay();
    
    // Find the Monday of this week
    const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so we need to go back 6 days
    const monday = new Date(date);
    monday.setDate(date.getDate() - daysUntilMonday);
    
    const weekKey = getDateString(monday);
    
    if (!weeks.has(weekKey)) {
      // Create new Date objects for each day to avoid mutation issues
      const week = {
        monday: new Date(monday),
        tuesday: new Date(monday.getTime() + 1 * 24 * 60 * 60 * 1000),
        wednesday: new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000),
        thursday: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000),
        friday: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000),
        saturday: new Date(monday.getTime() + 5 * 24 * 60 * 60 * 1000),
        sunday: new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
      };
      
      weeks.set(weekKey, week);
    }
  });
  
  // Sort weeks by date
  return Array.from(weeks.values()).sort((a, b) => a.monday.getTime() - b.monday.getTime());
}

// Color palette for activities - using reliable Tailwind colors
const activityColors = [
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-pink-100',
  'bg-purple-100',
  'bg-orange-100',
  'bg-red-100',
  'bg-indigo-100',
  'bg-teal-100',
  'bg-cyan-100',
  'bg-lime-100',
  'bg-emerald-100',
  'bg-amber-100',
  'bg-rose-100',
  'bg-violet-100',
  'bg-sky-100',
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-pink-100',
  'bg-purple-100',
  'bg-orange-100',
  'bg-red-100',
  'bg-indigo-100'
];

// Helper function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export default function Home() {
  const [weeks, setWeeks] = useState<{ 
    monday: Date; 
    tuesday: Date; 
    wednesday: Date; 
    thursday: Date; 
    friday: Date; 
    saturday: Date; 
    sunday: Date; 
  }[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const datesPerPage = 8; // Show eight weeks at a time
  const [selectedDate, setSelectedDate] = useState(''); // For date picker

  // Load activities from Supabase
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        const data = await activityService.getActivities();
        setActivities(data);
        
        // Generate weeks based on the actual activity dates
        let w = getAllDatesFromActivities(data);
        
        // If no activities exist, generate some initial weeks for the current month
        if (w.length === 0) {
          const today = new Date();
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();
          
          // Generate 4 weeks starting from the current week
          const initialWeeks: { 
            monday: Date; 
            tuesday: Date; 
            wednesday: Date; 
            thursday: Date; 
            friday: Date; 
            saturday: Date; 
            sunday: Date; 
          }[] = [];
          
          // Find the Monday of the current week
          const dayOfWeek = today.getDay();
          const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so we need to go back 6 days
          const monday = new Date(today);
          monday.setDate(today.getDate() - daysUntilMonday);
          
          // Generate 4 weeks
          for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
            const weekMonday = new Date(monday);
            weekMonday.setDate(monday.getDate() + (weekIndex * 7));
            
            const week = {
              monday: new Date(weekMonday),
              tuesday: new Date(weekMonday.getTime() + 1 * 24 * 60 * 60 * 1000),
              wednesday: new Date(weekMonday.getTime() + 2 * 24 * 60 * 60 * 1000),
              thursday: new Date(weekMonday.getTime() + 3 * 24 * 60 * 60 * 1000),
              friday: new Date(weekMonday.getTime() + 4 * 24 * 60 * 60 * 1000),
              saturday: new Date(weekMonday.getTime() + 5 * 24 * 60 * 60 * 1000),
              sunday: new Date(weekMonday.getTime() + 6 * 24 * 60 * 60 * 1000)
            };
            
            initialWeeks.push(week);
          }
          
          w = initialWeeks;
        }
        
        setWeeks(w);
      } catch (err) {
        console.error('Error loading activities:', err);
        setError('Failed to load activities. Please check your Supabase configuration.');
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  // Calculate total pages based on weeks
  const totalPages = Math.ceil(weeks.length / datesPerPage);

  // Get current page weeks
  const getCurrentPageWeeks = () => {
    const startIndex = currentPage * datesPerPage;
    const endIndex = Math.min(startIndex + datesPerPage, weeks.length);
    return weeks.slice(startIndex, endIndex);
  };

  // Navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(0);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages - 1);
  };

  // Go to today's week
  const goToToday = () => {
    const today = new Date();
    goToDate(today);
  };

  // Go to specific date
  const goToDate = (targetDate: Date) => {
    // Find the Monday of the target date's week
    const dayOfWeek = targetDate.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so we need to go back 6 days
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() - daysUntilMonday);
    
    // Find which page contains this Monday
    const targetMondayStr = getDateString(monday);
    const pageIndex = weeks.findIndex(week => 
      getDateString(week.monday) === targetMondayStr
    );
    
    if (pageIndex !== -1) {
      // Calculate which page this week is on
      const targetPage = Math.floor(pageIndex / datesPerPage);
      setCurrentPage(targetPage);
    } else {
      // If the target date is not in the current weeks, add it
      // This is a simplified approach - in a real app you might want to regenerate weeks
      console.log('Target date not found in current weeks');
    }
  };

  // Handle date picker change
  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    setSelectedDate(dateValue);
    
    if (dateValue) {
      const [year, month, day] = dateValue.split('-').map(Number);
      const targetDate = new Date(year, month - 1, day);
      goToDate(targetDate);
    }
  };

  // Get date range display for current page
  const getCurrentPageRange = () => {
    const currentWeeks = getCurrentPageWeeks();
    if (currentWeeks.length === 0) return '';
    
    const start = currentWeeks[0].monday;
    const end = currentWeeks[currentWeeks.length - 1].sunday;
    const formatFull = (date: Date) =>
      date.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
      });
    const startDate = formatFull(start);
    const endDate = formatFull(end);
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Assign a color to each activity based on activity ID for consistency
  const getActivityColor = (activityId: string) => {
    // Create a hash from the activity ID to get a consistent index
    let hash = 0;
    for (let i = 0; i < activityId.length; i++) {
      const char = activityId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const index = Math.abs(hash) % activityColors.length;
    return activityColors[index];
  };

  // Toggle accordion for activity details
  const toggleActivity = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  // Add more weeks (empty weeks after the last activity week)
  const addMoreWeeks = () => {
    if (weeks.length === 0) return;
    
    const lastWeek = weeks[weeks.length - 1];
    const additionalWeeks: { 
      monday: Date; 
      tuesday: Date; 
      wednesday: Date; 
      thursday: Date; 
      friday: Date; 
      saturday: Date; 
      sunday: Date; 
    }[] = [];
    
    // Add 4 more empty weeks after the last activity week
    for (let i = 1; i <= 4; i++) {
      const monday = new Date(lastWeek.monday);
      monday.setDate(lastWeek.monday.getDate() + (i * 7));
      
      // Create new Date objects for each day to avoid mutation issues
      const week = {
        monday: new Date(monday),
        tuesday: new Date(monday.getTime() + 1 * 24 * 60 * 60 * 1000),
        wednesday: new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000),
        thursday: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000),
        friday: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000),
        saturday: new Date(monday.getTime() + 5 * 24 * 60 * 60 * 1000),
        sunday: new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
      };
      
      additionalWeeks.push(week);
    }
    
    setWeeks([...weeks, ...additionalWeeks]);
  };

  // Add new activity
  const handleAddActivity = async (newActivity: Omit<Activity, 'id'>) => {
    try {
      const addedActivity = await activityService.addActivity(newActivity);
      setActivities(prev => [...prev, addedActivity]);
      
      // Update weeks if the new activity has dates that aren't covered
      const updatedWeeks = getAllDatesFromActivities([...activities, addedActivity]);
      setWeeks(updatedWeeks);
    } catch (err) {
      console.error('Error adding activity:', err);
      setError('Failed to add activity. Please try again.');
    }
  };

  // Handle date selection changes from drag operations
  const handleDateSelectionChange = async (activityId: string, dates: string[], isAdding: boolean, notes?: Record<string, string>) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      let newDates: string[];
      let newNotesDates = { ...activity.notesDates };

      if (isAdding) {
        // Add dates that aren't already in the activity
        newDates = [...activity.dates];
        dates.forEach(date => {
          if (!newDates.includes(date)) {
            newDates.push(date);
          }
        });
        
        // Update date notes if provided
        if (notes) {
          Object.assign(newNotesDates, notes);
        }
      } else {
        // Remove the specified dates
        newDates = activity.dates.filter(date => !dates.includes(date));
        
        // Remove date notes for the removed dates
        dates.forEach(date => {
          delete newNotesDates[date];
        });
      }

      // Update in Supabase
      await activityService.updateActivityDates(activityId, newDates, newNotesDates);
      
      // Update local state
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, dates: newDates, notesDates: newNotesDates }
          : activity
      ));
    } catch (err) {
      console.error('Error updating activity dates:', err);
      setError('Failed to update activity. Please try again.');
    }
  };

  // Handle date note changes (when only updating notes, not adding/removing dates)
  const handleDateNoteChange = async (activityId: string, dates: string[], notes: Record<string, string>) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      const newNotesDates = { ...activity.notesDates };
      Object.assign(newNotesDates, notes);

      // Update in Supabase
      await activityService.updateActivityDates(activityId, activity.dates, newNotesDates);
      
      // Update local state
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, notesDates: newNotesDates }
          : activity
      ));
    } catch (err) {
      console.error('Error updating activity notes:', err);
      setError('Failed to update notes. Please try again.');
    }
  };

  // Handle activity updates (location, contact, website, notes)
  const handleUpdateActivity = async (activityId: string, updates: Partial<Activity>) => {
    try {
      const activity = activities.find(a => a.id === activityId);
      if (!activity) return;

      // Update in Supabase
      await activityService.updateActivity(activityId, updates);
      
      // Update local state
      setActivities(prev => prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, ...updates }
          : activity
      ));
    } catch (err) {
      console.error('Error updating activity:', err);
      setError('Failed to update activity. Please try again.');
    }
  };

  // Show error message if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-accent-blue flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Configuration Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please check your Supabase configuration in the .env.local file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render until data is loaded
  if (loading) {
    return <LoadingSpinner />;
  }

  // Get activities for each day of the week
  const getActivitiesForDay = (dayKey: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday') => {
    const filteredActivities = activities
      .filter(activity => 
        activity.dates.some(date => 
          weeks.some(w => getDateString(w[dayKey] as Date) === date)
        )
      )
      .sort((a, b) => {
        const timeA = a.startTime.replace(':', '');
        const timeB = b.startTime.replace(':', '');
        return parseInt(timeA) - parseInt(timeB);
      });

    return filteredActivities;
  };

  const dayConfigs = [
    { key: 'monday', title: 'Monday', color: 'text-neutral-700' },
    { key: 'tuesday', title: 'Tuesday', color: 'text-neutral-700' },
    { key: 'wednesday', title: 'Wednesday', color: 'text-neutral-700' },
    { key: 'thursday', title: 'Thursday', color: 'text-neutral-700' },
    { key: 'friday', title: 'Friday', color: 'text-neutral-700' },
    { key: 'saturday', title: 'Saturday', color: 'text-neutral-700' },
    { key: 'sunday', title: 'Sunday', color: 'text-neutral-700' }
  ];

  // Filter day configs to only include days that have activities
  const activeDayConfigs = dayConfigs.filter(dayConfig => {
    const dayActivities = getActivitiesForDay(dayConfig.key as any);
    return dayActivities.length > 0;
  });

  const currentWeeks = getCurrentPageWeeks();

  return (
    <div className="min-h-screen bg-accent-blue">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          {/* Fancy Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-600 rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
              <div className="absolute bottom-0 right-0 w-28 h-28 bg-white rounded-full translate-x-14 translate-y-14"></div>
            </div>
            
            {/* Main content */}
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  Weekly Activity Planner
                </h1>
              </div>
              
              <p className="text-xl text-white/90 font-medium drop-shadow-md">
                Plan your child's weekly extracurricular activities with ease
              </p>
              
              {/* Decorative elements */}
              <div className="flex justify-center mt-6 space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white text-sm font-medium">Smart Scheduling</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white text-sm font-medium">Conflict Detection</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-white text-sm font-medium">Family Friendly</span>
                </div>
              </div>
            </div>
          </div>

          {/* Free Weekends Display */}
          <FreeWeekendsDisplay activities={activities} currentPageWeeks={currentWeeks} />

          {/* Add Activity Form */}
          <AddActivityForm 
            onAddActivity={handleAddActivity} 
            activities={activities}
            weeks={weeks}
            currentPageWeeks={currentWeeks}
          />
          
          {/* Enhanced Conflict Legend */}
          <div className="my-6 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4 text-center">Schedule Legend</h3>
            <div className="flex justify-center items-center space-x-8 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-pastel-blue border-2 border-red-500 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-neutral-700 font-medium">Time Conflict</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-pastel-blue rounded shadow-sm"></div>
                <span className="text-neutral-700 font-medium">Scheduled Activity</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-neutral-100 border-2 border-neutral-200 rounded"></div>
                <span className="text-neutral-700 font-medium">No Activity</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-pastel-blue border-2 border-neutral-400 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-neutral-700 font-medium">Drag to Add/Remove</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Pagination Controls */}
        {weeks.length > 0 && (
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                First
              </button>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                Previous
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-bold text-neutral-700">
                {getCurrentPageRange()}
              </div>

              <div className="mt-4 flex items-center space-x-2 justify-center">
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 transition-all duration-200 shadow-md"
                >
                  Today
                </button>

                <div className="flex items-center space-x-2">
                  <label className="text-xs text-neutral-600">Go to date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDatePickerChange}
                    className="text-xs px-2 py-1 border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                Next
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* Day Sections - Only show days with activities */}
        {activeDayConfigs.map(dayConfig => (
          <DaySection
            key={dayConfig.key}
            title={dayConfig.title}
            color={dayConfig.color}
            activities={getActivitiesForDay(dayConfig.key as any)}
            dates={currentWeeks.map(w => w[dayConfig.key as keyof typeof w] as Date)}
            expandedActivities={expandedActivities}
            onToggleActivity={toggleActivity}
            getActivityColor={getActivityColor}
            formatTime={formatTime12Hour}
            onDateSelectionChange={handleDateSelectionChange}
            onDateNoteChange={handleDateNoteChange}
            onUpdateActivity={handleUpdateActivity}
            // Pass global pagination state
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onNextPage={goToNextPage}
            onPrevPage={goToPrevPage}
            onFirstPage={goToFirstPage}
            onLastPage={goToLastPage}
            getCurrentPageRange={getCurrentPageRange}
          />
        ))}

        {/* Show message if no activities exist */}
        {activeDayConfigs.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8 border border-neutral-200">
              <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Activities Scheduled</h3>
              <p className="text-neutral-600 mb-4">Add your first activity using the form above to get started!</p>
            </div>
          </div>
        )}

        {/* Add More Weeks Button */}
        <div className="text-center mt-8">
          <button
            onClick={addMoreWeeks}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg"
          >
            Add More Weeks (+4 weeks)
          </button>
          <p className="text-sm text-neutral-500 mt-2">
            Currently showing {weeks.length} weeks
          </p>
        </div>
      </div>
    </div>
  );
}

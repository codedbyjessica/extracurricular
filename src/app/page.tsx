'use client';

import { useState, useEffect } from 'react';
import { Activity, WeekendSchedule } from '@/types/activity';
import { getWeekendDates, hasTimeConflict } from '@/utils/dateUtils';
import DaySection from '@/components/WeekendSection';
import LoadingSpinner from '@/components/LoadingSpinner';
import AddActivityForm from '@/components/AddActivityForm';

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

// Color palette for activities - using pastel rainbow colors
const activityColors = [
  'bg-pastel-blue',
  'bg-pastel-green',
  'bg-pastel-yellow',
  'bg-pastel-pink',
  'bg-pastel-purple',
  'bg-pastel-orange',
  'bg-pastel-red',
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

  useEffect(() => {
    // Each activity has its own custom dates for demo - using explicit date strings
    const sampleActivities: Activity[] = [
      {
        id: '1',
        name: 'Soccer Practice',
        dates: ['2025-01-25', '2025-02-01', '2025-02-08'],
        startTime: '09:00',
        endTime: '10:30',
        location: 'Community Park',
        contact: 'Coach Mike (555-0123)',
        notes: 'Bring water bottle and shin guards',
        notesDates: {
          '2025-01-25': 'First practice of the season',
          '2025-02-01': 'Focus on dribbling skills',
          '2025-02-08': 'Team scrimmage day'
        }
      },
      {
        id: '2',
        name: 'Gymnastics Class',
        dates: ['2025-02-01', '2025-02-08', '2025-02-15', '2025-02-22', '2025-03-01'],
        startTime: '14:00',
        endTime: '15:30',
        location: 'Elite Gymnastics Center',
        contact: 'Coach Sarah (555-0456)',
        notes: 'Wear leotard and bring hair ties'
      },
      {
        id: '3',
        name: 'Piano Lesson',
        dates: ['2025-01-26', '2025-02-02', '2025-02-09', '2025-02-16', '2025-02-23', '2025-03-02', '2025-03-09', '2025-03-16', '2025-03-23', '2025-03-30', '2025-04-06', '2025-04-13', '2025-04-20', '2025-04-27', '2025-05-04', '2025-05-11', '2025-05-18', '2025-05-25', '2025-06-01', '2025-06-08', '2025-06-15', '2025-06-22', '2025-06-29', '2025-07-06', '2025-07-13', '2025-07-20', '2025-07-27', '2025-08-03', '2025-08-10', '2025-08-17', '2025-08-24', '2025-08-31', '2025-09-07', '2025-09-14', '2025-09-21', '2025-09-28', '2025-10-05', '2025-10-12', '2025-10-19', '2025-10-26', '2025-11-02', '2025-11-09', '2025-11-16', '2025-11-23', '2025-11-30', '2025-12-07', '2025-12-14', '2025-12-21', '2025-12-28'],
        startTime: '11:00',
        endTime: '12:00',
        location: 'Music Academy',
        contact: 'Ms. Johnson (555-0789)',
        notes: 'Practice scales and new piece',
        notesDates: {
          '2025-01-26': 'New piece: Moonlight Sonata',
          '2025-02-02': 'Focus on dynamics',
          '2025-02-09': 'Recital preparation begins'
        }
      },
      {
        id: '4',
        name: 'Swimming Lessons',
        dates: ['2025-01-26', '2025-02-02', '2025-02-09', '2025-02-16', '2025-02-23'],
        startTime: '15:00',
        endTime: '16:00',
        location: 'Aquatic Center',
        contact: 'Coach Dave (555-0321)',
        notes: 'Bring swimsuit and towel'
      },
      {
        id: '5',
        name: 'Art Class',
        dates: ['2025-02-08', '2025-02-15', '2025-02-22', '2025-03-01'],
        startTime: '10:00',
        endTime: '11:30',
        location: 'Creative Arts Studio',
        contact: 'Ms. Davis (555-0654)',
        notes: 'Bring sketchbook and pencils'
      },
      {
        id: '6',
        name: 'Dance Class',
        dates: ['2025-01-27', '2025-02-03', '2025-02-10', '2025-02-17', '2025-02-24'],
        startTime: '13:00',
        endTime: '14:30',
        location: 'Dance Academy',
        contact: 'Ms. Wilson (555-0987)',
        notes: 'Wear dance shoes and comfortable clothes'
      }
    ];
    
    setActivities(sampleActivities);
    
    // Generate weeks based on the actual activity dates
    const w = getAllDatesFromActivities(sampleActivities);
    
    // Debug: Check specific dates for timezone issues
    console.log('=== TIMEZONE DEBUGGING ===');
    const testDate = new Date(2025, 1, 8); // February 8, 2025 (month is 0-indexed)
    console.log('Test date Feb 8, 2025:', {
      date: getDateString(testDate),
      localDate: testDate.toLocaleDateString(),
      dayOfWeek: testDate.getDay(),
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][testDate.getDay()]
    });
    
    // Check if any weeks contain Feb 8 or 9
    w.forEach((week, index) => {
      if (getDateString(week.saturday) === '2025-02-08' || 
          getDateString(week.saturday) === '2025-02-09' ||
          getDateString(week.sunday) === '2025-02-08' ||
          getDateString(week.sunday) === '2025-02-09') {
        console.log(`Week ${index} contains Feb 8/9:`, {
          monday: getDateString(week.monday),
          saturday: getDateString(week.saturday),
          sunday: getDateString(week.sunday),
          saturdayDay: week.saturday.getDay(),
          sundayDay: week.sunday.getDay()
        });
      }
    });
    console.log('=== END TIMEZONE DEBUGGING ===');
    
    console.log('Generated weeks:', w.length);
    console.log('First week Saturday:', getDateString(w[0]?.saturday));
    console.log('First week Sunday:', getDateString(w[0]?.sunday));
    setWeeks(w);
  }, []);

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
  const handleAddActivity = (newActivity: Activity) => {
    setActivities(prev => [...prev, newActivity]);
    
    // Update weeks if the new activity has dates that aren't covered
    const updatedWeeks = getAllDatesFromActivities([...activities, newActivity]);
    setWeeks(updatedWeeks);
  };

  // Handle date selection changes from drag operations
  const handleDateSelectionChange = (activityId: string, dates: string[], isAdding: boolean, notes?: Record<string, string>) => {
    console.log('Date selection change:', {
      activityId,
      dates,
      isAdding,
      notes,
      currentActivities: activities.map(a => ({ id: a.id, name: a.name, dates: a.dates }))
    });

    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        if (isAdding) {
          // Add dates that aren't already in the activity
          const newDates = [...activity.dates];
          dates.forEach(date => {
            if (!newDates.includes(date)) {
              newDates.push(date);
            }
          });
          
          // Update date notes if provided
          const newDateNotes = { ...activity.notesDates };
          if (notes) {
            Object.assign(newDateNotes, notes);
          }
          
          console.log(`Adding dates to ${activity.name}:`, { oldDates: activity.dates, newDates, notes });
          return { ...activity, dates: newDates, notesDates: newDateNotes };
        } else {
          // Remove the specified dates
          const newDates = activity.dates.filter(date => !dates.includes(date));
          
          // Remove date notes for the removed dates
          const newDateNotes = { ...activity.notesDates };
          dates.forEach(date => {
            delete newDateNotes[date];
          });
          
          console.log(`Removing dates from ${activity.name}:`, { oldDates: activity.dates, newDates });
          return { ...activity, dates: newDates, notesDates: newDateNotes };
        }
      }
      return activity;
    }));
  };

  // Handle date note changes (when only updating notes, not adding/removing dates)
  const handleDateNoteChange = (activityId: string, dates: string[], notes: Record<string, string>) => {
    console.log('Date note change:', {
      activityId,
      dates,
      notes
    });

    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const newDateNotes = { ...activity.notesDates };
        Object.assign(newDateNotes, notes);
        
        console.log(`Updating notes for ${activity.name}:`, { notes });
        return { ...activity, notesDates: newDateNotes };
      }
      return activity;
    }));
  };

  // Don't render until data is loaded
  if (weeks.length === 0 || activities.length === 0) {
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

    console.log(`Activities for ${dayKey}:`, filteredActivities.map(a => ({
      id: a.id,
      name: a.name,
      dates: a.dates.filter(date => 
        weeks.some(w => getDateString(w[dayKey] as Date) === date)
      )
    })));

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

  return (
    <div className="min-h-screen bg-accent-blue">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">
            Weekly Activity Planner
          </h1>
          <p className="text-neutral-600">
            Plan your child's weekly extracurricular activities (scroll horizontally to see more weeks)
          </p>
          
          {/* Conflict Legend */}
          <div className="mt-4 flex justify-center items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-pastel-blue border border-red-500 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-neutral-700">Time Conflict</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-pastel-blue rounded"></div>
              <span className="text-neutral-700">Scheduled Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-neutral-100 border border-neutral-200 rounded"></div>
              <span className="text-neutral-700">No Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-pastel-blue border border-neutral-400 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-neutral-700">Drag to Add/Remove</span>
            </div>
          </div>
        </div>

        {/* Add Activity Form */}
        <AddActivityForm onAddActivity={handleAddActivity} weeks={weeks} />

        {/* Day Sections - Only show days with activities */}
        {activeDayConfigs.map(dayConfig => (
          <DaySection
            key={dayConfig.key}
            title={dayConfig.title}
            color={dayConfig.color}
            activities={getActivitiesForDay(dayConfig.key as any)}
            dates={weeks.map(w => w[dayConfig.key as keyof typeof w] as Date)}
            expandedActivities={expandedActivities}
            onToggleActivity={toggleActivity}
            getActivityColor={getActivityColor}
            formatTime={formatTime12Hour}
            onDateSelectionChange={handleDateSelectionChange}
            onDateNoteChange={handleDateNoteChange}
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
            className="px-6 py-3 bg-pastel-blue text-neutral-800 rounded-lg hover:bg-pastel-purple transition-colors font-medium border border-neutral-300"
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

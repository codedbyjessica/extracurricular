'use client';

import { useState, useRef, useEffect } from 'react';
import { Activity } from '@/types/activity';
import ActivityDetails from './ActivityDetails';
import DateActionModal from './DateActionModal';
import { getConflictingActivities } from '@/utils/dateUtils';

interface DaySectionProps {
  title: string;
  color: string;
  activities: Activity[];
  dates: Date[];
  expandedActivities: Set<string>;
  onToggleActivity: (activityId: string) => void;
  getActivityColor: (activityId: string) => string;
  formatTime: (time: string) => string;
  onDateSelectionChange?: (activityId: string, dates: string[], isAdding: boolean, notes?: Record<string, string>) => void;
  onDateNoteChange?: (activityId: string, dates: string[], notes: Record<string, string>) => void;
  onUpdateActivity?: (activityId: string, updates: Partial<Activity>) => void;
  // Global pagination props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  getCurrentPageRange: () => string;
}

export default function DaySection({
  title,
  color,
  activities,
  dates,
  expandedActivities,
  onToggleActivity,
  getActivityColor,
  formatTime,
  onDateSelectionChange,
  onDateNoteChange,
  onUpdateActivity,
  // Global pagination props
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage,
  getCurrentPageRange
}: DaySectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ activityId: string; dateIndex: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ activityId: string; dateIndex: number } | null>(null);
  const [dragMode, setDragMode] = useState<'add' | 'remove' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: 'add' | 'remove';
    activityId: string;
    activityName: string;
    dates: string[];
    dateRange: string;
    currentNote?: string;
  }>({
    isOpen: false,
    action: 'add',
    activityId: '',
    activityName: '',
    dates: [],
    dateRange: '',
    currentNote: ''
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get date string in local timezone
  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get activity status
  const getActivityStatus = (activity: Activity) => {
    if (activity.dates.length === 0) return null;
    
    // Get the date range of the current page
    const currentPageDateStrings = dates.map(date => getDateString(date));
    const firstPageDate = currentPageDateStrings[0];
    const lastPageDate = currentPageDateStrings[currentPageDateStrings.length - 1];
    
    // Check if any activity dates fall within the current page range
    const hasDatesInCurrentRange = activity.dates.some(date => 
      date >= firstPageDate && date <= lastPageDate
    );
    
    if (hasDatesInCurrentRange) {
      return null; // Activity is active in current range
    }
    
    // If no dates in current range, check if activity is before or after
    const sortedDates = [...activity.dates].sort();
    const firstActivityDate = sortedDates[0];
    const lastActivityDate = sortedDates[sortedDates.length - 1];
    
    if (lastActivityDate < firstPageDate) {
      return { status: 'ended', color: 'text-gray-500' };
    } else if (firstActivityDate > lastPageDate) {
      return { status: 'not started', color: 'text-blue-600' };
    } else {
      // Activity has dates both before and after the current page range
      // This means there's a gap in the current page range
      return { status: 'gap', color: 'text-orange-600' };
    }
  };

  // Check if an activity has conflicts on a specific date
  const hasConflictOnDate = (activity: Activity, date: string) => {
    const conflictingActivities = getConflictingActivities(activities, date);
    return conflictingActivities.some(conflictingActivity => conflictingActivity.id === activity.id);
  };

  // Check if a cell is currently active (has activity on that date)
  const isCellActive = (activity: Activity, dateIndex: number) => {
    const dateStr = getDateString(dates[dateIndex]);
    return activity.dates.includes(dateStr);
  };

  // Check if a cell is in the current drag selection
  const isCellInDragSelection = (activityId: string, dateIndex: number) => {
    if (!isDragging || !dragStart || !dragEnd) return false;
    
    if (dragStart.activityId !== activityId || dragEnd.activityId !== activityId) return false;
    
    const start = Math.min(dragStart.dateIndex, dragEnd.dateIndex);
    const end = Math.max(dragStart.dateIndex, dragEnd.dateIndex);
    
    return dateIndex >= start && dateIndex <= end;
  };

  const handleMouseDown = (activityId: string, dateIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
    
    const isActive = isCellActive(activity, dateIndex);
    const mode = isActive ? 'remove' : 'add';
    const dateStr = getDateString(dates[dateIndex]);
    
    console.log('Mouse down:', {
      activityId,
      activityName: activity.name,
      dateIndex,
      dateStr,
      isActive,
      mode,
      currentDates: activity.dates,
      allActivitiesInSection: activities.map(a => ({ id: a.id, name: a.name }))
    });
    
    setIsDragging(true);
    setDragStart({ activityId, dateIndex });
    setDragEnd({ activityId, dateIndex });
    setDragMode(mode);
  };

  const handleClick = (activityId: string, dateIndex: number, e: React.MouseEvent) => {
    // Only handle clicks if we're not dragging (to avoid conflicts)
    if (isDragging) return;
    
    e.preventDefault();
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
    
    const isActive = isCellActive(activity, dateIndex);
    const mode = isActive ? 'remove' : 'add';
    const dateStr = getDateString(dates[dateIndex]);
    
    console.log('Single click:', {
      activityId,
      activityName: activity.name,
      dateIndex,
      dateStr,
      isActive,
      mode
    });
    
    // Open modal for confirmation and note input
    setModalState({
      isOpen: true,
      action: mode,
      activityId,
      activityName: activity.name,
      dates: [dateStr],
      dateRange: formatDate(dates[dateIndex]),
      currentNote: activity.notesDates?.[dateStr]
    });
  };

  const handleMouseEnter = (activityId: string, dateIndex: number) => {
    if (isDragging && dragStart && dragStart.activityId === activityId) {
      setDragEnd({ activityId, dateIndex });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragEnd && dragMode && onDateSelectionChange) {
      const activity = activities.find(a => a.id === dragStart.activityId);
      if (!activity) return;

      const start = Math.min(dragStart.dateIndex, dragEnd.dateIndex);
      const end = Math.max(dragStart.dateIndex, dragEnd.dateIndex);
      
      const selectedDates: string[] = [];
      for (let i = start; i <= end; i++) {
        selectedDates.push(getDateString(dates[i]));
      }

      console.log('Drag operation:', {
        activityId: dragStart.activityId,
        activityName: activity.name,
        dragMode,
        selectedDates,
        startIndex: start,
        endIndex: end,
        startDate: getDateString(dates[start]),
        endDate: getDateString(dates[end])
      });

      // Open modal for confirmation and note input
      const startDateDisplay = formatDate(dates[start]);
      const endDateDisplay = formatDate(dates[end]);
      const dateRange = start === end ? startDateDisplay : `${startDateDisplay} to ${endDateDisplay}`;
      
      setModalState({
        isOpen: true,
        action: dragMode,
        activityId: dragStart.activityId,
        activityName: activity.name,
        dates: selectedDates,
        dateRange,
        currentNote: getExistingNote(activity, selectedDates)
      });
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setDragMode(null);
  };

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, dragEnd, dragMode]);

  const handleModalConfirm = (action: 'add' | 'remove' | 'note', note?: string) => {
    // Create notes object if note is provided
    const notes: Record<string, string> | undefined = note 
      ? modalState.dates.reduce((acc, date) => {
          acc[date] = note;
          return acc;
        }, {} as Record<string, string>)
      : undefined;

    switch (action) {
      case 'add':
        if (onDateSelectionChange) {
          onDateSelectionChange(modalState.activityId, modalState.dates, true, notes);
        }
        break;
      case 'remove':
        if (onDateSelectionChange) {
          onDateSelectionChange(modalState.activityId, modalState.dates, false, notes);
        }
        break;
      case 'note':
        if (notes && onDateNoteChange) {
          onDateNoteChange(modalState.activityId, modalState.dates, notes);
        }
        break;
    }
  };

  const handleModalClose = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Helper function to get existing note for dates
  const getExistingNote = (activity: Activity, dates: string[]): string | undefined => {
    if (!activity.notesDates) return undefined;
    
    // Check if all dates have the same note
    const notes = dates.map(date => activity.notesDates?.[date]).filter(Boolean);
    if (notes.length === 0) return undefined;
    
    // If all dates have the same note, return it
    const firstNote = notes[0];
    if (notes.every(note => note === firstNote)) {
      return firstNote;
    }
    
    // If different notes, return undefined (user will need to set new note)
    return undefined;
  };

  return (
    <div className="mb-12" ref={containerRef}>
      <h2 className={`text-2xl font-bold ${color} mb-4 text-left`}>{title}</h2>
      
      {/* Pagination Controls - only show if this is the first section */}
      {title === 'Monday' && (
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={onFirstPage}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            >
              First
            </button>
            <button
              onClick={onPrevPage}
              disabled={currentPage === 0}
              className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            >
              Previous
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium text-neutral-700">
              {getCurrentPageRange()}
            </div>
            <div className="text-xs text-neutral-500">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            >
              Next
            </button>
            <button
              onClick={onLastPage}
              disabled={currentPage === totalPages - 1}
              className="px-3 py-1 text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
            >
              Last
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-neutral-200">
        {/* Header row */}
        <div className="flex">
          {/* Fixed Activity and Time columns header */}
          <div className="flex-shrink-0 w-[320px] border-r border-neutral-200">
            <div className="grid grid-cols-2 gap-1 p-4 bg-neutral-100 border-b border-neutral-200 font-semibold text-sm">
              <div className="text-neutral-700">Activity</div>
              <div className="text-neutral-700">Time</div>
            </div>
          </div>

          {/* Date columns header */}
          <div className="flex-1">
            <div className="grid gap-1 p-4 bg-neutral-100 border-b border-neutral-200 font-semibold text-sm" style={{ gridTemplateColumns: `repeat(${dates.length}, 1fr)` }}>
              {dates.map((date, idx) => {
                const dateStr = getDateString(date);
                const month = date.getMonth();
                // Different background colors for each month
                const getMonthColor = (month: number) => {
                  switch (month) {
                    case 0: return 'bg-pastel-blue'; // January
                    case 1: return 'bg-pastel-purple'; // February
                    case 2: return 'bg-pastel-green'; // March
                    case 3: return 'bg-pastel-yellow'; // April
                    case 4: return 'bg-pastel-pink'; // May
                    case 5: return 'bg-pastel-orange'; // June
                    case 6: return 'bg-pastel-red'; // July
                    case 7: return 'bg-pastel-blue'; // August
                    case 8: return 'bg-pastel-purple'; // September
                    case 9: return 'bg-pastel-green'; // October
                    case 10: return 'bg-pastel-yellow'; // November
                    case 11: return 'bg-pastel-pink'; // December
                    default: return 'bg-neutral-100';
                  }
                };
                return (
                  <div key={idx} className={`text-center ${getMonthColor(month)}/30 rounded flex flex-col items-center justify-center`}>
                      {date.toLocaleDateString('en-US')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity rows with inline expanded details */}
        {activities.map((activity, activityIdx) => (
          <div key={activity.id}>
            {/* Activity row */}
            <div className="flex border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
              {/* Fixed Activity and Time columns */}
              <div className="flex-shrink-0 w-[320px] border-r border-neutral-200">
                <div className="grid grid-cols-2 gap-1 p-4">
                  <div 
                    className={`font-medium text-neutral-900 flex items-center cursor-pointer h-8 pl-2 mr-2 ${getActivityColor(activity.id)}`}
                    onClick={() => onToggleActivity(activity.id)}
                  >
                      {activity.name}
                    <svg 
                      className={`w-4 h-4 ml-2 transition-transform ${
                        expandedActivities.has(activity.id) ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>


                    {(() => {
                      const status = getActivityStatus(activity);
                      if (status) {
                        return (
                          <span className={`ml-2 text-[10px] font-normal ${status.color}`}>
                            ({status.status})
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="text-neutral-700 text-sm flex items-center h-8">
                    {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                  </div>
                </div>
              </div>

              {/* Date cells */}
              <div className="flex-1">
                <div className="grid gap-1 p-4" style={{ gridTemplateColumns: `repeat(${dates.length}, 1fr)` }}>
                  {dates.map((date, dateIdx) => {
                    const dateStr = getDateString(date);
                    const isActive = activity.dates.includes(dateStr);
                    const hasConflict = isActive && hasConflictOnDate(activity, dateStr);
                    const inDragSelection = isCellInDragSelection(activity.id, dateIdx);
                    const hasNote = activity.notesDates?.[dateStr];
                    
                    let cellClasses = 'h-8 rounded flex items-center justify-center cursor-pointer transition-all duration-150 relative group ';
                    
                    if (inDragSelection) {
                      cellClasses += dragMode === 'add' 
                        ? 'bg-pastel-blue border border-neutral-400 font-bold' 
                        : 'bg-pastel-red border border-neutral-400 font-bold';
                    } else if (hasConflict) {
                      cellClasses += getActivityColor(activity.id) + ' font-semibold border border-red-500';
                    } else if (isActive) {
                      cellClasses += getActivityColor(activity.id) + ' font-semibold';
                    } else {
                      cellClasses += 'bg-neutral-200 hover:bg-neutral-300';
                    }
                    
                    return (
                      <div
                        key={dateIdx}
                        className={cellClasses}
                        onMouseDown={(e) => handleMouseDown(activity.id, dateIdx, e)}
                        onClick={(e) => handleClick(activity.id, dateIdx, e)}
                        onMouseEnter={() => handleMouseEnter(activity.id, dateIdx)}
                        title={`${activity.name} - ${formatDate(date)} (${dateStr})`}
                      >
                        {/* Note indicator and truncated text */}
                        {hasNote && !inDragSelection && (
                          <>
                            {/* Truncated note text */}
                            <div className="text-xs text-neutral-700 px-1 truncate max-w-[60px] leading-tight">
                              {hasNote.length > 15 ? `${hasNote.substring(0, 15)}...` : hasNote}
                            </div>
                            {/* Custom tooltip for full note */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                              {hasNote}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
                            </div>
                          </>
                        )}
                        
                        {hasConflict && !inDragSelection && (
                          <svg className="w-4 h-4 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        {inDragSelection && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Expanded Activity Details - spans full width */}
            {expandedActivities.has(activity.id) && (
              <div className="border-b border-neutral-200">
                <ActivityDetails activity={activity} onUpdateActivity={onUpdateActivity} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Date Action Modal */}
      <DateActionModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        activityName={modalState.activityName}
        action={modalState.action}
        dateRange={modalState.dateRange}
        dateCount={modalState.dates.length}
        currentNote={modalState.currentNote}
      />
    </div>
  );
} 
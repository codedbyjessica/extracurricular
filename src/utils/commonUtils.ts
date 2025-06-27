// Helper function to get date string in local timezone
export const getDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format date for display
export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format date with year
export const formatDateWithYear = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to format date string
export const formatDateString = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to format date string with day of week
export const formatDateStringWithDay = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to get month color for calendar headers
export const getMonthColor = (month: number) => {
  switch (month) {
    case 0: return 'bg-red-100'; // January
    case 1: return 'bg-orange-100'; // February
    case 2: return 'bg-yellow-100'; // March
    case 3: return 'bg-green-100'; // April
    case 4: return 'bg-blue-100'; // May
    case 5: return 'bg-purple-100'; // June
    case 6: return 'bg-red-100'; // July
    case 7: return 'bg-orange-100'; // August
    case 8: return 'bg-yellow-100'; // September
    case 9: return 'bg-green-100'; // October
    case 10: return 'bg-blue-100'; // November
    case 11: return 'bg-purple-100'; // December
    default: return 'bg-neutral-100';
  }
};

// Helper function to convert 24-hour time to 12-hour format
export const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper function to get day of week for an activity
export const getDayOfWeek = (dateStr: string): string => {
  if (!dateStr) return 'No dates';
  
  // Parse the date string properly in local timezone
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed, creates date in local timezone
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

// Helper function to get day of week index for sorting (0 = Monday, 1 = Tuesday, etc.)
export const getDayOfWeekIndex = (dateStr: string): number => {
  if (!dateStr) return 7; // Put activities with no dates at the end
  
  // Parse the date string properly in local timezone
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed, creates date in local timezone
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Convert to Monday-first (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}; 
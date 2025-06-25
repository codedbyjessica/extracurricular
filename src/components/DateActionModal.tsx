'use client';

import { useState, useEffect } from 'react';

interface DateActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'add' | 'remove' | 'note', note?: string) => void;
  activityName: string;
  action: 'add' | 'remove';
  dateRange: string;
  dateCount: number;
  currentNote?: string; // Existing note for these dates
}

export default function DateActionModal({
  isOpen,
  onClose,
  onConfirm,
  activityName,
  action,
  dateRange,
  dateCount,
  currentNote
}: DateActionModalProps) {
  const [note, setNote] = useState('');

  // Reset note when modal opens
  useEffect(() => {
    if (isOpen) {
      setNote(currentNote || '');
    }
  }, [isOpen, currentNote]);

  const handleAddNote = () => {
    onConfirm('note', note.trim() || undefined);
    onClose();
  };

  const handleAddRemoveActivity = () => {
    onConfirm(action, note.trim() || undefined);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  const isSingleDate = dateCount === 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Manage Activity
          </h3>
          
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              Activity: <span className="font-medium">{activityName}</span>
            </p>
            <p className="text-gray-700 mb-2">
              Date{dateCount > 1 ? 's' : ''}: <span className="font-medium">{dateRange}</span>
            </p>
          </div>

          {/* Note Input - Only show for single date selections */}
          {isSingleDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note about this day's class
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add notes about this day's class (e.g., special guest, makeup class, different location...)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {/* Multiple date message */}
          {!isSingleDate && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Are you sure you want to {action} <span className="font-medium">{activityName}</span> on {dateCount} dates?
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Notes can only be added for individual date selections.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            {/* Show different buttons based on single vs multiple dates */}
            {isSingleDate ? (
              <>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Note
                </button>
                <button
                  onClick={handleAddRemoveActivity}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    action === 'remove' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {action === 'add' ? 'Add Activity' : 'Remove Activity'}
                </button>
              </>
            ) : (
              <button
                onClick={handleAddRemoveActivity}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  action === 'remove' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {action === 'add' ? 'Add Activity' : 'Remove Activity'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
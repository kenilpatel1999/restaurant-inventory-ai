import { useState } from 'react';
import { format, addDays, subMonths, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  onApply: () => void;
  onClear: () => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange, onApply, onClear }: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper function to generate calendar days
  const getCalendarDays = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let current = startDate;

    while (current <= endDate) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }

    return days;
  };

  const isDateInRange = (date: Date) => {
    if (!dateRange.from || !dateRange.to) return false;
    return date >= dateRange.from && date <= dateRange.to;
  };

  const isDateStart = (date: Date) => {
    return dateRange.from && isSameDay(date, dateRange.from);
  };

  const isDateEnd = (date: Date) => {
    return dateRange.to && isSameDay(date, dateRange.to);
  };

  const handleDateClick = (date: Date) => {
    // Normalize date to midnight
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates
    if (normalizedDate < today) return;

    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      onDateRangeChange({ from: normalizedDate, to: undefined });
    } else {
      if (normalizedDate < dateRange.from) {
        onDateRangeChange({ from: normalizedDate, to: dateRange.from });
      } else {
        onDateRangeChange({ from: dateRange.from, to: normalizedDate });
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[320px]">
      {/* Selected range display */}
      <div className="mb-4 space-y-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">Selected Range:</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-w-[120px]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : '-'}
            </p>
          </div>
          <span className="text-gray-400">-</span>
          <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-w-[120px]">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Calendar */}
      <div className="mb-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {getCalendarDays(currentMonth).map((date, index) => {
            const isStart = isDateStart(date);
            const isEnd = isDateEnd(date);
            const inRange = isDateInRange(date);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = date < today;

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={isPast}
                className={cn(
                  "h-9 w-9 text-sm flex items-center justify-center transition-all",
                  isPast && "text-gray-300 dark:text-gray-600 opacity-40 cursor-not-allowed",
                  !isCurrentMonth && !isPast && "text-gray-300 dark:text-gray-600 opacity-50",
                  isStart && !isPast && "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold rounded-l-full shadow-md",
                  isEnd && !isPast && "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold rounded-r-full shadow-md",
                  inRange && !isStart && !isEnd && !isPast && "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-900/40 text-blue-600 dark:text-blue-400 font-medium",
                  !inRange && !isStart && !isEnd && !isPast && "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
              onDateRangeChange({ from: now, to: weekEnd });
            }}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const monthEnd = endOfMonth(now);
              onDateRangeChange({ from: now, to: monthEnd });
            }}
            className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            This Month
          </button>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onApply}
            disabled={!dateRange.from || !dateRange.to}
            className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import clsx from "clsx";
import { format, isSameDay } from "date-fns";
import type { Shift } from "../../types";
import { ShiftBar } from "./ShiftBar";

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  shifts: Shift[];
  onClick: () => void;
  onShiftClick: (shift: Shift) => void;
  timezone: string;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isToday,
  shifts,
  onClick,
  onShiftClick,
  timezone,
}) => {
  const dayShifts = shifts.filter((shift) =>
    isSameDay(new Date(shift.start), date)
  );

  return (
    <div
      className={clsx(
        "min-h-[120px] border border-gray-200 p-2",
        isCurrentMonth ? "bg-white" : "bg-gray-50",
        "hover:bg-gray-50 transition-colors"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={clsx(
            "text-sm font-medium",
            isToday &&
              "bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center",
            !isToday && isCurrentMonth && "text-gray-900",
            !isToday && !isCurrentMonth && "text-gray-400"
          )}
        >
          {format(date, "d")}
        </span>
        <button
          onClick={onClick}
          className="text-gray-400 hover:text-primary-600 transition-colors"
          aria-label={`Add shift for ${format(date, "MMMM d, yyyy")}`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-1">
        {dayShifts.map((shift) => (
          <ShiftBar
            key={shift.id}
            shift={shift}
            onClick={() => onShiftClick(shift)}
            timezone={timezone}
          />
        ))}
      </div>
    </div>
  );
};

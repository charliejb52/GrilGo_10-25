import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isToday as checkIsToday,
} from "date-fns";
import { addMonths, subMonths } from "../../utils/dateHelpers";
import { getCalendarDays } from "../../utils/dateHelpers";
import { useShifts } from "../../hooks/useShifts";
import { useStore } from "../../store/useStore";
import { CalendarDay } from "./CalendarDay";
import { Button } from "../common/Button";
import type { Shift } from "../../types";

interface CalendarProps {
  onAddShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  onAddShift,
  onEditShift,
}) => {
  const { currentBusiness, selectedDate, setSelectedDate } = useStore();
  const { shifts, fetchShifts } = useShifts();
  const [isLoading, setIsLoading] = useState(false);

  const timezone = currentBusiness?.timezone || "America/New_York";
  const calendarDays = getCalendarDays(selectedDate);

  useEffect(() => {
    if (currentBusiness) {
      setIsLoading(true);
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      fetchShifts(start.toISOString(), end.toISOString()).finally(() =>
        setIsLoading(false)
      );
    }
  }, [currentBusiness, selectedDate, fetchShifts]);

  const handlePrevMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(selectedDate, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-700 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0 flex-1 border-l border-t border-gray-200">
          {calendarDays.map((date) => (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              isCurrentMonth={isSameMonth(date, selectedDate)}
              isToday={checkIsToday(date)}
              shifts={shifts}
              onClick={() => onAddShift(date)}
              onShiftClick={onEditShift}
              timezone={timezone}
            />
          ))}
        </div>
      )}
    </div>
  );
};

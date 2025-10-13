import React from "react";
import type { Shift } from "../../types";
import { formatDate } from "../../utils/dateHelpers";
import { lightenColor } from "../../utils/colorGenerator";

interface ShiftBarProps {
  shift: Shift;
  onClick: () => void;
  timezone: string;
}

export const ShiftBar: React.FC<ShiftBarProps> = ({
  shift,
  onClick,
  timezone,
}) => {
  const employeeName = shift.employee?.name || "Unassigned";
  const employeeColor = shift.employee?.color || "#6b7280";
  const startTime = formatDate(shift.start, "h:mm a", timezone);
  const endTime = formatDate(shift.end, "h:mm a", timezone);

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-1 rounded text-xs mb-1 hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: lightenColor(employeeColor, 80),
        borderLeft: `3px solid ${employeeColor}`,
      }}
    >
      <div className="font-medium truncate">{employeeName}</div>
      <div className="text-gray-600">
        {startTime} - {endTime}
      </div>
    </button>
  );
};

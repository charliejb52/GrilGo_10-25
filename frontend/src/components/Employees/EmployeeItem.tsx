import React from "react";
import type { Employee } from "../../types";
import { Button } from "../common/Button";

interface EmployeeItemProps {
  employee: Employee;
  onDelete?: (id: string) => void;
  isManager: boolean;
}

export const EmployeeItem: React.FC<EmployeeItemProps> = ({
  employee,
  onDelete,
  isManager,
}) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: employee.color || "#6b7280" }}
        >
          {employee.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900">{employee.name}</p>
          <p className="text-sm text-gray-600">
            {employee.role || "No role"} • {employee.email || "No email"}
          </p>
        </div>
      </div>
      {isManager && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(employee.id)}
          aria-label={`Delete ${employee.name}`}
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      )}
    </div>
  );
};

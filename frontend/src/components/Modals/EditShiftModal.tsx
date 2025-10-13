import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { formatDate, parseDate } from "../../utils/dateHelpers";
import {
  validateShiftTimes,
  detectShiftConflicts,
} from "../../utils/validation";
import type { Shift } from "../../types";

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  initialDate?: Date;
}

export const EditShiftModal: React.FC<EditShiftModalProps> = ({
  isOpen,
  onClose,
  shift,
  initialDate,
}) => {
  const {
    currentBusiness,
    employees,
    shifts,
    user,
    addShift,
    updateShift,
    deleteShift,
  } = useStore();
  const timezone = currentBusiness?.timezone || "America/New_York";

  const [employeeId, setEmployeeId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [role, setRole] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isManager = currentBusiness?.owner_user_id === user?.id;
  const isEditMode = !!shift;

  useEffect(() => {
    if (shift) {
      // Edit mode
      setEmployeeId(shift.employee_id || "");
      setStartDate(formatDate(shift.start, "yyyy-MM-dd", timezone));
      setStartTime(formatDate(shift.start, "HH:mm", timezone));
      setEndDate(formatDate(shift.end, "yyyy-MM-dd", timezone));
      setEndTime(formatDate(shift.end, "HH:mm", timezone));
      setRole(shift.role || "");
      setNotes(shift.notes || "");
    } else if (initialDate) {
      // Add mode
      const dateStr = formatDate(initialDate, "yyyy-MM-dd", timezone);
      setEmployeeId("");
      setStartDate(dateStr);
      setStartTime("09:00");
      setEndDate(dateStr);
      setEndTime("17:00");
      setRole("");
      setNotes("");
    }
    setError("");
  }, [shift, initialDate, timezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentBusiness || !isManager) {
      setError("You do not have permission to modify shifts");
      return;
    }

    // Combine date and time
    const startISO = parseDate(
      `${startDate} ${startTime}`,
      "yyyy-MM-dd HH:mm",
      timezone
    ).toISOString();
    const endISO = parseDate(
      `${endDate} ${endTime}`,
      "yyyy-MM-dd HH:mm",
      timezone
    ).toISOString();

    // Validate times
    const timeError = validateShiftTimes(startISO, endISO);
    if (timeError) {
      setError(timeError);
      return;
    }

    // Check for conflicts
    const conflict = detectShiftConflicts(
      { employee_id: employeeId || null, start: startISO, end: endISO },
      shifts,
      shift?.id
    );

    if (conflict) {
      const conflictEmployee = employees.find(
        (e) => e.id === conflict.employee_id
      );
      setError(
        `Conflict detected: ${conflictEmployee?.name} already has a shift at this time`
      );
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode && shift) {
        // Update existing shift
        const { data, error: updateError } = await supabase
          .from("shifts")
          .update({
            employee_id: employeeId || null,
            start: startISO,
            end: endISO,
            role: role || null,
            notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", shift.id)
          .select("*, employee:employees(*)")
          .single();

        if (updateError) throw updateError;
        updateShift(shift.id, data);
      } else {
        // Create new shift
        const { data, error: insertError } = await supabase
          .from("shifts")
          .insert({
            business_id: currentBusiness.id,
            employee_id: employeeId || null,
            start: startISO,
            end: endISO,
            role: role || null,
            notes: notes || null,
            created_by: user?.id,
          })
          .select("*, employee:employees(*)")
          .single();

        if (insertError) throw insertError;
        addShift(data);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save shift");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!shift || !isManager) return;

    if (!confirm("Are you sure you want to delete this shift?")) {
      return;
    }

    setIsLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from("shifts")
        .delete()
        .eq("id", shift.id);

      if (deleteError) throw deleteError;
      deleteShift(shift.id);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete shift");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isManager && isOpen) {
    // Read-only view for employees
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Shift Details">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Employee</p>
            <p className="text-base font-medium">
              {shift?.employee?.name || "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="text-base">
              {shift && formatDate(shift.start, "MMM d, yyyy h:mm a", timezone)}{" "}
              - {shift && formatDate(shift.end, "h:mm a", timezone)}
            </p>
          </div>
          {shift?.role && (
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-base">{shift.role}</p>
            </div>
          )}
          {shift?.notes && (
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-base">{shift.notes}</p>
            </div>
          )}
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Shift" : "Add Shift"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="employee"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Employee
          </label>
          <select
            id="employee"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-3 py-2"
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} {emp.role && `(${emp.role})`}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <Input
          label="Role (optional)"
          type="text"
          placeholder="e.g., Barista, Manager"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-3 py-2"
            placeholder="Any additional notes..."
          />
        </div>

        <div className="flex gap-2 pt-4">
          {isEditMode && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={isLoading}
            >
              Delete
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="ml-auto"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditMode ? "Save Changes" : "Add Shift"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

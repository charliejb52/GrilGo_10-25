import React from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { formatDate } from "../../utils/dateHelpers";
import type { ParsedShift } from "../../types";

interface ShiftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  shifts: ParsedShift[];
  warnings: string[];
  errors: string[];
  timezone: string;
}

export const ShiftPreviewModal: React.FC<ShiftPreviewModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  shifts,
  warnings,
  errors,
  timezone,
}) => {
  const hasErrors = errors.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Generated Shifts - Preview"
      size="xl"
    >
      <div className="space-y-4">
        {/* Errors */}
        {hasErrors && (
          <div className="rounded-md bg-red-50 p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Errors</h4>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="rounded-md bg-yellow-50 p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Warnings
            </h4>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              {warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Shifts Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Generated Shifts ({shifts.length})
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {shifts.map((shift, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {shift.employeeName}
                    </p>
                    {shift.role && (
                      <p className="text-sm text-gray-600">{shift.role}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-900">
                      {formatDate(shift.start, "MMM d, yyyy", timezone)}
                    </p>
                    <p className="text-gray-600">
                      {formatDate(shift.start, "h:mm a", timezone)} -{" "}
                      {formatDate(shift.end, "h:mm a", timezone)}
                    </p>
                  </div>
                </div>
                {shift.notes && (
                  <p className="text-sm text-gray-600 mt-2">{shift.notes}</p>
                )}
                {shift.source_text && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    "{shift.source_text}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onAccept}
            disabled={hasErrors || shifts.length === 0}
            className="ml-auto"
          >
            Accept & Add Shifts
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Button } from "../common/Button";
import { ShiftPreviewModal } from "../Modals/ShiftPreviewModal";
import { format } from "date-fns";
import type { ParseShiftsResponse, ParsedShift } from "../../types";

export const ChatComposer: React.FC = () => {
  const { currentBusiness, employees, user, selectedDate, addShifts } =
    useStore();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<ParseShiftsResponse | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isManager = currentBusiness?.owner_user_id === user?.id;
  const timezone = currentBusiness?.timezone || "America/New_York";

  const handleGenerate = async () => {
    if (!text.trim() || !currentBusiness || !isManager) return;

    setError("");
    setIsLoading(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error("Not authenticated");
      }

      // Use Railway backend URL in production, proxy in development
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const backendUrl = apiUrl || "http://localhost:3001";
      const apiEndpoint = `${backendUrl}/api/parse-shifts`;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          month: format(selectedDate, "yyyy-MM"),
          business_id: currentBusiness.id,
          timezone,
          employees: employees.map((e) => ({
            id: e.id,
            name: e.name,
            role: e.role,
          })),
        }),
      });

      if (!response.ok) {
        // Try to parse error response, but handle non-JSON responses
        let errorMessage = "Failed to parse shifts";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, get text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse response, handle non-JSON responses
      let data: ParseShiftsResponse;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `Invalid response from server: ${response.status} ${response.statusText}`
        );
      }
      setPreviewData(data);
      setIsPreviewOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate shifts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptShifts = async () => {
    if (!previewData || !currentBusiness) return;

    setIsLoading(true);
    try {
      const shiftsToInsert = previewData.shifts.map((shift: ParsedShift) => ({
        business_id: currentBusiness.id,
        employee_id: shift.employeeId,
        start: shift.start,
        end: shift.end,
        role: shift.role,
        notes: shift.notes,
        source_text: shift.source_text,
        created_by: user?.id,
      }));

      const { data, error: insertError } = await supabase
        .from("shifts")
        .insert(shiftsToInsert)
        .select("*, employee:employees(*)");

      if (insertError) throw insertError;

      addShifts(data || []);

      // Reset
      setText("");
      setPreviewData(null);
      setIsPreviewOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to add shifts");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isManager) {
    return null; // Employees can't use AI composer
  }

  return (
    <>
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          AI Shift Generator
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Describe shifts in plain English, e.g., "Schedule Alice for Monday and
          Tuesday 9am to 5pm"
        </p>

        {error && (
          <div className="rounded-md bg-red-50 p-3 mb-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Add two shifts for Bob next Monday and Tuesday 8am to 4pm"
            rows={3}
            className="block w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-3 py-2 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleGenerate}
            isLoading={isLoading}
            disabled={!text.trim() || isLoading}
            className="w-full"
            size="sm"
          >
            Generate Shifts
          </Button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <p>💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Mention employee names</li>
            <li>Specify dates (e.g., "next Monday", "Oct 15")</li>
            <li>Include times (e.g., "9am to 5pm")</li>
          </ul>
        </div>
      </div>

      {previewData && (
        <ShiftPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onAccept={handleAcceptShifts}
          shifts={previewData.shifts}
          warnings={previewData.warnings}
          errors={previewData.errors}
          timezone={timezone}
        />
      )}
    </>
  );
};

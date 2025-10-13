import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { useEmployees } from "../../hooks/useEmployees";
import { EmployeeItem } from "./EmployeeItem";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { Button } from "../common/Button";

export const EmployeeList: React.FC = () => {
  const { currentBusiness, user, deleteEmployee } = useStore();
  const { employees, refetchEmployees } = useEmployees();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isManager = currentBusiness?.owner_user_id === user?.id;

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this employee? This will also delete all their shifts."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;
      deleteEmployee(id);
    } catch (err) {
      console.error("Failed to delete employee:", err);
      alert("Failed to delete employee");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Employees</h2>
        {isManager && (
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            aria-label="Add employee"
          >
            <svg
              className="w-4 h-4 mr-1"
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
            Add
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No employees yet</p>
            {isManager && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2"
              >
                Add your first employee
              </Button>
            )}
          </div>
        ) : (
          employees.map((employee) => (
            <EmployeeItem
              key={employee.id}
              employee={employee}
              onDelete={isManager ? handleDelete : undefined}
              isManager={isManager}
            />
          ))
        )}
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refetchEmployees}
      />
    </div>
  );
};

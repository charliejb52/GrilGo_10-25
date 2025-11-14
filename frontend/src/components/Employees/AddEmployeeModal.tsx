import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { validateEmail, validateEmployeeName } from "../../utils/validation";
import { generateEmployeeColor } from "../../utils/colorGenerator";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentBusiness, addEmployee } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [color, setColor] = useState(generateEmployeeColor());
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!currentBusiness) {
      setErrors({ general: "No business selected" });
      return;
    }

    // Validation
    const newErrors: typeof errors = {};
    const nameError = validateEmployeeName(name);
    if (nameError) {
      newErrors.name = nameError;
    }
    if (email && !validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // First, insert the employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .insert({
          business_id: currentBusiness.id,
          name: name.trim(),
          email: email.trim() || null,
          role: role.trim() || null,
          color,
          is_manager: false,
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      addEmployee(employeeData);

      // If email is provided, create auth user via backend API
      if (email.trim()) {
        try {
          // Use Railway backend URL in production, proxy in development
          const apiUrl = import.meta.env.VITE_API_URL || "";
          const backendUrl = apiUrl || "http://localhost:3001";
          const apiEndpoint = `${backendUrl}/api/businesses/${currentBusiness.id}/employees`;

          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                (
                  await supabase.auth.getSession()
                ).data.session?.access_token
              }`,
            },
            body: JSON.stringify({
              employeeId: employeeData.id,
              email: email.trim(),
            }),
          });

          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { error: await response.text() };
            }
            console.error("Failed to create auth user:", errorData);
            // Note: We don't fail the entire operation if auth user creation fails
          }
        } catch (err) {
          console.error("Failed to create auth user:", err);
          // Continue anyway - employee is created, just without auth account
        }
      }

      // Reset form
      setName("");
      setEmail("");
      setRole("");
      setColor(generateEmployeeColor());

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to add employee" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Employee">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        )}

        <Input
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          helperText="If provided, an account will be created for this employee"
        />

        <Input
          label="Role (optional)"
          type="text"
          placeholder="e.g., Barista, Manager"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <div>
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <span className="text-sm text-gray-600">{color}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setColor(generateEmployeeColor())}
            >
              Random
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="ml-auto">
            Add Employee
          </Button>
        </div>
      </form>
    </Modal>
  );
};

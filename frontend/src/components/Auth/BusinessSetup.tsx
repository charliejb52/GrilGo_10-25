import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useStore } from "../../store/useStore";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { validateBusinessName } from "../../utils/validation";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export const BusinessSetup: React.FC = () => {
  const { user, setCurrentBusiness } = useStore();
  const [businessName, setBusinessName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [errors, setErrors] = useState<{
    businessName?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const nameError = validateBusinessName(businessName);
    if (nameError) {
      setErrors({ businessName: nameError });
      return;
    }

    if (!user) {
      setErrors({ general: "You must be logged in to create a business" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("businesses")
        .insert({
          name: businessName.trim(),
          timezone,
          owner_user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentBusiness(data);
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to create business" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Business
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get started by setting up your shift scheduling workspace
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Business Name"
              type="text"
              placeholder="e.g., Coffee Shop"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              error={errors.businessName}
              required
            />

            <div>
              <label
                htmlFor="timezone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 px-3 py-2 text-base"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Business
          </Button>
        </form>
      </div>
    </div>
  );
};

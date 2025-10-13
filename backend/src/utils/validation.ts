import { z } from 'zod';

export const ParseShiftRequestSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  business_id: z.string().uuid('Invalid business ID'),
  timezone: z.string().min(1, 'Timezone is required'),
  employees: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      role: z.string().nullable().optional(),
    })
  ),
});

export const CreateEmployeeRequestSchema = z.object({
  employeeId: z.string().uuid(),
  email: z.string().email(),
});

export type ParseShiftRequest = z.infer<typeof ParseShiftRequestSchema>;
export type CreateEmployeeRequest = z.infer<typeof CreateEmployeeRequestSchema>;


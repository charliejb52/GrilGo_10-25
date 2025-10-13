export interface Business {
  id: string;
  name: string;
  timezone: string;
  created_at: string;
  owner_user_id: string;
  metadata?: Record<string, any>;
}

export interface Employee {
  id: string;
  business_id: string;
  user_id: string | null;
  email: string | null;
  name: string;
  role: string | null;
  color: string | null;
  is_manager: boolean;
  created_at: string;
}

export interface Shift {
  id: string;
  business_id: string;
  employee_id: string | null;
  start: string;
  end: string;
  role: string | null;
  notes: string | null;
  source_text: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
  employee?: Employee;
}

export interface ParsedShift {
  employeeId: string | null;
  employeeName: string;
  start: string;
  end: string;
  role: string | null;
  notes: string | null;
  source_text: string | null;
}

export interface ParseShiftsResponse {
  shifts: ParsedShift[];
  warnings: string[];
  errors: string[];
}

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

export interface CalendarDay {
  date: Date;
  shifts: Shift[];
  isCurrentMonth: boolean;
  isToday: boolean;
}


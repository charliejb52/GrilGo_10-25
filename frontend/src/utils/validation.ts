import { parseISO, isBefore } from 'date-fns';
import type { Shift } from '../types';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateShiftTimes(start: string, end: string): string | null {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  
  if (!isBefore(startDate, endDate)) {
    return 'End time must be after start time';
  }
  
  return null;
}

export function detectShiftConflicts(
  newShift: { employee_id: string | null; start: string; end: string },
  existingShifts: Shift[],
  excludeShiftId?: string
): Shift | null {
  if (!newShift.employee_id) {
    return null;
  }
  
  const newStart = parseISO(newShift.start);
  const newEnd = parseISO(newShift.end);
  
  for (const shift of existingShifts) {
    // Skip if it's the same shift we're editing
    if (excludeShiftId && shift.id === excludeShiftId) {
      continue;
    }
    
    // Only check conflicts for the same employee
    if (shift.employee_id !== newShift.employee_id) {
      continue;
    }
    
    const existingStart = parseISO(shift.start);
    const existingEnd = parseISO(shift.end);
    
    // Check for overlap
    if (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    ) {
      return shift;
    }
  }
  
  return null;
}

export function validateBusinessName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Business name is required';
  }
  
  if (name.length > 100) {
    return 'Business name must be less than 100 characters';
  }
  
  return null;
}

export function validateEmployeeName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Employee name is required';
  }
  
  if (name.length > 100) {
    return 'Employee name must be less than 100 characters';
  }
  
  return null;
}


import { create } from 'zustand';
import type { Business, Employee, Shift, User } from '../types';

interface AppState {
  // Auth
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Current business
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business | null) => void;
  
  // Employees
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Shifts
  shifts: Shift[];
  setShifts: (shifts: Shift[]) => void;
  addShift: (shift: Shift) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  addShifts: (shifts: Shift[]) => void;
  
  // UI state
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  user: null,
  loading: true,
  currentBusiness: null,
  employees: [],
  shifts: [],
  selectedDate: new Date(),
};

export const useStore = create<AppState>((set) => ({
  ...initialState,
  
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  
  setCurrentBusiness: (currentBusiness) => set({ currentBusiness }),
  
  setEmployees: (employees) => set({ employees }),
  addEmployee: (employee) => set((state) => ({ 
    employees: [...state.employees, employee] 
  })),
  updateEmployee: (id, updates) => set((state) => ({
    employees: state.employees.map((e) => e.id === id ? { ...e, ...updates } : e),
  })),
  deleteEmployee: (id) => set((state) => ({
    employees: state.employees.filter((e) => e.id !== id),
  })),
  
  setShifts: (shifts) => set({ shifts }),
  addShift: (shift) => set((state) => ({ 
    shifts: [...state.shifts, shift] 
  })),
  addShifts: (newShifts) => set((state) => ({ 
    shifts: [...state.shifts, ...newShifts] 
  })),
  updateShift: (id, updates) => set((state) => ({
    shifts: state.shifts.map((s) => s.id === id ? { ...s, ...updates } : s),
  })),
  deleteShift: (id) => set((state) => ({
    shifts: state.shifts.filter((s) => s.id !== id),
  })),
  
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  
  reset: () => set(initialState),
}));


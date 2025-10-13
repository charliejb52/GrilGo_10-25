import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export function useEmployees() {
  const { currentBusiness, employees, setEmployees } = useStore();

  const fetchEmployees = useCallback(async () => {
    if (!currentBusiness) return;

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('business_id', currentBusiness.id)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    setEmployees(data || []);
  }, [currentBusiness, setEmployees]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    refetchEmployees: fetchEmployees,
  };
}


import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import type { Shift } from '../types';

export function useShifts() {
  const { 
    currentBusiness, 
    shifts, 
    setShifts, 
    addShift, 
    updateShift, 
    deleteShift 
  } = useStore();

  // Fetch shifts for current business
  const fetchShifts = useCallback(async (startDate?: string, endDate?: string) => {
    if (!currentBusiness) return;

    let query = supabase
      .from('shifts')
      .select('*, employee:employees(*)')
      .eq('business_id', currentBusiness.id)
      .order('start', { ascending: true });

    if (startDate) {
      query = query.gte('start', startDate);
    }
    if (endDate) {
      query = query.lte('start', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }

    setShifts(data || []);
  }, [currentBusiness, setShifts]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!currentBusiness) return;

    const channel = supabase
      .channel('shifts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shifts',
          filter: `business_id=eq.${currentBusiness.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the full shift with employee data
            const { data } = await supabase
              .from('shifts')
              .select('*, employee:employees(*)')
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              addShift(data as Shift);
            }
          } else if (payload.eventType === 'UPDATE') {
            const { data } = await supabase
              .from('shifts')
              .select('*, employee:employees(*)')
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              updateShift(payload.new.id as string, data as Partial<Shift>);
            }
          } else if (payload.eventType === 'DELETE') {
            deleteShift(payload.old.id as string);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentBusiness, addShift, updateShift, deleteShift]);

  return {
    shifts,
    fetchShifts,
  };
}


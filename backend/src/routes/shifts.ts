import { Router } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';

const router = Router();

// Note: Most shift operations are handled directly via Supabase client on frontend
// with RLS policies enforcing permissions. This route is optional/for future use.

// Get shifts for a business (with date range)
router.get('/:businessId', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { businessId } = req.params;
    const { start, end } = req.query;

    // Verify user has access to this business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user is owner or employee
    const isOwner = business.owner_user_id === req.user!.id;
    
    if (!isOwner) {
      const { data: employee } = await supabaseAdmin
        .from('employees')
        .select('*')
        .eq('business_id', businessId)
        .eq('user_id', req.user!.id)
        .single();

      if (!employee) {
        return res.status(403).json({ error: 'Not authorized to view this business' });
      }
    }

    // Fetch shifts
    let query = supabaseAdmin
      .from('shifts')
      .select('*, employee:employees(*)')
      .eq('business_id', businessId)
      .order('start', { ascending: true });

    if (start) {
      query = query.gte('start', start);
    }
    if (end) {
      query = query.lte('start', end);
    }

    const { data: shifts, error: shiftsError } = await query;

    if (shiftsError) {
      throw shiftsError;
    }

    res.json(shifts);
  } catch (error: any) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({
      error: 'Failed to fetch shifts',
      message: error.message,
    });
  }
});

export default router;


import { Router } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { parseShiftsWithAI } from '../services/openai.js';
import { ParseShiftRequestSchema } from '../utils/validation.js';

const router = Router();

router.post('/', authenticateUser, async (req: AuthRequest, res) => {
  try {
    // Validate request body
    const validationResult = ParseShiftRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.errors,
      });
    }

    const { text, month, business_id, timezone, employees } = validationResult.data;

    // Verify user is a manager of this business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', business_id)
      .eq('owner_user_id', req.user!.id)
      .single();

    if (businessError || !business) {
      return res.status(403).json({ error: 'Not authorized to manage this business' });
    }

    // Call OpenAI to parse shifts
    const result = await parseShiftsWithAI({
      text,
      month,
      timezone,
      employees,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error parsing shifts:', error);
    res.status(500).json({
      error: 'Failed to parse shifts',
      message: error.message,
    });
  }
});

export default router;


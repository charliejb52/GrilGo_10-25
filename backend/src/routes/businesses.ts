import { Router } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { CreateEmployeeRequestSchema } from '../utils/validation.js';

const router = Router();

// Create employee with auth account
router.post('/:businessId/employees', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { businessId } = req.params;

    // Validate request body
    const validationResult = CreateEmployeeRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.errors,
      });
    }

    const { employeeId, email } = validationResult.data;

    // Verify user is owner of this business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('owner_user_id', req.user!.id)
      .single();

    if (businessError || !business) {
      return res.status(403).json({ error: 'Not authorized to manage this business' });
    }

    // Verify employee exists and belongs to this business
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .eq('business_id', businessId)
      .single();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Generate a temporary password (user should reset it)
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

    // Create auth user via Supabase Admin API
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: employee.name,
      },
    });

    if (authError) {
      console.error('Failed to create auth user:', authError);
      return res.status(500).json({
        error: 'Failed to create auth account',
        message: authError.message,
      });
    }

    // Link auth user to employee record
    const { error: updateError } = await supabaseAdmin
      .from('employees')
      .update({ user_id: authUser.user.id })
      .eq('id', employeeId);

    if (updateError) {
      console.error('Failed to link employee to auth user:', updateError);
      // Try to delete the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return res.status(500).json({
        error: 'Failed to link employee account',
        message: updateError.message,
      });
    }

    res.json({
      success: true,
      userId: authUser.user.id,
      email,
      tempPassword, // In production, send this via email instead
    });
  } catch (error: any) {
    console.error('Error creating employee account:', error);
    res.status(500).json({
      error: 'Failed to create employee account',
      message: error.message,
    });
  }
});

export default router;


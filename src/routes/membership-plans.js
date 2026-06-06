import { Router } from 'express';
import { z } from 'zod';

const PlanSchema = z.object({
  name: z.string().min(1),
  duration: z.enum(['1 Month', '3 Months', '4 Months', '12 Months']),
  months_count: z.number().int().positive(),
  default_price: z.number().positive(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export function createMembershipPlansRouter(supabase) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*, enrollments(count)')
        .order('months_count');
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('id', req.params.id)
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = PlanSchema.parse(req.body);
      const { data, error } = await supabase
        .from('membership_plans')
        .insert(body)
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const body = PlanSchema.partial().parse(req.body);
      const { data, error } = await supabase
        .from('membership_plans')
        .update(body)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { error } = await supabase
        .from('membership_plans')
        .delete()
        .eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

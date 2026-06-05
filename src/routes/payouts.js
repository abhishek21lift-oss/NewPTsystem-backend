import { Router } from 'express';
import { z } from 'zod';

const PayoutSchema = z.object({
  trainer_id: z.string().uuid(),
  period_start: z.string(),
  period_end: z.string(),
  total_revenue: z.number().positive(),
  commission_pct: z.number().min(0).max(100),
  commission_amount: z.number().positive(),
});

export function createPayoutsRouter(supabase) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { trainer_id, paid, page = 1, limit = 50 } = req.query;
      let query = supabase
        .from('payouts')
        .select('*, trainers(full_name, initials)', { count: 'exact' });

      if (trainer_id) query = query.eq('trainer_id', trainer_id);
      if (paid !== undefined) query = query.eq('paid', paid === 'true');

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query
        .range(from, to)
        .order('period_start', { ascending: false });

      if (error) throw error;
      res.json({ data, count, page: Number(page), limit: Number(limit) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = PayoutSchema.parse(req.body);
      const { data, error } = await supabase
        .from('payouts')
        .insert(body)
        .select('*, trainers(full_name)')
        .single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
      }
      next(err);
    }
  });

  router.put('/:id/pay', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .update({ paid: true, paid_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

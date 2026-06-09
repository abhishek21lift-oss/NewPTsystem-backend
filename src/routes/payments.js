import { Router } from 'express';
import { z } from 'zod';

const PaymentSchema = z.object({
  enrollment_id: z.string().uuid(),
  amount: z.number().positive(),
  paid_at: z.string().optional(),
  method: z.enum(['cash', 'upi', 'card', 'transfer']).optional(),
  reference: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export function createPaymentsRouter(supabase) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { enrollment_id, page = 1, limit = 100 } = req.query;
      let query = supabase
        .from('payments')
        .select('*, enrollments!inner(clients!inner(full_name), trainers!inner(full_name))', { count: 'exact' });

      if (enrollment_id) query = query.eq('enrollment_id', enrollment_id);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.range(from, to).order('paid_at', { ascending: false });
      if (error) throw error;
      res.json({ data, count, page: Number(page), limit: Number(limit) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = PaymentSchema.parse(req.body);
      const { data, error } = await supabase
        .from('payments')
        .insert(body)
        .select()
        .single();
      if (error) throw error;

      supabase.from('activities').insert({
        actor_type: 'system',
        action: 'payment',
        description: `Payment of ₹${body.amount.toLocaleString('en-IN')} received`,
        icon: '💰',
        color: 'var(--green-muted)',
      }).catch(() => {});

      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
      }
      next(err);
    }
  });

  router.get('/outstanding', async (req, res, next) => {
    try {
      const { data, error } = await supabase.rpc('get_outstanding_balances');
      if (error?.code === 'PGRST202') return res.json([]);
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

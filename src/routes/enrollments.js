import { Router } from 'express';
import { z } from 'zod';

const EnrollmentSchema = z.object({
  client_id: z.string().uuid(),
  trainer_id: z.string().uuid(),
  plan_id: z.string().uuid(),
  total_charged: z.number().positive(),
  start_date: z.string(),
  end_date: z.string(),
});

export function createEnrollmentsRouter(supabase) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { trainer_id, status, page = 1, limit = 50 } = req.query;
      let query = supabase
        .from('enrollments')
        .select('*, clients(*), trainers(*), membership_plans(*), payments(*)', { count: 'exact' });

      if (trainer_id) query = query.eq('trainer_id', trainer_id);
      if (status) query = query.eq('status', status);

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ data, count, page: Number(page), limit: Number(limit) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/active', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*, clients(*), trainers(*), membership_plans(*)')
        .eq('status', 'active')
        .order('end_date', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = EnrollmentSchema.parse(req.body);
      const { data, error } = await supabase
        .from('enrollments')
        .insert(body)
        .select('*, clients(*), trainers(*), membership_plans(*)')
        .single();
      if (error) throw error;

      try { await supabase.from('activities').insert({
        actor_type: 'system',
        action: 'enrolled',
        description: `${data.clients?.full_name} enrolled in ${data.membership_plans?.name} with ${data.trainers?.full_name}`,
        icon: '🏋️',
        color: 'var(--green-muted)',
      }); } catch {};

      res.status(201).json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
      }
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const body = EnrollmentSchema.partial().parse(req.body);
      const { data, error } = await supabase
        .from('enrollments')
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

  return router;
}

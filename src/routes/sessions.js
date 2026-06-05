import { Router } from 'express';
import { z } from 'zod';

const SessionSchema = z.object({
  enrollment_id: z.string().uuid(),
  client_id: z.string().uuid(),
  trainer_id: z.string().uuid(),
  scheduled_at: z.string(),
  status: z.enum(['scheduled', 'completed', 'no_show', 'cancelled']).optional(),
  notes: z.string().optional(),
});

export function createSessionsRouter(supabase) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { trainer_id, date, page = 1, limit = 50 } = req.query;
      let query = supabase
        .from('sessions')
        .select('*, clients(full_name, phone), trainers(full_name, initials)', { count: 'exact' });

      if (trainer_id) query = query.eq('trainer_id', trainer_id);
      if (date) {
        const d = new Date(date);
        const start = new Date(d.setHours(0, 0, 0, 0)).toISOString();
        const end = new Date(d.setHours(23, 59, 59, 999)).toISOString();
        query = query.gte('scheduled_at', start).lte('scheduled_at', end);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query
        .range(from, to)
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      res.json({ data, count, page: Number(page), limit: Number(limit) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/today', async (req, res, next) => {
    try {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('sessions')
        .select('*, clients(full_name, phone), trainers(full_name, initials)')
        .gte('scheduled_at', start.toISOString())
        .lte('scheduled_at', end.toISOString())
        .order('scheduled_at', { ascending: true });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/weekly-summary', async (req, res, next) => {
    try {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data, error } = await supabase
        .from('sessions')
        .select('*, trainers(full_name, initials)')
        .gte('scheduled_at', weekStart.toISOString())
        .lte('scheduled_at', weekEnd.toISOString())
        .order('scheduled_at');

      if (error) throw error;

      const dailyCounts = Array(7).fill(0);
      const trainerCounts = {};

      data?.forEach(s => {
        const day = new Date(s.scheduled_at).getDay();
        dailyCounts[day]++;
        const name = s.trainers?.full_name;
        if (name) trainerCounts[name] = (trainerCounts[name] || 0) + 1;
      });

      res.json({
        total: data?.length || 0,
        daily: dailyCounts,
        by_trainer: trainerCounts,
        sessions: data,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = SessionSchema.parse(req.body);
      const { data, error } = await supabase
        .from('sessions')
        .insert(body)
        .select('*, clients(full_name), trainers(full_name)')
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

  router.put('/:id', async (req, res, next) => {
    try {
      const body = SessionSchema.partial().parse(req.body);
      const { data, error } = await supabase
        .from('sessions')
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

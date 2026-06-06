import { Router } from 'express';
import { z } from 'zod';

const ClientSchema = z.object({
  full_name: z.string().min(1).max(100),
  gender: z.enum(['Male', 'Female']),
  phone: z.string().optional(),
  email: z.string().email().optional().nullable(),
  notes: z.string().optional(),
});

export function createClientsRouter(supabase) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { search, gender, status, page = 1, limit = 200 } = req.query;
      let query = supabase
        .from('clients')
        .select('*, enrollments!inner(*, membership_plans(*), trainers(*))', { count: 'exact' });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,display_id.ilike.%${search}%`);
      }
      if (gender) {
        query = eq('gender', gender);
      }
      if (status) {
        query = query.eq('enrollments.status', status);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ data, count, page: Number(page), limit: Number(limit) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*, enrollments(*, membership_plans(*), trainers(*), payments(*))')
        .eq('id', req.params.id)
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Client not found' });
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = ClientSchema.parse(req.body);
      const { data: countData } = await supabase.from('clients').select('*', { count: 'exact', head: true });
      const nextNum = (countData?.count || 0) + 1;
      const displayId = `FS${String(nextNum).padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('clients')
        .insert({ ...body, display_id: displayId })
        .select()
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
      const body = ClientSchema.partial().parse(req.body);
      const { data, error } = await supabase
        .from('clients')
        .update(body)
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Client not found' });
      res.json(data);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation Error', details: err.errors });
      }
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ message: 'Client deleted' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

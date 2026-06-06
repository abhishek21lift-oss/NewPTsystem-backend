import { Router } from 'express';
import { z } from 'zod';

const TrainerSchema = z.object({
  full_name: z.string().min(1),
  short_code: z.string().length(2).optional(),
  initials: z.string().length(2),
  avatar_color: z.string().optional(),
  specialty: z.string().optional(),
  certification: z.string().optional(),
  commission_pct: z.number().min(0).max(100).optional(),
});

export function createTrainersRouter(supabase) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*, enrollments(count), profiles(full_name, email)')
        .order('full_name');
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id/stats', async (req, res, next) => {
    try {
      const { id } = req.params;

      const [trainerRes, enrollmentsRes, revenueRes, activeRes] = await Promise.all([
        supabase.from('trainers').select('*').eq('id', id).single(),
        supabase.from('enrollments').select('*, payments(amount)', { count: 'exact' }).eq('trainer_id', id),
        supabase.rpc('get_trainer_revenue', { p_trainer_id: id }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true })
          .eq('trainer_id', id).eq('status', 'active'),
      ]);

      if (trainerRes.error) throw trainerRes.error;

      const totalRevenue = revenueRes.data?.total_revenue || 0;
      const commission = totalRevenue * (trainerRes.data?.commission_pct / 100);

      res.json({
        trainer: trainerRes.data,
        total_enrollments: enrollmentsRes.count || 0,
        active_clients: activeRes.count || 0,
        total_revenue: totalRevenue,
        commission,
        enrollments: enrollmentsRes.data,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const body = TrainerSchema.parse(req.body);
      const { data, error } = await supabase
        .from('trainers')
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
      const body = TrainerSchema.partial().parse(req.body);
      const { data, error } = await supabase
        .from('trainers')
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

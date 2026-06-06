import { Router } from 'express';

export function createAnalyticsRouter(supabase) {
  const router = Router();

  router.get('/dashboard', async (req, res, next) => {
    try {
      const [
        { count: totalClients },
        { count: activeEnrollments },
        { count: expiredEnrollments },
        { count: soonEnrollments },
        { data: totalRevenue },
        { data: monthlyRevenue },
        { data: activities },
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
        supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'soon'),
        supabase.rpc('get_total_revenue'),
        supabase.rpc('get_monthly_revenue'),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      res.json({
        stats: {
          total_clients: totalClients || 0,
          active_enrollments: activeEnrollments || 0,
          expired_enrollments: expiredEnrollments || 0,
          soon_enrollments: soonEnrollments || 0,
          total_revenue: totalRevenue?.[0]?.total_revenue || 0,
        },
        monthly_revenue: monthlyRevenue || [],
        recent_activities: activities || [],
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/revenue/monthly', async (req, res, next) => {
    try {
      const { months = 15 } = req.query;
      const { data, error } = await supabase.rpc('get_monthly_revenue', { p_months: Number(months) });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/trainer-breakdown', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          id, full_name, short_code, initials, commission_pct,
          enrollments!inner(
            id, total_charged, status,
            payments(amount)
          )
        `);
      if (error) throw error;

      const breakdown = data.map(t => {
        const totalRevenue = t.enrollments.reduce((sum, e) => {
          const paid = e.payments.reduce((s, p) => s + Number(p.amount), 0);
          return sum + paid;
        }, 0);
        return {
          id: t.id,
          full_name: t.full_name,
          short_code: t.short_code,
          initials: t.initials,
          total_clients: t.enrollments.length,
          total_revenue: totalRevenue,
          commission: totalRevenue * (t.commission_pct / 100),
        };
      });

      res.json(breakdown);
    } catch (err) {
      next(err);
    }
  });

  router.get('/plan-distribution', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('id, name, duration, months_count, enrollments(count)')
        .eq('is_active', true);
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/gender-distribution', async (req, res, next) => {
    try {
      const { data, error } = await supabase.rpc('get_gender_distribution');
      if (error) throw error;
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  router.get('/forecast', async (req, res, next) => {
    try {
      const { data: activeEnrollments } = await supabase
        .from('enrollments')
        .select('*, membership_plans(months_count)')
        .eq('status', 'active');

      const monthlyProjection = {};
      const now = new Date();
      for (let i = 0; i < 6; i++) {
        const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const key = `${m.toLocaleString('en-US', { month: 'short' })} ${m.getFullYear()}`;
        monthlyProjection[key] = 0;
      }

      activeEnrollments?.forEach(e => {
        const monthlyAmount = Number(e.total_charged) / Number(e.membership_plans?.months_count || 1);
        const startDate = new Date(e.start_date);
        const endDate = new Date(e.end_date);
        Object.keys(monthlyProjection).forEach((key, i) => {
          const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
          if (m >= startDate && m <= endDate) {
            monthlyProjection[key] += monthlyAmount;
          }
        });
      });

      res.json({
        forecast: Object.entries(monthlyProjection).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) })),
        total_6month: Object.values(monthlyProjection).reduce((a, b) => a + b, 0),
        active_enrollments_count: activeEnrollments?.length || 0,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

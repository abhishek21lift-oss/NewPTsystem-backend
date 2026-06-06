// Seed script — run with: node src/scripts/seed.js
// Uses service_role key to bypass RLS

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const seedData = {
  trainers: [
    { short_code: 'AK', full_name: 'Abhishek Katiyar', initials: 'AK', avatar_color: 'linear-gradient(145deg, #FF3B30, #8B0000)', specialty: 'Powerlifting & Strength', certification: 'K11 Certified', commission_pct: 50, is_head: true, is_owner: true },
    { short_code: 'RS', full_name: 'Riya Singh', initials: 'RS', avatar_color: 'linear-gradient(145deg, #FF6B9D, #D63060)', specialty: "Women's Fitness", certification: 'Personal Trainer', commission_pct: 50, is_head: false, is_owner: false },
    { short_code: 'RK', full_name: 'Rajat Katiyar', initials: 'RK', avatar_color: 'linear-gradient(145deg, #5AC8FA, #0A84FF)', specialty: 'Strength & Conditioning', certification: 'Strength Coach', commission_pct: 50, is_head: false, is_owner: false },
  ],

  plans: [
    { name: '1 Month', duration: '1 Month', months_count: 1, default_price: 6000 },
    { name: '3 Months', duration: '3 Months', months_count: 3, default_price: 25000 },
    { name: '4 Months', duration: '4 Months', months_count: 4, default_price: 28000 },
    { name: '12 Months', duration: '12 Months', months_count: 12, default_price: 65000 },
  ],

  clients: [
    { display_id: 'FS0010', full_name: 'Ajeet Yadav', gender: 'Male', phone: '9839095091' },
    { display_id: 'FS0064', full_name: 'Aman Verma', gender: 'Male', phone: '9151212832' },
    { display_id: 'FS0029', full_name: 'Aman Gupta', gender: 'Male', phone: '9876543210' },
    { display_id: 'FS0051', full_name: 'Amit Shukla', gender: 'Male', phone: '9454347015' },
    { display_id: 'FS0003', full_name: 'Ankush Thakur', gender: 'Male', phone: '6388152219' },
    { display_id: 'FS0040', full_name: 'Arti Tripathi', gender: 'Female', phone: '7007047096' },
    { display_id: 'FS0034', full_name: 'Anjali Srivastava', gender: 'Female', phone: '7318556145' },
    { display_id: 'FS0041', full_name: 'Abhishek Sharma', gender: 'Male', phone: '6386027095' },
    { display_id: 'FS0033', full_name: 'Stuti Yadav', gender: 'Female', phone: '6387171298' },
    { display_id: 'FS0011', full_name: 'Shivang Swarnkar', gender: 'Male', phone: '9120437420' },
    { display_id: 'FS0062', full_name: 'Rahul Rathore', gender: 'Male', phone: '8799465964' },
    { display_id: 'FS0067', full_name: 'Jay Singh', gender: 'Male', phone: '9793768731' },
    { display_id: 'FS0060', full_name: 'Ankit Gupta', gender: 'Male', phone: '9661670707' },
    { display_id: 'FS0061', full_name: 'Renuka', gender: 'Female', phone: '7355926229' },
    { display_id: 'FS0046', full_name: 'Neetu Singh', gender: 'Female', phone: '9335894079' },
    { display_id: 'FS0063', full_name: 'Saurabh Singh', gender: 'Male', phone: '9958740307' },
    { display_id: 'FS0048', full_name: 'Neelam Singh', gender: 'Female', phone: '6388414011' },
    { display_id: 'FS0066', full_name: 'Tarang Gupta', gender: 'Male', phone: '9161006500' },
    { display_id: 'FS0050', full_name: 'Vaibhav', gender: 'Male', phone: '9795158303' },
    { display_id: 'FS0039', full_name: 'Ishan Tiwari', gender: 'Female', phone: '7985212886' },
    { display_id: 'FS0037', full_name: 'Ratnam Yadav', gender: 'Male', phone: '6307607885' },
    { display_id: 'FS0065', full_name: 'Deepak Rathore', gender: 'Male', phone: '9118534812' },
    { display_id: 'FS0001', full_name: 'Rashi Bhatia', gender: 'Female', phone: '—' },
    { display_id: 'FS0002', full_name: 'Vipul Bhatia', gender: 'Male', phone: '—' },
    { display_id: 'FS0004', full_name: 'Prince', gender: 'Male', phone: '—' },
    { display_id: 'FS0008', full_name: 'Vipul Vikram Singh', gender: 'Male', phone: '—' },
  ],

  revenueGoals: [
    { month: '2026-04-01', target_amount: 200000 },
    { month: '2026-05-01', target_amount: 180000 },
    { month: '2026-06-01', target_amount: 180000 },
    { month: '2026-07-01', target_amount: 160000 },
    { month: '2026-08-01', target_amount: 160000 },
    { month: '2026-09-01', target_amount: 200000 },
    { month: '2026-10-01', target_amount: 220000 },
  ],
};

async function seed() {
  console.log('🌱 Seeding 619 PT Studio database...\n');

  // Clear existing data
  for (const table of ['activities', 'notifications', 'payouts', 'sessions', 'payments', 'enrollments', 'clients', 'revenue_goals', 'membership_plans', 'trainers']) {
    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  // Insert trainers
  const { data: trainers, error: tErr } = await supabase.from('trainers').insert(seedData.trainers).select();
  if (tErr) { console.error('Trainer error:', tErr); return; }
  console.log(`✅ ${trainers.length} trainers inserted`);

  const abh = trainers.find(t => t.short_code === 'AK');
  const riy = trainers.find(t => t.short_code === 'RS');
  const raj = trainers.find(t => t.short_code === 'RK');

  // Insert plans
  const { data: plans, error: pErr } = await supabase.from('membership_plans').insert(seedData.plans).select();
  if (pErr) { console.error('Plan error:', pErr); return; }
  console.log(`✅ ${plans.length} plans inserted`);

  const p1 = plans.find(p => p.duration === '1 Month');
  const p3 = plans.find(p => p.duration === '3 Months');
  const p4 = plans.find(p => p.duration === '4 Months');
  const p12 = plans.find(p => p.duration === '12 Months');

  // Insert clients
  const { data: clients, error: cErr } = await supabase.from('clients').insert(seedData.clients).select();
  if (cErr) { console.error('Client error:', cErr); return; }
  console.log(`✅ ${clients.length} clients inserted`);

  // Enrollment data
  const enrollments = [
    { client: 'Ajeet Yadav', trainer: abh, plan: p3, total: 25000, start: '2026-04-24', end: '2026-07-24', status: 'active' },
    { client: 'Aman Verma', trainer: riy, plan: p3, total: 25000, start: '2026-04-14', end: '2026-07-14', status: 'active' },
    { client: 'Aman Gupta', trainer: abh, plan: p3, total: 25000, start: '2026-01-17', end: '2026-04-17', status: 'expired' },
    { client: 'Amit Shukla', trainer: riy, plan: p3, total: 25000, start: '2026-02-17', end: '2026-05-17', status: 'active' },
    { client: 'Ankush Thakur', trainer: abh, plan: p3, total: 25000, start: '2026-04-14', end: '2026-07-14', status: 'active' },
    { client: 'Arti Tripathi', trainer: raj, plan: p3, total: 25000, start: '2026-02-28', end: '2026-05-28', status: 'active' },
    { client: 'Anjali Srivastava', trainer: raj, plan: p3, total: 25000, start: '2026-04-01', end: '2026-07-01', status: 'active' },
    { client: 'Abhishek Sharma', trainer: raj, plan: p3, total: 25000, start: '2026-02-09', end: '2026-05-09', status: 'active' },
    { client: 'Stuti Yadav', trainer: raj, plan: p4, total: 28000, start: '2026-01-30', end: '2026-05-30', status: 'active' },
    { client: 'Shivang Swarnkar', trainer: abh, plan: p3, total: 25000, start: '2026-02-09', end: '2026-05-09', status: 'active' },
    { client: 'Rahul Rathore', trainer: abh, plan: p3, total: 25000, start: '2026-03-27', end: '2026-06-27', status: 'active' },
    { client: 'Jay Singh', trainer: abh, plan: p1, total: 8000, start: '2026-04-03', end: '2026-05-10', status: 'soon' },
    { client: 'Ankit Gupta', trainer: abh, plan: p3, total: 25000, start: '2026-04-01', end: '2026-07-01', status: 'active' },
    { client: 'Renuka', trainer: abh, plan: p1, total: 6000, start: '2026-04-10', end: '2026-05-10', status: 'active' },
    { client: 'Neetu Singh', trainer: riy, plan: p3, total: 25000, start: '2026-02-02', end: '2026-05-02', status: 'active' },
    { client: 'Saurabh Singh', trainer: riy, plan: p3, total: 25000, start: '2026-03-24', end: '2026-06-24', status: 'active' },
    { client: 'Neelam Singh', trainer: riy, plan: p3, total: 20000, start: '2026-03-17', end: '2026-06-17', status: 'active' },
    { client: 'Tarang Gupta', trainer: riy, plan: p3, total: 25000, start: '2026-04-10', end: '2026-07-10', status: 'active' },
    { client: 'Vaibhav', trainer: riy, plan: p3, total: 29000, start: '2026-04-09', end: '2026-07-09', status: 'active' },
    { client: 'Ishan Tiwari', trainer: raj, plan: p3, total: 25000, start: '2026-02-09', end: '2026-05-09', status: 'active' },
    { client: 'Ratnam Yadav', trainer: raj, plan: p3, total: 25000, start: '2026-03-26', end: '2026-06-26', status: 'active' },
    { client: 'Deepak Rathore', trainer: raj, plan: p3, total: 25000, start: '2026-03-24', end: '2026-06-24', status: 'active' },
    { client: 'Rashi Bhatia', trainer: abh, plan: p12, total: 65000, start: '2026-01-06', end: '2027-01-06', status: 'active' },
    { client: 'Vipul Bhatia', trainer: abh, plan: p12, total: 65000, start: '2026-01-06', end: '2027-01-06', status: 'active' },
    { client: 'Prince', trainer: abh, plan: p1, total: 5000, start: '2025-09-01', end: '2025-10-01', status: 'expired' },
    { client: 'Vipul Vikram Singh', trainer: abh, plan: p1, total: 10000, start: '2026-02-26', end: '2026-03-26', status: 'expired' },
  ];

  // Payment records matching v4 HTML masterClients paid amounts
  const paymentMap = {
    'Ajeet Yadav': 7000,
    'Aman Verma': 25000,
    'Aman Gupta': 20000,
    'Amit Shukla': 25000,
    'Ankush Thakur': 0,
    'Arti Tripathi': 25000,
    'Anjali Srivastava': 10000,
    'Abhishek Sharma': 25000,
    'Stuti Yadav': 28000,
    'Shivang Swarnkar': 25000,
    'Rahul Rathore': 10000,
    'Jay Singh': 8000,
    'Ankit Gupta': 25000,
    'Renuka': 6000,
    'Neetu Singh': 25000,
    'Saurabh Singh': 25000,
    'Neelam Singh': 10000,
    'Tarang Gupta': 10000,
    'Vaibhav': 9000,
    'Ishan Tiwari': 25000,
    'Ratnam Yadav': 25000,
    'Deepak Rathore': 10000,
    'Rashi Bhatia': 65000,
    'Vipul Bhatia': 65000,
    'Prince': 0,
    'Vipul Vikram Singh': 5000,
  };

  const newEnrollments = [];

  for (const enr of enrollments) {
    const client = clients.find(c => c.full_name === enr.client);
    if (!client) continue;
    const { data: enrollment, error: eErr } = await supabase.from('enrollments').insert({
      client_id: client.id,
      trainer_id: enr.trainer.id,
      plan_id: enr.plan.id,
      total_charged: enr.total,
      start_date: enr.start,
      end_date: enr.end,
      status: enr.status,
    }).select().single();

    if (eErr) { console.error(`Enrollment error for ${enr.client}:`, eErr); continue; }

    newEnrollments.push({ enrollment, trainer: enr.trainer, clientName: enr.client });

    // Insert payment records matching v4 paid amounts
    const paidAmount = paymentMap[enr.client] || 0;
    if (paidAmount > 0) {
      // Split into 1-2 payments for realism
      const pay1 = Math.floor(paidAmount * 0.6);
      const pay2 = paidAmount - pay1;
      const start = new Date(enr.start);
      const pay1Date = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
      const pay2Date = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

      const payments = [
        { enrollment_id: enrollment.id, amount: pay1, paid_at: pay1Date.toISOString().split('T')[0], method: 'cash' },
      ];
      if (pay2 > 0) {
        payments.push({ enrollment_id: enrollment.id, amount: pay2, paid_at: pay2Date.toISOString().split('T')[0], method: 'cash' });
      }
      const { error: pErr } = await supabase.from('payments').insert(payments);
      if (pErr) console.error(`Payment error for ${enr.client}:`, pErr);
    }
  }

  console.log(`✅ ${enrollments.length} enrollments inserted`);

  // Insert revenue goals
  await supabase.from('revenue_goals').insert(seedData.revenueGoals);
  console.log(`✅ ${seedData.revenueGoals.length} revenue goals inserted`);

  // Insert activities
  const activities = [
    { actor_type: 'client', actor_id: null, action: 'enrolled', description: 'Renuka started a new 1-Month package with Abhishek', icon: '🏋️', color: 'var(--green-muted)' },
    { actor_type: 'client', actor_id: null, action: 'enrolled', description: 'Tarang Gupta enrolled in 3-Month package with Riya', icon: '🏋️', color: 'var(--green-muted)' },
    { actor_type: 'system', actor_id: null, action: 'expiring', description: 'Jay Singh subscription expiring in 7 days', icon: '⏰', color: 'var(--orange-muted)' },
    { actor_type: 'system', actor_id: null, action: 'payment', description: 'Vaibhav has pending balance of ₹20,000', icon: '💸', color: 'var(--red-muted)' },
    { actor_type: 'trainer', actor_id: null, action: 'achievement', description: 'Abhishek won Silver at UP State Powerlifting Championship', icon: '🥈', color: 'var(--blue-muted)' },
  ];
  await supabase.from('activities').insert(activities);
  console.log(`✅ ${activities.length} activities inserted`);

  // ── Historical payments for revenue chart (May 2025 – Apr 2026) ──
  // These use a dummy enrollment tied to the first trainer (Abhishek) plus
  // additional payments on real enrollments to fill the revenueMonths curve.

  // Historical months from v4 HTML (total: ~1,950,000 across 15 months)
  const historicalMonths = [
    { m: '2025-05-01', rev: 7000, trainer: abh },
    { m: '2025-06-01', rev: 77333, trainer: abh },
    { m: '2025-07-01', rev: 78667, trainer: abh },
    { m: '2025-08-01', rev: 79667, trainer: abh },
    { m: '2025-09-01', rev: 152000, trainer: abh },
    { m: '2025-10-01', rev: 176667, trainer: abh },
    { m: '2025-11-01', rev: 204333, trainer: abh },
    { m: '2025-12-01', rev: 201333, trainer: abh },
    { m: '2026-01-01', rev: 202500, trainer: abh },
    { m: '2026-02-01', rev: 209167, trainer: abh },
    { m: '2026-03-01', rev: 210500, trainer: abh },
    { m: '2026-04-01', rev: 176167, trainer: abh },
    { m: '2026-05-01', rev: 100500, trainer: abh },
    { m: '2026-06-01', rev: 53833, trainer: abh },
    { m: '2026-07-01', rev: 10833, trainer: abh },
  ];

  // Don't duplicate months that already have payments from current clients
  // Current client payments cover roughly Apr-Jun 2026
  const currentClientMonths = new Set(['2026-04-01', '2026-05-01', '2026-06-01', '2026-07-01']);

  for (const hm of historicalMonths) {
    if (currentClientMonths.has(hm.m)) continue;

    const trainerEnrollments = newEnrollments.filter(e => e.trainer.id === hm.trainer.id);
    if (trainerEnrollments.length === 0) continue;

    const targets = trainerEnrollments.slice(0, Math.min(3, trainerEnrollments.length));
    const perEnrollment = Math.floor(hm.rev / targets.length);

    for (const te of targets) {
      await supabase.from('payments').insert({
        enrollment_id: te.enrollment.id,
        amount: perEnrollment,
        paid_at: hm.m,
        method: 'cash',
      });
    }
  }

  console.log(`✅ Historical payments inserted`);

  // ── Sessions data ──
  const today = new Date();

  const scheduleSlots = {
    ABHISHEK: [
      ['Ajeet Yadav', 0, 7], ['Ankush Thakur', 0, 8], ['Rahul Rathore', 0, 9], ['Shivang Swarnkar', 0, 10],
      ['Ajeet Yadav', 2, 7], ['Ankush Thakur', 2, 8], ['Rahul Rathore', 2, 9], ['Shivang Swarnkar', 2, 10],
      ['Ajeet Yadav', 4, 7], ['Ankush Thakur', 4, 8], ['Rahul Rathore', 4, 9], ['Shivang Swarnkar', 4, 10],
    ],
    RIYA: [
      ['Neetu Singh', 1, 7], ['Saurabh Singh', 1, 8], ['Aman Verma', 1, 9], ['Tarang Gupta', 1, 10],
      ['Neetu Singh', 3, 7], ['Saurabh Singh', 3, 8], ['Aman Verma', 3, 9], ['Tarang Gupta', 3, 10],
      ['Neetu Singh', 5, 7], ['Saurabh Singh', 5, 8], ['Aman Verma', 5, 9], ['Tarang Gupta', 5, 10],
    ],
    RAJAT: [
      ['Anjali Srivastava', 1, 7], ['Deepak Rathore', 1, 8], ['Stuti Yadav', 1, 9], ['Ratnam Yadav', 1, 10],
      ['Anjali Srivastava', 3, 7], ['Deepak Rathore', 3, 8], ['Stuti Yadav', 3, 9], ['Ratnam Yadav', 3, 10],
    ],
  };

  for (const [trainerCode, slots] of Object.entries(scheduleSlots)) {
    const tid = trainers.find(t => t.short_code === trainerCode)?.id;
    if (!tid) continue;
    for (const [clientName, day, hour] of slots) {
      const client = clients.find(c => c.full_name === clientName);
      if (!client) continue;
      const enr = newEnrollments.find(e => e.clientName === clientName);
      if (!enr) continue;

      const sessionDate = new Date(today);
      sessionDate.setDate(today.getDate() + ((day + 7 - today.getDay()) % 7));
      sessionDate.setHours(hour, 0, 0, 0);

      await supabase.from('sessions').insert({
        client_id: client.id,
        trainer_id: tid,
        enrollment_id: enr.enrollment.id,
        scheduled_at: sessionDate.toISOString(),
        status: 'scheduled',
      }).catch(() => {});
    }
  }

  console.log(`✅ Sessions inserted`);

  // ── Notifications ──
  const notifications = [
    { title: 'Payment Due', body: 'Vaibhav has a pending balance of ₹20,000', icon: '💸', color: 'var(--red-muted)', is_read: false },
    { title: 'Subscription Expiring', body: 'Renuka\'s 1-Month plan ends in 7 days', icon: '⏰', color: 'var(--orange-muted)', is_read: false },
    { title: 'New Enrollment', body: 'Tarang Gupta joined 3-Month plan with Riya', icon: '🏋️', color: 'var(--green-muted)', is_read: false },
    { title: 'Achievement Unlocked', body: 'Abhishek won Silver at UP State Powerlifting Championship', icon: '🥈', color: 'var(--blue-muted)', is_read: false },
  ];

  await supabase.from('notifications').insert(notifications);
  console.log(`✅ ${notifications.length} notifications inserted`);

  console.log('\n🎉 Seed complete!');
}

seed().catch(console.error);

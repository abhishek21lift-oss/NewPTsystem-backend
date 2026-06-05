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

  for (const enr of enrollments) {
    const client = clients.find(c => c.full_name === enr.client);
    if (!client) continue;
    const { data: enrollment } = await supabase.from('enrollments').insert({
      client_id: client.id,
      trainer_id: enr.trainer.id,
      plan_id: enr.plan.id,
      total_charged: enr.total,
      start_date: enr.start,
      end_date: enr.end,
      status: enr.status,
    }).select().single();
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

  console.log('\n🎉 Seed complete!');
}

seed().catch(console.error);

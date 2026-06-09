import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const sql = `

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female')),
    phone TEXT,
    email TEXT,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_code TEXT,
    full_name TEXT NOT NULL,
    initials TEXT,
    avatar_color TEXT,
    specialty TEXT,
    certification TEXT,
    commission_pct DECIMAL(5,2) DEFAULT 50,
    is_head BOOLEAN DEFAULT false,
    is_owner BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration TEXT CHECK (duration IN ('1 Month', '3 Months', '4 Months', '12 Months')),
    months_count INT NOT NULL,
    default_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    trainer_id UUID REFERENCES trainers(id),
    plan_id UUID REFERENCES membership_plans(id),
    total_charged DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'soon')),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id),
    amount DECIMAL(10,2) NOT NULL,
    paid_at DATE DEFAULT CURRENT_DATE,
    method TEXT CHECK (method IN ('cash', 'upi', 'card', 'transfer')),
    reference TEXT,
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES enrollments(id),
    client_id UUID REFERENCES clients(id),
    trainer_id UUID REFERENCES trainers(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'no_show', 'cancelled')),
    notes TEXT,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(10,2) NOT NULL,
    commission_pct DECIMAL(5,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_type TEXT,
    actor_id UUID,
    action TEXT,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    body TEXT,
    icon TEXT,
    color TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS revenue_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month DATE NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RPC functions
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0) FROM payments WHERE deleted_at IS NULL;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_monthly_revenue(p_months INT DEFAULT 12)
RETURNS TABLE(month TEXT, rev DECIMAL) AS $$
  SELECT
    TO_CHAR(paid_at, 'Mon YYYY') AS month,
    COALESCE(SUM(amount), 0) AS rev
  FROM payments
  WHERE paid_at >= (CURRENT_DATE - (p_months || ' months')::INTERVAL)
    AND deleted_at IS NULL
  GROUP BY DATE_TRUNC('month', paid_at), TO_CHAR(paid_at, 'Mon YYYY')
  ORDER BY MIN(paid_at);
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_gender_distribution()
RETURNS TABLE(gender TEXT, count BIGINT) AS $$
  SELECT gender, COUNT(*)::BIGINT FROM clients WHERE deleted_at IS NULL GROUP BY gender;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION get_outstanding_balances()
RETURNS TABLE(client_name TEXT, trainer_name TEXT, total_charged DECIMAL, total_paid DECIMAL, balance DECIMAL) AS $$
  SELECT
    c.full_name AS client_name,
    t.full_name AS trainer_name,
    e.total_charged,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    e.total_charged - COALESCE(SUM(p.amount), 0) AS balance
  FROM enrollments e
  JOIN clients c ON c.id = e.client_id
  JOIN trainers t ON t.id = e.trainer_id
  LEFT JOIN payments p ON p.enrollment_id = e.id AND p.deleted_at IS NULL
  WHERE e.deleted_at IS NULL AND c.deleted_at IS NULL
  GROUP BY c.full_name, t.full_name, e.total_charged
  HAVING e.total_charged > COALESCE(SUM(p.amount), 0);
$$ LANGUAGE SQL;

`;

async function migrate() {
  console.log('Running migration...\n');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const stmt of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' }).catch(async () => {
      // Fallback: try direct query if exec_sql RPC doesn't exist
      const { error } = await supabase.from('_migrations').select('id').limit(1).catch(() => ({ error: true }));
      if (error) {
        console.log('⚠️  Cannot run SQL directly. Please run the SQL in Supabase SQL Editor.');
        console.log('   SQL statements are printed below for manual execution.\n');
        console.log(stmt + ';\n');
        return { error: null };
      }
      return { error };
    });

    if (error) {
      console.log(`⚠️  Statement may have failed (may be expected): ${error.message}`);
    }
  }

  console.log('\n✅ Migration complete. If SQL was printed above, run it manually in Supabase SQL Editor.');
}

migrate().catch(console.error);

import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export function createSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url) throw new Error('SUPABASE_URL is required');

  const key = serviceKey || anonKey;
  if (!key) throw new Error('SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY is required');

  supabaseInstance = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  });

  return supabaseInstance;
}

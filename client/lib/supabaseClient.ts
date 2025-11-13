import { createClient } from '@supabase/supabase-js';

// Prefer Vite-prefixed env vars for client exposure. Fall back to any
// non-prefixed vars if present (useful for some dev setups). In production
// ensure you expose only safe anon key to the frontend.
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? (import.meta.env as any).SUPABASE_URL) as string;
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? (import.meta.env as any).SUPABASE_ANON_KEY) as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Keep a console warning so devs know to add env vars correctly.
  // This file runs in the browser build, so don't throw here.
  // eslint-disable-next-line no-console
  console.warn('Supabase: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Social login may fail.');
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '');

export default supabase;

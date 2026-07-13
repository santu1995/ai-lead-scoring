import { createClient } from "@supabase/supabase-js";

// These are public keys — safe to expose in the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// TypeScript type matching our leads table
export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  budget: string;
  timeline: string;
  message: string;
  score: number;
  reason: string;
  action: string;
  source: string;
  hunter_company: string | null;
  hunter_industry: string | null;
  hunter_employee_count: string | null;
  hunter_location: string | null;
  enriched: boolean;
  created_at: string;
  notified_at: string | null;
};

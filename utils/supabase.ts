// utils/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

let client: SupabaseClient<Database> | null = null;
let didLogEnv = false;

export function getSupabase(): SupabaseClient<Database> | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  // One-time, dev-only sanity log so you can verify envs are loaded
  if (__DEV__ && !didLogEnv) {
    didLogEnv = true;
    // If this prints '(undefined)', your .env didn't load into the Expo web dev server.
    console.log('SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '(present)' : '(undefined)');
  }

  // In dev/web, these can be undefined until .env is loaded.
  if (!url || !key) {
    if (__DEV__) {
      console.warn('Supabase env vars missing: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
    }
    return null;
  }

  if (!client) {
    client = createClient<Database>(url, key, {
      auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

// Convenience export (will be null if env vars are missing)
export const supabase = getSupabase();

/** Database types (align with your SQL schema) */
export type Database = {
  public: {
    Tables: {
      day_entries: {
        Row: {
          id: number;                // bigint identity
          user_id: string;           // uuid
          date_utc: string;          // 'YYYY-MM-DD'
          start_ts: string | null;   // timestamptz ISO
          end_ts: string | null;     // timestamptz ISO
          total_hhmm: string | null; // 'HH:MM'
          inserted_at: string;       // timestamptz
          updated_at: string;        // timestamptz
        };
        Insert: {
          user_id: string;
          date_utc: string;
          start_ts?: string | null;
          end_ts?: string | null;
          total_hhmm?: string | null;
        };
        Update: {
          user_id?: string;
          date_utc?: string;
          start_ts?: string | null;
          end_ts?: string | null;
          total_hhmm?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
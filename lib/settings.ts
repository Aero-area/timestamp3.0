// lib/settings.ts
import { getSupabase } from '@/utils/supabase';

export type SettingsRow = {
  user_id: string;
  rollover_day: number;   // 1..28
  rollover_hour: number;  // 0..23
  rounding_rule: string;  // 'none' | '5' | '10' | '15'
  updated_at: string;
};

export async function fetchSettings(userId: string) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not ready');

  const { data, error } = await sb
    .from('app_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<SettingsRow>();

  if (error) throw error;
  return data ?? null;
}

export async function upsertSettings(
  userId: string,
  patch: Partial<Pick<SettingsRow, 'rollover_day' | 'rollover_hour' | 'rounding_rule'>>
) {
  const sb = getSupabase();
  if (!sb) throw new Error('Supabase client not ready');

  const payload = { user_id: userId, ...patch };

  const { data, error } = await sb
    .from('app_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single<SettingsRow>();

  if (error) throw error;
  return data;
}
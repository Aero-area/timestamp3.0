import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getSupabase } from "@/utils/supabase";
import { useAuth } from "./AuthProvider";
import { useSettings } from "./SettingsProvider";
import { useToast } from "./ToastProvider";
import { useOfflineQueue } from "./OfflineQueueProvider";
import type { DayEntry } from "@/types";
import { durationHHMM, logicalDateCph } from "@/lib/time";

export const [DayEntriesProvider, useDayEntries] = createContextHook(() => {
  const { user } = useAuth();
  const { currentPeriod, settings } = useSettings();
  const { showToast } = useToast();
  const { queueStamp, processQueue, setOffline, setOnline, hasQueuedItems } = useOfflineQueue();
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load entries from Supabase
  const loadEntries = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !user || !currentPeriod?.start || !currentPeriod?.end) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('day_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date_utc', currentPeriod.start)
        .lt('date_utc', currentPeriod.end)
        .order('date_utc', { ascending: false });

      if (error) {
        throw error;
      }

      setDayEntries(data || []);
      setOnline();
    } catch (error) {
      console.error('Failed to load day entries:', error);
      setOffline();
      showToast('Failed to load entries', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPeriod, setOnline, setOffline, showToast]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Perform stamp operation with Supabase using logical date
  const performStamp = useCallback(async (nowUtc: Date) => {
    const supabase = getSupabase();
    if (!supabase || !user) {
      throw new Error('Supabase not initialized or user not authenticated');
    }

    const timestamp = nowUtc.toISOString();
    // Use logical date based on rollover hour
    const logicalDate = logicalDateCph(nowUtc, settings.rollover_hour);

    try {
      // Get existing entry for the logical date
      const { data: existingEntries, error: fetchError } = await supabase
        .from('day_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date_utc', logicalDate)
        .limit(1);

      if (fetchError) {
        throw fetchError;
      }

      const existingEntry = existingEntries?.[0];
      let updatedEntry: Partial<DayEntry>;
      let message: string;

      if (!existingEntry) {
        // No row exists - create with start_ts
        updatedEntry = {
          user_id: user.id,
          date_utc: logicalDate,
          start_ts: timestamp,
          end_ts: null,
          total_hhmm: null,
        };
        message = 'Started tracking time';
      } else if (existingEntry.start_ts === null) {
        // start_ts is null - set it
        updatedEntry = {
          start_ts: timestamp,
        };
        message = 'Started tracking time';
      } else if (existingEntry.end_ts === null) {
        // start_ts exists but end_ts is null - set end_ts and calculate total
        let startTs = existingEntry.start_ts;
        let endTs = timestamp;

        // Ensure start_ts <= end_ts (swap if needed)
        if (new Date(endTs) < new Date(startTs)) {
          [startTs, endTs] = [endTs, startTs];
        }

        updatedEntry = {
          start_ts: startTs,
          end_ts: endTs,
          total_hhmm: durationHHMM(startTs, endTs),
        };
        message = 'Stopped tracking time';
      } else {
        // Both start and end already set - interpret as new end time
        let startTs = existingEntry.start_ts;
        let endTs = timestamp;

        // Ensure start_ts <= end_ts (swap if needed)
        if (new Date(endTs) < new Date(startTs)) {
          [startTs, endTs] = [endTs, startTs];
        }

        updatedEntry = {
          start_ts: startTs,
          end_ts: endTs,
          total_hhmm: durationHHMM(startTs, endTs),
        };
        message = 'Updated end time';
      }

      // Upsert the entry
      const { error: upsertError } = await supabase
        .from('day_entries')
        .upsert({
          user_id: user.id,
          date_utc: logicalDate,
          ...updatedEntry,
        }, {
          onConflict: 'user_id,date_utc',
        });

      if (upsertError) {
        throw upsertError;
      }

      // Refresh entries
      await loadEntries();
      showToast(message, 'success');
      setOnline();
    } catch (error) {
      console.error('Failed to perform stamp:', error);
      setOffline();
      throw error;
    }
  }, [user, loadEntries, showToast, setOnline, setOffline, settings.rollover_hour]);

  // Process offline queue when back online
  useEffect(() => {
    if (user && hasQueuedItems) {
      processQueue(async (timestamp: string) => {
        try {
          await performStamp(new Date(timestamp));
          return true;
        } catch {
          console.error('Failed to process queued stamp');
          return false;
        }
      });
    }
  }, [user, hasQueuedItems, processQueue, performStamp]);

  // One-button stamping logic
  const onStamp = useCallback(async (nowUtc?: Date) => {
    const timestamp = nowUtc || new Date();
    
    try {
      await performStamp(timestamp);
    } catch {
      // If online operation fails, queue for offline processing
      await queueStamp(timestamp.toISOString());
    }
  }, [performStamp, queueStamp]);

  return useMemo(() => ({
    dayEntries,
    onStamp,
    isLoading,
    refreshEntries: loadEntries,
  }), [dayEntries, onStamp, isLoading, loadEntries]);
});
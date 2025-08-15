import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { getSupabase } from '@/utils/supabase';
import { useAuth } from './AuthProvider';
import { useToast } from './ToastProvider';

const LAST_BACKUP_KEY = 'last_backup_date';
const BACKUP_BUCKET = process.env.EXPO_PUBLIC_BACKUP_BUCKET || 'backups';
const BACKUP_ENABLED = process.env.EXPO_PUBLIC_BACKUP_ENABLED === 'true';

export const [BackupProvider, useBackup] = createContextHook(() => {
  const { session, isInitialized } = useAuth();
  const { showToast } = useToast();
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Load last backup date on init
  useEffect(() => {
    const loadLastBackup = async () => {
      try {
        const stored = await AsyncStorage.getItem(LAST_BACKUP_KEY);
        setLastBackupAt(stored);
      } catch (error) {
        console.error('Failed to load last backup date:', error);
      }
    };
    loadLastBackup();
  }, []);

  // Check if backup is needed (once per day)
  const isBackupNeeded = useCallback(() => {
    if (!BACKUP_ENABLED || !session?.user?.id || !lastBackupAt) return BACKUP_ENABLED && !!session?.user?.id;
    
    const lastBackup = new Date(lastBackupAt);
    const now = new Date();
    const diffHours = (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60);
    
    return diffHours >= 24;
  }, [lastBackupAt, session?.user?.id]);

  // Perform backup
  const performBackup = useCallback(async (isManual = false) => {
    const supabase = getSupabase();
    if (!BACKUP_ENABLED || !supabase || !session?.user?.id || isBackingUp) {
      if (isManual && !BACKUP_ENABLED) {
        showToast('Backups are disabled', 'error');
      }
      return false;
    }
    
    setIsBackingUp(true);
    
    try {
      // Get last 90 days of entries
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const { data: entries, error } = await supabase
        .from('day_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date_utc', ninetyDaysAgo.toISOString().split('T')[0])
        .order('date_utc', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Create backup data
      const backupData = {
        version: 1,
        generatedAtUtc: new Date().toISOString(),
        userId: session.user.id,
        items: entries || [],
      };
      
      // Generate file path: uid/YYYY/MM/DD/entries-YYYY-MM-DD.json
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const filePath = `${session.user.id}/${year}/${month}/${day}/entries-${year}-${month}-${day}.json`;
      
      // Create blob with proper content type
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BACKUP_BUCKET)
        .upload(filePath, blob, {
          contentType: 'application/json',
          upsert: true,
        });
      
      if (uploadError) {
        // Handle specific error cases without crashing
        if (uploadError.message.includes('Bucket not found')) {
          showToast(`Create private bucket named '${BACKUP_BUCKET}' in Supabase Storage`, 'error');
          return false;
        }
        if (uploadError.message.includes('row-level security') || uploadError.message.includes('401') || uploadError.message.includes('403')) {
          showToast('Backup skipped; will retry later', 'error');
          return false;
        }
        throw uploadError;
      }
      
      // Update last backup date
      const nowISO = now.toISOString();
      await AsyncStorage.setItem(LAST_BACKUP_KEY, nowISO);
      setLastBackupAt(nowISO);
      
      console.log('Backup completed successfully:', filePath);
      if (isManual) {
        showToast(`Backup saved: ${filePath}`, 'success');
      }
      return true;
    } catch (error: any) {
      console.error('Backup failed:', error);
      if (error?.status === 401 || error?.status === 403 || error?.message?.includes('row-level security')) {
        showToast('Backup skipped; will retry later', 'error');
      } else {
        showToast('Backup skipped; will retry later', 'error');
      }
      return false;
    } finally {
      setIsBackingUp(false);
    }
  }, [session?.user?.id, isBackingUp, showToast]);

  // Auto-backup on app focus if needed
  useEffect(() => {
    if (!isInitialized || !BACKUP_ENABLED) return;
    
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active' && session?.user?.id && isBackupNeeded()) {
        await performBackup();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [session?.user?.id, isInitialized, isBackupNeeded, performBackup]);

  // Initial backup check when user logs in
  useEffect(() => {
    if (!isInitialized || !BACKUP_ENABLED) return;
    
    if (session?.user?.id && isBackupNeeded()) {
      performBackup();
    }
  }, [session?.user?.id, isInitialized, isBackupNeeded, performBackup]);

  return useMemo(() => ({
    lastBackupAt,
    isBackingUp,
    isBackupNeeded: isBackupNeeded(),
    performBackup,
    backupEnabled: BACKUP_ENABLED,
  }), [lastBackupAt, isBackingUp, isBackupNeeded, performBackup]);
});
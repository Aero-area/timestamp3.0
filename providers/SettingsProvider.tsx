import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabase } from "@/utils/supabase";
import { currentPeriodCph, nowCph } from "@/lib/time";
import type { Settings } from "@/types";
import { useAuth } from "./AuthProvider";

const DEFAULT_SETTINGS: Settings = {
  rollover_day_utc: 1,
  rollover_hour: 0,
  rounding_rule: "none",
  language: 'da',
  themePrimary: '#008d36',
};

const SETTINGS_STORAGE_KEY = 'settings.v1';

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  
  // State for controlled components
  const [rolloverDay, setRolloverDay] = useState(DEFAULT_SETTINGS.rollover_day_utc);
  const [rolloverHour, setRolloverHour] = useState(DEFAULT_SETTINGS.rollover_hour);
  const [roundingRule, setRoundingRule] = useState(DEFAULT_SETTINGS.rounding_rule);
  const [language, setLanguage] = useState(DEFAULT_SETTINGS.language);
  const [themePrimary, setThemePrimary] = useState(DEFAULT_SETTINGS.themePrimary);
  
  // Loading and sync state
  const [loaded, setLoaded] = useState(false);
  const [lastSavedSettings, setLastSavedSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Load settings from AsyncStorage as fallback
  const loadFromStorage = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        const mergedSettings = { ...DEFAULT_SETTINGS, ...parsedSettings };
        
        // Update local state
        setRolloverDay(mergedSettings.rollover_day_utc);
        setRolloverHour(mergedSettings.rollover_hour);
        setRoundingRule(mergedSettings.rounding_rule);
        setLanguage(mergedSettings.language);
        setThemePrimary(mergedSettings.themePrimary);
        setLastSavedSettings(mergedSettings);
        
        return mergedSettings;
      }
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
    }
    return DEFAULT_SETTINGS;
  }, []);

  // Load settings from Supabase for a specific user
  const loadFromSupabase = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsOnline(false);
      return await loadFromStorage(); // Fallback to storage
    }

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Failed to load settings from Supabase:', error);
        setIsOnline(false);
        return await loadFromStorage(); // Fallback to storage
      }

      if (data) {
        // Settings found in Supabase
        const mergedSettings = { ...DEFAULT_SETTINGS, ...data };
        
        // Update local state
        setRolloverDay(mergedSettings.rollover_day_utc);
        setRolloverHour(mergedSettings.rollover_hour);
        setRoundingRule(mergedSettings.rounding_rule);
        setLanguage(mergedSettings.language);
        setThemePrimary(mergedSettings.themePrimary);
        setLastSavedSettings(mergedSettings);
        
        // Always mirror to AsyncStorage for offline resilience
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(mergedSettings));
        setIsOnline(true);
        
        return mergedSettings;
      } else {
        // No settings found, create defaults
        const defaultUserSettings = {
          user_id: userId,
          ...DEFAULT_SETTINGS,
        };

        const { error: upsertError } = await supabase
          .from('app_settings')
          .upsert(defaultUserSettings, {
            onConflict: 'user_id',
          });

        if (upsertError) {
          console.error('Failed to create default settings:', upsertError);
          setIsOnline(false);
          return await loadFromStorage(); // Fallback to storage
        }

        // Update local state with defaults
        setRolloverDay(DEFAULT_SETTINGS.rollover_day_utc);
        setRolloverHour(DEFAULT_SETTINGS.rollover_hour);
        setRoundingRule(DEFAULT_SETTINGS.rounding_rule);
        setLanguage(DEFAULT_SETTINGS.language);
        setThemePrimary(DEFAULT_SETTINGS.themePrimary);
        setLastSavedSettings(DEFAULT_SETTINGS);
        
        // Always mirror to AsyncStorage for offline resilience
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        setIsOnline(true);
        
        return DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Failed to load from Supabase:', error);
      setIsOnline(false);
      return await loadFromStorage(); // Fallback to storage
    }
  }, [loadFromStorage]);

  // Save settings to both Supabase and AsyncStorage
  const saveSettings = useCallback(async () => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const currentSettings: Settings = {
      rollover_day_utc: rolloverDay,
      rollover_hour: rolloverHour,
      rounding_rule: roundingRule,
      language,
      themePrimary,
    };

    try {
      // ALWAYS save to AsyncStorage first for offline resilience
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
      
      // Try to save to Supabase if online
      if (isOnline) {
        const supabase = getSupabase();
        if (supabase) {
          const { error } = await supabase
            .from('app_settings')
            .upsert({
              user_id: user.id,
              ...currentSettings,
            }, {
              onConflict: 'user_id',
            });

          if (error) {
            console.error('Failed to save to Supabase:', error);
            setIsOnline(false);
            // Settings are still saved to AsyncStorage, so we're good
          } else {
            setIsOnline(true);
          }
        }
      }

      // Update last saved state
      setLastSavedSettings(currentSettings);
      setHasUnsavedChanges(false);
      
      return currentSettings;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  }, [rolloverDay, rolloverHour, roundingRule, language, themePrimary, user?.id, isOnline]);

  // Update specific settings
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    if (updates.rollover_day_utc !== undefined) {
      setRolloverDay(updates.rollover_day_utc);
    }
    if (updates.rollover_hour !== undefined) {
      setRolloverHour(updates.rollover_hour);
    }
    if (updates.rounding_rule !== undefined) {
      setRoundingRule(updates.rounding_rule);
    }
    if (updates.language !== undefined) {
      setLanguage(updates.language);
    }
    if (updates.themePrimary !== undefined) {
      setThemePrimary(updates.themePrimary);
    }
    
    setHasUnsavedChanges(true);
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      rolloverDay !== lastSavedSettings.rollover_day_utc ||
      rolloverHour !== lastSavedSettings.rollover_hour ||
      roundingRule !== lastSavedSettings.rounding_rule ||
      language !== lastSavedSettings.language ||
      themePrimary !== lastSavedSettings.themePrimary;
    
    setHasUnsavedChanges(hasChanges);
  }, [rolloverDay, rolloverHour, roundingRule, language, themePrimary, lastSavedSettings]);

  // Initialize settings from storage on mount
  useEffect(() => {
    const initializeSettings = async () => {
      await loadFromStorage();
      setLoaded(true);
    };
    
    initializeSettings();
  }, [loadFromStorage]);

  // Load settings from Supabase when user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.id && loaded) {
      loadFromSupabase(user.id);
    }
  }, [isAuthenticated, user?.id, loaded, loadFromSupabase]);

  // Calculate current period based on rollover day and hour (Copenhagen timezone)
  const currentPeriod = useMemo(() => {
    const { startDateKey, endDateKey } = currentPeriodCph(rolloverDay, rolloverHour);
    return {
      start: startDateKey,
      end: endDateKey,
    };
  }, [rolloverDay, rolloverHour]);

  // Check if today is rollover day (Copenhagen timezone)
  const isRolloverDay = useMemo(() => {
    const today = nowCph();
    return today.date() === rolloverDay;
  }, [rolloverDay]);

  // Current settings object for components
  const settings = useMemo(() => ({
    rollover_day_utc: rolloverDay,
    rollover_hour: rolloverHour,
    rounding_rule: roundingRule,
    language,
    themePrimary,
  }), [rolloverDay, rolloverHour, roundingRule, language, themePrimary]);

  return useMemo(() => ({
    // State
    settings,
    rolloverDay,
    rolloverHour,
    roundingRule,
    language,
    themePrimary,
    loaded,
    hasUnsavedChanges,
    isOnline,
    
    // Setters for controlled components
    setRolloverDay,
    setRolloverHour,
    setRoundingRule,
    setLanguage,
    setThemePrimary,
    
    // Actions
    updateSettings,
    saveSettings,
    loadFromSupabase,
    
    // Computed values
    currentPeriod,
    isRolloverDay,
    
    // Legacy compatibility
    isUpdating: false,
  }), [
    settings,
    rolloverDay,
    rolloverHour,
    roundingRule,
    language,
    themePrimary,
    loaded,
    hasUnsavedChanges,
    isOnline,
    updateSettings,
    saveSettings,
    loadFromSupabase,
    currentPeriod,
    isRolloverDay,
  ]);
});
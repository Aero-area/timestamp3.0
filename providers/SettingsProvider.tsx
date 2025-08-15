import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/utils/api";
import { currentPeriodCph, nowCph } from "@/lib/time";
import type { Settings } from "@/types";

const DEFAULT_SETTINGS: Settings = {
  rollover_day_utc: 1,
  rollover_hour: 0, // New: hour of day for rollover (0-23)
  rounding_rule: "none",
  language: 'da', // Danish
  themePrimary: '#008d36', // New brand color
};

const SETTINGS_STORAGE_KEY = 'settings.v1';

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  // Load settings from AsyncStorage on init
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          // Merge with defaults to handle new fields
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        }
        setIsReady(true);
      } catch (error) {
        console.error('Failed to load settings from storage:', error);
        setIsReady(true);
      }
    };
    loadSettings();
  }, []);

  // Load settings from API
  const { data: apiSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.getSettings,
  });

  // Sync with API settings
  useEffect(() => {
    if (apiSettings && isReady) {
      const mergedSettings = { ...settings, ...apiSettings };
      setSettings(mergedSettings);
      saveToStorage(mergedSettings);
    }
  }, [apiSettings, isReady]);

  // Save settings to AsyncStorage
  const saveToStorage = useCallback(async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings to storage:', error);
    }
  }, []);

  // Update settings locally and persist
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveToStorage(newSettings);
    
    // Also update via API if available
    if (api.updateSettings) {
      try {
        await api.updateSettings(newSettings);
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      } catch (error) {
        console.error('Failed to update settings via API:', error);
      }
    }
    
    return newSettings;
  }, [settings, saveToStorage, queryClient]);

  // Specific setters for individual settings
  const setRolloverHour = useCallback(async (hour: number) => {
    if (hour < 0 || hour > 23) {
      throw new Error('Rollover hour must be between 0 and 23');
    }
    await updateSettings({ rollover_hour: hour });
  }, [updateSettings]);

  const setThemePrimary = useCallback(async (hex: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      throw new Error('Invalid hex color format');
    }
    await updateSettings({ themePrimary: hex });
  }, [updateSettings]);

  // Save all current settings
  const save = useCallback(async () => {
    await saveToStorage(settings);
    if (api.updateSettings) {
      try {
        await api.updateSettings(settings);
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      } catch (error) {
        console.error('Failed to save settings via API:', error);
      }
    }
  }, [settings, saveToStorage, queryClient]);

  // Reload settings from storage
  const reload = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to reload settings:', error);
    }
  }, []);

  // Calculate current period based on rollover day and hour (Copenhagen timezone)
  const currentPeriod = useMemo(() => {
    const { startDateKey, endDateKey } = currentPeriodCph(settings.rollover_day_utc, settings.rollover_hour);
    return {
      start: startDateKey,
      end: endDateKey,
    };
  }, [settings.rollover_day_utc, settings.rollover_hour]);

  // Check if today is rollover day (Copenhagen timezone)
  const isRolloverDay = useMemo(() => {
    const today = nowCph();
    return today.date() === settings.rollover_day_utc;
  }, [settings.rollover_day_utc]);

  return useMemo(() => ({
    settings,
    updateSettings,
    setRolloverHour,
    setThemePrimary,
    save,
    reload,
    ready: isReady,
    isUpdating: false, // Simplified for now
    currentPeriod,
    isRolloverDay,
  }), [settings, updateSettings, setRolloverHour, setThemePrimary, save, reload, isReady, currentPeriod, isRolloverDay]);
});
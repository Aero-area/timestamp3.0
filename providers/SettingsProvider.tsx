import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/utils/api";
import { currentPeriodCph, nowCph } from "@/lib/time";
import type { Settings } from "@/types";

const DEFAULT_SETTINGS: Settings = {
  rollover_day_utc: 1,
  rounding_rule: "none",
};

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from API
  const { data: apiSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.getSettings,
  });

  // Load cached settings from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("settings").then((stored) => {
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    });
  }, []);

  // Sync with API settings
  useEffect(() => {
    if (apiSettings) {
      setSettings(apiSettings);
      AsyncStorage.setItem("settings", JSON.stringify(apiSettings));
    }
  }, [apiSettings]);

  const updateMutation = useMutation({
    mutationFn: api.updateSettings,
    onSuccess: (data) => {
      setSettings(data);
      AsyncStorage.setItem("settings", JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  // Calculate current period based on rollover day (Copenhagen timezone)
  const currentPeriod = useMemo(() => {
    const { startDateKey, endDateKey } = currentPeriodCph(settings.rollover_day_utc);
    return {
      start: startDateKey,
      end: endDateKey,
    };
  }, [settings.rollover_day_utc]);

  // Check if today is rollover day (Copenhagen timezone)
  const isRolloverDay = useMemo(() => {
    const today = nowCph();
    return today.date() === settings.rollover_day_utc;
  }, [settings.rollover_day_utc]);

  return useMemo(() => ({
    settings,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    currentPeriod,
    isRolloverDay,
  }), [settings, updateMutation.mutateAsync, updateMutation.isPending, currentPeriod, isRolloverDay]);
});
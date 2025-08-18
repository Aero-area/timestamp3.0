import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ToastProvider } from "@/providers/ToastProvider";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { TimeTrackingProvider } from "@/providers/TimeTrackingProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { DayEntriesProvider } from "@/providers/DayEntriesProvider";
import { OfflineQueueProvider } from "@/providers/OfflineQueueProvider";
import { BackupProvider } from "@/providers/BackupProvider";

import SetupScreen from "@/components/SetupScreen";
import LoginScreen from "@/components/LoginScreen";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5000 },
  },
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) return null;
  if (!isAuthenticated) return <LoginScreen />;

  // 👉 Important: this renders the nested routes like (tabs)
  return <Slot />;
}

function AppContent() {
  const { isInitialized } = useAuth();
  if (!isInitialized) return null;

  return (
    <ToastProvider>
      <OfflineQueueProvider>
        {/* SettingsProvider lives here (only once) */}
        <SettingsProvider>
          <DayEntriesProvider>
            <TimeTrackingProvider>
              <BackupProvider>
                <RootLayoutNav />
              </BackupProvider>
            </TimeTrackingProvider>
          </DayEntriesProvider>
        </SettingsProvider>
      </OfflineQueueProvider>
    </ToastProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  // Show setup screen if required env is missing
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const backupBucket = process.env.EXPO_PUBLIC_BACKUP_BUCKET;

  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push("EXPO_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) missingVars.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  if (!backupBucket) missingVars.push("EXPO_PUBLIC_BACKUP_BUCKET");

  if (missingVars.length > 0) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SetupScreen missing={missingVars} />
      </GestureHandlerRootView>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
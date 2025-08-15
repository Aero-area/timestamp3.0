import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return null; // Show splash screen while loading
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppContent() {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return null;
  }

  return (
    <ToastProvider>
      <OfflineQueueProvider>
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

  // Check if environment variables are missing
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  const backupBucket = process.env.EXPO_PUBLIC_BACKUP_BUCKET;
  
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  if (!backupBucket) missingVars.push('EXPO_PUBLIC_BACKUP_BUCKET');
  // Note: EXPO_PUBLIC_BACKUP_ENABLED is optional and defaults to false
  
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
import React from 'react';
import { Tabs } from 'expo-router';
import { Calendar, FileSpreadsheet, BarChart3, Settings as SettingsIcon } from '@/components/icons';
import { colors } from '@/constants/colors';
import { useSettings } from '@/providers/SettingsProvider';

export default function TabsLayout() {
  const { t } = useSettings();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="entries"
        options={{
          title: t('entries'),
          tabBarIcon: ({ size, color }) => <FileSpreadsheet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('reports'),
          tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ size, color }) => <SettingsIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
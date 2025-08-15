import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw } from '@/components/icons';

interface SetupScreenProps {
  missing?: string[];
}

export default function SetupScreen({ missing = [] }: SetupScreenProps) {
  const handleReload = () => {
    // Force app reload by throwing an error that will be caught by error boundary
    // In development, this will reload the app
    if (__DEV__) {
      window.location?.reload?.();
    }
  };

  const allEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY', 
    'EXPO_PUBLIC_BACKUP_BUCKET'
  ];
  
  const missingVars = missing.length > 0 ? missing : allEnvVars;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Environment Setup Required</Text>
          <Text style={styles.subtitle}>
            Please add the following environment variables to your project:
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Missing Environment Variables:</Text>
          
          {missingVars.map((varName) => {
            const examples = {
              'EXPO_PUBLIC_SUPABASE_URL': 'https://wrvxhjqvgatfolvlqlev.supabase.co',
              'EXPO_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              'EXPO_PUBLIC_BACKUP_BUCKET': 'backups'
            };
            
            return (
              <View key={varName} style={styles.variable}>
                <Text style={styles.variableName}>{varName}</Text>
                <Text style={styles.variableExample}>
                  Example: {examples[varName as keyof typeof examples]}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Setup Instructions:</Text>
          <Text style={styles.instructionText}>
            1. Go to Project → Environment in the RORK interface
          </Text>
          <Text style={styles.instructionText}>
            2. Add the environment variables shown above
          </Text>
          <Text style={styles.instructionText}>
            3. Click &quot;Reload App&quot; below to restart with new environment
          </Text>
          <Text style={styles.instructionText}>
            4. Make sure your Supabase project has RLS enabled on the day_entries table
          </Text>
        </View>
        
        <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
          <RefreshCw size={20} color="#FFFFFF" style={styles.reloadIcon} />
          <Text style={styles.reloadButtonText}>Reload App</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  variable: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  variableName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  variableExample: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  instructions: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
    lineHeight: 20,
  },
  reloadButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reloadIcon: {
    marginRight: 8,
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
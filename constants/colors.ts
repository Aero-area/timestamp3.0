// constants/colors.ts
// Brand color system for Timestamp 3.0

export const colors = {
  // Primary brand colors
  primary: '#008d36',
  primaryHover: '#007a2e',
  primaryActive: '#006b28',
  onPrimary: '#FFFFFF',
  
  // Semantic colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Text colors
  text: '#111827',
  textMuted: '#6B7280',
  textSecondary: '#374151',
  
  // Background colors
  background: '#F9FAFB',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F3F4F6',
  
  // Border colors
  border: '#E5E7EB',
  borderSecondary: '#D1D5DB',
  
  // Interactive states
  hover: '#F3F4F6',
  active: '#E5E7EB',
  disabled: '#9CA3AF',
  
  // Legacy support (for gradual migration)
  purple: '#008d36', // Maps to primary
  indigo: '#008d36', // Maps to primary
  violet: '#008d36', // Maps to primary
} as const;

export type ColorToken = keyof typeof colors;
export default colors;

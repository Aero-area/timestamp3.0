import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Save, Clock, RotateCcw, Check, LogOut, Database, Globe } from "@/components/icons";
import { useSettings } from "@/providers/SettingsProvider";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useBackup } from "@/providers/BackupProvider";
import { Picker } from "@react-native-picker/picker";
import { colors } from "@/constants/colors";

export default function SettingsScreen() {
  const { 
    settings, 
    rolloverDay, 
    rolloverHour, 
    roundingRule, 
    hasUnsavedChanges,
    language,
    setLanguage,
    setRolloverDay, 
    setRolloverHour, 
    setRoundingRule, 
    updateSettings,
    saveSettings,
    loaded,
    t
  } = useSettings();

  const ROUNDING_OPTIONS = [
    { label: t('noRounding'), value: "none" },
    { label: t('fiveMinutes'), value: "5" },
    { label: t('tenMinutes'), value: "10" },
    { label: t('fifteenMinutes'), value: "15" },
  ];
  
  const { showToast } = useToast();
  const { signOut, user } = useAuth();
  const { performBackup, isBackingUp, backupEnabled, lastBackupAt } = useBackup();

  const handleSave = async () => {
    // Validate rollover day
    if (rolloverDay < 1 || rolloverDay > 28) {
      showToast(t('rolloverDayRange'), "error");
      return;
    }

    // Validate rollover hour
    if (rolloverHour < 0 || rolloverHour > 23) {
      showToast(t('rolloverHourRange'), "error");
      return;
    }

    try {
      // Update settings with current form values
      updateSettings({
        rollover_day_utc: rolloverDay,
        rollover_hour: rolloverHour,
        rounding_rule: roundingRule,
      });
      
      // Save to both Supabase and AsyncStorage
      await saveSettings();
      
      // Show success toast
      showToast(t('settingsSaved'), "success");
    } catch (error: any) {
      showToast(error.message || t('failedToSave'), "error");
    }
  };

  const handleReset = () => {
    setRolloverDay(settings.rollover_day_utc);
    setRolloverHour(settings.rollover_hour);
    setRoundingRule(settings.rounding_rule);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast(t.loggedOutSuccessfully, 'success');
    } catch {
      showToast(t.failedToLogout, 'error');
    }
  };

  const handleManualBackup = async () => {
    await performBackup(true);
  };

  // Show loading state while settings are being loaded
  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Rollover Day Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <RotateCcw size={20} color={colors.primary} />
            <Text style={styles.settingTitle}>{t('timesheetRolloverDay')}</Text>
          </View>
          
          <Text style={styles.settingDescription}>
            {t('rolloverDayDescription')}
          </Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={rolloverDay}
              onValueChange={(value) => setRolloverDay(value)}
              style={styles.picker}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <Picker.Item
                  key={day}
                  label={t('dayOfMonth', { day: day.toString() })}
                  value={day}
                />
              ))}
            </Picker>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {t('currentSetting', { day: rolloverDay.toString() })}
            </Text>
          </View>
        </View>

        {/* Rollover Hour Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.settingTitle}>{t('rolloverHour')}</Text>
          </View>
          
          <Text style={styles.settingDescription}>
            {t('rolloverHourDescription')}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('rolloverHour')}</Text>
            <TextInput
              style={styles.hourInput}
              value={rolloverHour.toString()}
              onChangeText={(text) => {
                const hour = parseInt(text) || 0;
                setRolloverHour(hour);
              }}
              keyboardType="numeric"
              placeholder="0-23"
              placeholderTextColor={colors.textMuted}
              maxLength={2}
            />
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {t('rolloverHourHelp')}
            </Text>
          </View>
        </View>

        {/* Rounding Rule Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.settingTitle}>{t('timeRoundingRule')}</Text>
          </View>
          
          <Text style={styles.settingDescription}>
            {t('roundingDescription')}
          </Text>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={roundingRule}
              onValueChange={(value) => setRoundingRule(value)}
              style={styles.picker}
            >
              {ROUNDING_OPTIONS.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {t('roundingInfo')[roundingRule as keyof typeof t.roundingInfo]}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={!hasUnsavedChanges}
          >
            <Text style={[
              styles.resetButtonText,
              !hasUnsavedChanges && styles.disabledText
            ]}>
              {t('reset')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              !hasUnsavedChanges && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!hasUnsavedChanges}
          >
            {hasUnsavedChanges ? (
              <>
                <Save size={18} color={colors.onPrimary} />
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </>
            ) : (
              <>
                <Check size={18} color={colors.onPrimary} />
                <Text style={styles.saveButtonText}>{t('saved')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Backup Section */}
        {backupEnabled && (
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Database size={20} color={colors.success} />
              <Text style={styles.settingTitle}>{t('dataBackup')}</Text>
            </View>
            
            <Text style={styles.settingDescription}>
              {lastBackupAt 
                ? `${t('lastBackup')}: ${new Date(lastBackupAt).toLocaleDateString()} at ${new Date(lastBackupAt).toLocaleTimeString()}`
                : t('noBackupYet')}
            </Text>
            
            <TouchableOpacity
              style={styles.backupButton}
              onPress={handleManualBackup}
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <ActivityIndicator size="small" color={colors.success} />
              ) : (
                <Database size={18} color={colors.success} />
              )}
              <Text style={styles.backupButtonText}>
                {isBackingUp ? t('backingUp') : t('backupNow')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Language Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Globe size={20} color={colors.primary} />
            <Text style={styles.settingTitle}>{t('language')}</Text>
          </View>

          <Text style={styles.settingDescription}>
            {t('languageDescription')}
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={language}
              onValueChange={(value) => setLanguage(value)}
              style={styles.picker}
            >
              <Picker.Item label="English" value="en" />
              <Picker.Item label="Dansk" value="da" />
            </Picker>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <LogOut size={20} color={colors.error} />
            <Text style={styles.settingTitle}>{t('account')}</Text>
          </View>
          
          <Text style={styles.settingDescription}>
            {`${t('signedInAs')}: ${user?.email}`}
          </Text>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={18} color={colors.error} />
            <Text style={styles.logoutButtonText}>{t('signOut')}</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>{t('aboutSettings')}</Text>
          <Text style={styles.helpText}>
            • {t('rolloverDayHelp')}
          </Text>
          <Text style={styles.helpText}>
            • {t('roundingRulesHelp')}
          </Text>
          <Text style={styles.helpText}>
            • {t('utcConsistency')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  },
  settingCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.backgroundTertiary,
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  hourInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: colors.backgroundSecondary,
    color: colors.text,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: colors.backgroundTertiary,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  disabledText: {
    color: colors.disabled,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  helpCard: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    padding: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
  },
  helpText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.backgroundSecondary,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  backupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.backgroundSecondary,
  },
  backupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
});
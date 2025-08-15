import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Save, Clock, RotateCcw, Check, LogOut, Database } from "@/components/icons";
import { useSettings } from "@/providers/SettingsProvider";
import { useToast } from "@/providers/ToastProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useBackup } from "@/providers/BackupProvider";
import { Picker } from "@react-native-picker/picker";

const ROUNDING_OPTIONS = [
  { label: "No rounding", value: "none" },
  { label: "5 minutes", value: "5" },
  { label: "10 minutes", value: "10" },
  { label: "15 minutes", value: "15" },
];

export default function SettingsScreen() {
  const { settings, updateSettings, isUpdating } = useSettings();
  const { showToast } = useToast();
  const { signOut, user } = useAuth();
  const { performBackup, isBackingUp, backupEnabled, lastBackupAt } = useBackup();
  
  const [rolloverDay, setRolloverDay] = useState(settings.rollover_day_utc);
  const [roundingRule, setRoundingRule] = useState(settings.rounding_rule);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed = 
      rolloverDay !== settings.rollover_day_utc ||
      roundingRule !== settings.rounding_rule;
    setHasChanges(changed);
  }, [rolloverDay, roundingRule, settings]);

  const handleSave = async () => {
    // Validate rollover day
    if (rolloverDay < 1 || rolloverDay > 28) {
      showToast("Rollover day must be between 1 and 28", "error");
      return;
    }

    try {
      await updateSettings({
        rollover_day_utc: rolloverDay,
        rounding_rule: roundingRule,
      });
      showToast("Settings saved successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to save settings", "error");
    }
  };

  const handleReset = () => {
    setRolloverDay(settings.rollover_day_utc);
    setRoundingRule(settings.rounding_rule);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged out successfully', 'success');
    } catch {
      showToast('Failed to log out', 'error');
    }
  };

  const handleManualBackup = async () => {
    await performBackup(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Rollover Day Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <RotateCcw size={20} color="#4F46E5" />
            <Text style={styles.settingTitle}>Timesheet Rollover Day</Text>
          </View>
          
          <Text style={styles.settingDescription}>
            Day of the month when timesheet periods reset (UTC timezone)
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
                  label={`Day ${day}`}
                  value={day}
                />
              ))}
            </Picker>
          </View>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Current setting: Day {rolloverDay} of each month
            </Text>
          </View>
        </View>

        {/* Rounding Rule Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Clock size={20} color="#4F46E5" />
            <Text style={styles.settingTitle}>Time Rounding Rule</Text>
          </View>
          
          <Text style={styles.settingDescription}>
            Automatically round time entries to the nearest interval
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
              {roundingRule === "none"
                ? "Time entries will not be rounded"
                : `Time will be rounded to nearest ${roundingRule} minutes`}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={!hasChanges}
          >
            <Text style={[
              styles.resetButtonText,
              !hasChanges && styles.disabledText
            ]}>
              Reset Changes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              !hasChanges && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!hasChanges || isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                {hasChanges ? (
                  <Save size={18} color="#FFFFFF" />
                ) : (
                  <Check size={18} color="#FFFFFF" />
                )}
                <Text style={styles.saveButtonText}>
                  {hasChanges ? "Save Changes" : "Saved"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Backup Section */}
        {backupEnabled && (
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Database size={20} color="#059669" />
              <Text style={styles.settingTitle}>Data Backup</Text>
            </View>
            
            <Text style={styles.settingDescription}>
              {lastBackupAt 
                ? `Last backup: ${new Date(lastBackupAt).toLocaleDateString()} at ${new Date(lastBackupAt).toLocaleTimeString()}`
                : 'No backup yet'}
            </Text>
            
            <TouchableOpacity
              style={styles.backupButton}
              onPress={handleManualBackup}
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <ActivityIndicator size="small" color="#059669" />
              ) : (
                <Database size={18} color="#059669" />
              )}
              <Text style={styles.backupButtonText}>
                {isBackingUp ? 'Backing up...' : 'Backup Now'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <LogOut size={20} color="#DC2626" />
            <Text style={styles.settingTitle}>Account</Text>
          </View>
          
          <Text style={styles.settingDescription}>
            Signed in as: {user?.email}
          </Text>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={18} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>About Settings</Text>
          <Text style={styles.helpText}>
            • Rollover day determines when your timesheet period resets each month
          </Text>
          <Text style={styles.helpText}>
            • Rounding rules apply to all time entries when calculating totals
          </Text>
          <Text style={styles.helpText}>
            • All times are processed in UTC to ensure consistency
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
  },
  settingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
  },
  settingDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
  infoBox: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#4F46E5",
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
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  disabledText: {
    color: "#D1D5DB",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  helpCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 16,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  helpText: {
    fontSize: 13,
    color: "#6B7280",
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
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
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
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  backupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
});
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Play, Calendar, AlertCircle } from "@/components/icons";
import { useTimeTracking } from "@/providers/TimeTrackingProvider";
import { useSettings } from "@/providers/SettingsProvider";
import { colors } from "@/constants/colors";

export default function HomeScreen() {
  const { onStamp } = useTimeTracking();
  const { settings, currentPeriod, isRolloverDay, loaded, t } = useSettings();
  const [isStamping, setIsStamping] = useState(false);

  const handleStamp = async () => {
    setIsStamping(true);
    try {
      await onStamp();
    } finally {
      setIsStamping(false);
    }
  };

  const refreshStatus = () => {
    // No-op for now since we don't have server polling
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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={refreshStatus} />
      }
    >
      {/* Timesheet Period Banner */}
      <View style={styles.periodBanner}>
        <View style={styles.periodHeader}>
          <Calendar size={20} color={colors.textMuted} />
          <Text style={styles.periodLabel}>{t('currentTimesheetPeriod')}</Text>
        </View>
        <Text style={styles.periodDates}>
          {currentPeriod?.start || "--"} → {currentPeriod?.end || "--"}
        </Text>
        <View style={styles.rolloverBadge}>
          <Text style={styles.rolloverText}>
            {t('rolloverOnDay')} {settings.rollover_day_utc} (Copenhagen)
          </Text>
        </View>
      </View>

      {/* Rollover Day Info Banner */}
      {isRolloverDay && (
        <View style={styles.infoBanner}>
          <AlertCircle size={16} color={colors.info} />
          <Text style={styles.infoText}>
            {t('rolloverHappensTonight')}
          </Text>
        </View>
      )}

      {/* Stamp Button */}
      <View style={styles.stampSection}>
        <Text style={styles.stampLabel}>
          {t('tapToRecord')}
        </Text>
        <TouchableOpacity
          style={[
            styles.stampButton,
            isStamping && styles.disabledButton,
          ]}
          onPress={handleStamp}
          disabled={isStamping}
          activeOpacity={0.8}
        >
          {isStamping ? (
            <ActivityIndicator size="large" color={colors.onPrimary} />
          ) : (
            <>
              <Play size={32} color={colors.onPrimary} fill={colors.onPrimary} />
              <Text style={styles.buttonText}>{t('stamp')}</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.stampDescription}>
          {t('stampDescription')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
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
  periodBanner: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  periodLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  periodDates: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  rolloverBadge: {
    backgroundColor: colors.backgroundTertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  rolloverText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  infoBanner: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  infoText: {
    fontSize: 14,
    color: colors.info,
    flex: 1,
  },
  stampSection: {
    alignItems: "center",
    marginVertical: 40,
  },
  stampLabel: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 20,
    textAlign: "center",
  },
  stampButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: colors.primary,
  },
  stampDescription: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1,
  },
  statusContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
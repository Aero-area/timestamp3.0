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

export default function HomeScreen() {
  const { onStamp } = useTimeTracking();
  const { settings, currentPeriod, isRolloverDay } = useSettings();
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
          <Calendar size={20} color="#6B7280" />
          <Text style={styles.periodLabel}>Current Timesheet Period</Text>
        </View>
        <Text style={styles.periodDates}>
          {currentPeriod?.start || "--"} → {currentPeriod?.end || "--"}
        </Text>
        <View style={styles.rolloverBadge}>
          <Text style={styles.rolloverText}>
            Rollover on day {settings.rollover_day_utc} (Copenhagen)
          </Text>
        </View>
      </View>

      {/* Rollover Day Info Banner */}
      {isRolloverDay && (
        <View style={styles.infoBanner}>
          <AlertCircle size={16} color="#3B82F6" />
          <Text style={styles.infoText}>
            Rollover happens at 00:00 Copenhagen time tonight
          </Text>
        </View>
      )}

      {/* Stamp Button */}
      <View style={styles.stampSection}>
        <Text style={styles.stampLabel}>
          Tap to record a time stamp
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
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <>
              <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.buttonText}>STAMP</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.stampDescription}>
          First stamp starts your day, second stamp ends it.
          Additional stamps update the end time.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    padding: 20,
  },
  periodBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  periodLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  periodDates: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  rolloverBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  rolloverText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500",
  },
  infoBanner: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoText: {
    fontSize: 14,
    color: "#1E40AF",
    flex: 1,
  },
  stampSection: {
    alignItems: "center",
    marginVertical: 40,
  },
  stampLabel: {
    fontSize: 16,
    color: "#6B7280",
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
    backgroundColor: "#4F46E5",
  },
  stampDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
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
    color: "#6B7280",
  },
});
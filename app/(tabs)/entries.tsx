import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useDayEntries } from "@/providers/DayEntriesProvider";
import { hhmmCph } from "@/lib/time";
import type { DayEntry } from "@/types";
import { colors } from "@/constants/colors";
import { t } from "@/constants/strings";

export default function EntriesScreen() {
  const { dayEntries, isLoading } = useDayEntries();

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.dateColumn]}>{t.date} (CPH)</Text>
      <Text style={[styles.headerCell, styles.timeColumn]}>{t.start}</Text>
      <Text style={[styles.headerCell, styles.timeColumn]}>{t.end}</Text>
      <Text style={[styles.headerCell, styles.totalColumn]}>{t.total}</Text>
    </View>
  );

  const renderTableRow = (entry: DayEntry, index: number) => (
    <View key={`${entry.user_id}-${entry.date_utc}`} style={[styles.tableRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      <Text style={[styles.cell, styles.dateColumn]}>{entry.date_utc}</Text>
      <Text style={[styles.cell, styles.timeColumn]}>
        {hhmmCph(entry.start_ts) || "--"}
      </Text>
      <Text style={[styles.cell, styles.timeColumn]}>
        {hhmmCph(entry.end_ts) || "--"}
      </Text>
      <Text style={[styles.cell, styles.totalColumn]}>
        {entry.total_hhmm || "--"}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t.noEntriesInPeriod}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : dayEntries.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView style={styles.tableContainer} horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {renderTableHeader()}
            {dayEntries.map((entry, index) => renderTableRow(entry, index))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    backgroundColor: colors.backgroundSecondary,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.backgroundTertiary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  evenRow: {
    backgroundColor: colors.backgroundSecondary,
  },
  oddRow: {
    backgroundColor: colors.background,
  },
  headerCell: {
    padding: 12,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },
  cell: {
    padding: 12,
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  dateColumn: {
    width: 120,
    minWidth: 120,
  },
  timeColumn: {
    width: 80,
    minWidth: 80,
  },
  totalColumn: {
    width: 80,
    minWidth: 80,
    fontWeight: "600",
  },
});
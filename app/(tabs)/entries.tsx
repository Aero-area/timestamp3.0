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

export default function EntriesScreen() {
  const { dayEntries, isLoading } = useDayEntries();

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.dateColumn]}>Date (CPH)</Text>
      <Text style={[styles.headerCell, styles.timeColumn]}>Start</Text>
      <Text style={[styles.headerCell, styles.timeColumn]}>End</Text>
      <Text style={[styles.headerCell, styles.totalColumn]}>Total</Text>
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
      <Text style={styles.emptyText}>No entries in this period yet.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
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
    backgroundColor: "#F9FAFB",
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
    color: "#9CA3AF",
    textAlign: "center",
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  evenRow: {
    backgroundColor: "#FFFFFF",
  },
  oddRow: {
    backgroundColor: "#F9FAFB",
  },
  headerCell: {
    padding: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  cell: {
    padding: 12,
    fontSize: 14,
    color: "#111827",
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
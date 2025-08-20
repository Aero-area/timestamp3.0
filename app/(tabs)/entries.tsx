import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useDayEntries } from "@/providers/DayEntriesProvider";
import { hhmmCph } from "@/lib/time";
import type { DayEntry } from "@/types";
import { colors } from "@/constants/colors";
import { useSettings } from "@/providers/SettingsProvider";
import { Plus, Trash, Edit } from "@/components/icons";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import dayjs from "dayjs";

export default function EntriesScreen() {
  const { dayEntries, isLoading, deleteEntry, addEntry, updateEntry } = useDayEntries();
  const { t } = useSettings();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DayEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [startHour, setStartHour] = useState("0");
  const [startMinute, setStartMinute] = useState("0");
  const [endHour, setEndHour] = useState("0");
  const [endMinute, setEndMinute] = useState("0");

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerCell, styles.dateColumn]}>{t('date')} (CPH)</Text>
      <Text style={[styles.headerCell, styles.timeColumn]}>{t('start')}</Text>
      <Text style={[styles.headerCell, styles.timeColumn]}>{t('end')}</Text>
      <Text style={[styles.headerCell, styles.totalColumn]}>{t('total')}</Text>
    </View>
  );

  const openEditModal = (entry: DayEntry) => {
    setEditingEntry(entry);
    setSelectedDate(entry.date_utc);
    if (entry.start_ts) {
      const start = dayjs(entry.start_ts);
      setStartHour(start.hour().toString());
      setStartMinute(start.minute().toString());
    }
    if (entry.end_ts) {
      const end = dayjs(entry.end_ts);
      setEndHour(end.hour().toString());
      setEndMinute(end.minute().toString());
    }
    setModalVisible(true);
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setSelectedDate("");
    setStartHour("0");
    setStartMinute("0");
    setEndHour("0");
    setEndMinute("0");
    setModalVisible(true);
  };

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
      <TouchableOpacity onPress={() => openEditModal(entry)} style={styles.editButton}>
        <Edit size={18} color={colors.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteEntry(entry.date_utc)} style={styles.deleteButton}>
        <Trash size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('noEntriesInPeriod')}</Text>
    </View>
  );

  const handleAddOrUpdateEntry = () => {
    if (!selectedDate) return;

    const start_ts = dayjs(selectedDate).hour(parseInt(startHour)).minute(parseInt(startMinute)).toISOString();
    const end_ts = dayjs(selectedDate).hour(parseInt(endHour)).minute(parseInt(endMinute)).toISOString();

    if (editingEntry) {
      updateEntry(editingEntry.date_utc, { start_ts, end_ts });
    } else {
      addEntry({ date_utc: selectedDate, start_ts, end_ts });
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('timeEntries')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Plus size={18} color={colors.onPrimary} />
          <Text style={styles.addButtonText}>{t('add')}</Text>
        </TouchableOpacity>
      </View>

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {!selectedDate ? (
              <Calendar
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                }}
                markedDates={{
                  [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: 'blue' }
                }}
              />
            ) : (
              <>
                <Text>{t('selectedDate', { date: selectedDate })}</Text>
                <View style={styles.timePickerContainer}>
                  <Picker
                    selectedValue={startHour}
                    style={{ height: 50, width: 100 }}
                    onValueChange={(itemValue) => setStartHour(itemValue)}
                  >
                    {Array.from({ length: 24 }, (_, i) => i.toString()).map(hour => (
                      <Picker.Item key={hour} label={hour} value={hour} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={startMinute}
                    style={{ height: 50, width: 100 }}
                    onValueChange={(itemValue) => setStartMinute(itemValue)}
                  >
                    {Array.from({ length: 60 }, (_, i) => i.toString()).map(minute => (
                      <Picker.Item key={minute} label={minute} value={minute} />
                    ))}
                  </Picker>
                </View>
                <View style={styles.timePickerContainer}>
                  <Picker
                    selectedValue={endHour}
                    style={{ height: 50, width: 100 }}
                    onValueChange={(itemValue) => setEndHour(itemValue)}
                  >
                    {Array.from({ length: 24 }, (_, i) => i.toString()).map(hour => (
                      <Picker.Item key={hour} label={hour} value={hour} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={endMinute}
                    style={{ height: 50, width: 100 }}
                    onValueChange={(itemValue) => setEndMinute(itemValue)}
                  >
                    {Array.from({ length: 60 }, (_, i) => i.toString()).map(minute => (
                      <Picker.Item key={minute} label={minute} value={minute} />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={[styles.button, styles.buttonClose]}
                  onPress={handleAddOrUpdateEntry}
                >
                  <Text style={styles.textStyle}>{editingEntry ? t('edit') : t('add')}</Text>
                </TouchableOpacity>
              </>
            )}
             <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
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
  editButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  }
});
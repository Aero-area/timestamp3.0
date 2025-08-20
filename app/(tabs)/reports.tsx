import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Download, FileText, FileSpreadsheet, Calendar } from "@/components/icons";
import { useToast } from "@/providers/ToastProvider";
import { useDayEntries } from "@/providers/DayEntriesProvider";
import { useSettings } from "@/providers/SettingsProvider";
import { exportCsv, exportPdf } from "@/lib/export";
import { previousPeriodCph } from "@/lib/time";
import { colors } from "@/constants/colors";

export default function ReportsScreen() {
  const { showToast } = useToast();
  const { getEntriesBetween } = useDayEntries();
  const { settings, t } = useSettings();
  
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  // Validate date range
  const isValidDateRange = dateFrom && dateTo && new Date(dateTo) >= new Date(dateFrom);

  // Load entries when date range changes
  useEffect(() => {
    if (isValidDateRange) {
      loadEntriesForRange();
    }
  }, [dateFrom, dateTo]);

  const loadEntriesForRange = async () => {
    if (!isValidDateRange) return;
    
    setIsLoadingEntries(true);
    try {
      const fetchedEntries = await getEntriesBetween(dateFrom, dateTo);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
      showToast(t('failedToLoadEntries'), 'error');
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleExportCSV = async () => {
    if (!isValidDateRange || entries.length === 0) {
      showToast(t('pleaseSelectValidDateRangeWithEntries'), 'error');
      return;
    }
    
    setIsExporting(true);
    try {
      await exportCsv(entries, { start: dateFrom, end: dateTo }, {
        language: settings.language,
        rollover_day_utc: settings.rollover_day_utc,
        rollover_hour: settings.rollover_hour,
      });
      
      if (Platform.OS === 'web') {
        showToast(t('csvDownloadStarted'), 'success');
      } else {
        showToast(t('csvShareOpened'), 'success');
      }
    } catch (error: any) {
      showToast(error.message || t('failedToExport'), "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!isValidDateRange || entries.length === 0) {
      showToast(t('pleaseSelectValidDateRangeWithEntries'), 'error');
      return;
    }
    
    setIsExporting(true);
    try {
      await exportPdf(entries, { start: dateFrom, end: dateTo }, {
        language: settings.language,
        rollover_day_utc: settings.rollover_day_utc,
        rollover_hour: settings.rollover_hour,
      });
      
      if (Platform.OS === 'web') {
        showToast(t('pdfPrintWindowOpened'), 'success');
      } else {
        showToast(t('pdfShareOpened'), 'success');
      }
    } catch (error: any) {
      showToast(error.message || t('failedToExport'), "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to get last 7 days for quick testing
  const setLast7Days = () => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    setDateTo(today.toISOString().split("T")[0]);
    setDateFrom(lastWeek.toISOString().split("T")[0]);
  };

  const setLast30Days = () => {
    const today = new Date();
    const last30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setDateTo(today.toISOString().split("T")[0]);
    setDateFrom(last30.toISOString().split("T")[0]);
  }

  const setLastRollover = () => {
    const { startDateKey, endDateKey } = previousPeriodCph(
      settings.rollover_day_utc,
      settings.rollover_hour
    );
    setDateFrom(startDateKey);
    setDateTo(endDateKey);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t('selectDateRange')}</Text>
          </View>
          
          <View style={styles.dateInputContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('fromDate')}</Text>
              <TextInput
                style={[
                  styles.dateInput,
                  dateFrom && !isValidDateRange && styles.dateInputError
                ]}
                placeholder="YYYY-MM-DD"
                value={dateFrom}
                onChangeText={setDateFrom}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('toDate')}</Text>
              <TextInput
                style={[
                  styles.dateInput,
                  dateTo && !isValidDateRange && styles.dateInputError
                ]}
                placeholder="YYYY-MM-DD"
                value={dateTo}
                onChangeText={setDateTo}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.quickButtonsContainer}>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={setLast7Days}
            >
              <Text style={styles.quickButtonText}>{t('last7Days')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={setLast30Days}
            >
              <Text style={styles.quickButtonText}>{t('last30Days')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickButton}
              onPress={setLastRollover}
            >
              <Text style={styles.quickButtonText}>{t('lastRollover')}</Text>
            </TouchableOpacity>
          </View>

          {/* Date validation message */}
          {dateFrom && dateTo && !isValidDateRange && (
            <View style={styles.validationMessage}>
              <Text style={styles.validationText}>
                {t('endDateBeforeStart')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>{t('exportOptions')}</Text>
          
          <TouchableOpacity
            style={[
              styles.exportButton,
              styles.csvButton,
              (!isValidDateRange || isExporting || isLoadingEntries) && styles.exportButtonDisabled
            ]}
            onPress={handleExportCSV}
            disabled={!isValidDateRange || isExporting || isLoadingEntries}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <FileSpreadsheet size={24} color={colors.onPrimary} />
                <View style={styles.exportButtonContent}>
                  <Text style={styles.exportButtonTitle}>{t('exportCSV')}</Text>
                  <Text style={styles.exportButtonSubtitle}>
                    {t('csvDescription')}
                  </Text>
                </View>
                <Download size={20} color={colors.onPrimary} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.exportButton,
              styles.pdfButton,
              (!isValidDateRange || isExporting || isLoadingEntries) && styles.exportButtonDisabled
            ]}
            onPress={handleExportPDF}
            disabled={!isValidDateRange || isExporting || isLoadingEntries}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <FileText size={24} color={colors.onPrimary} />
                <View style={styles.exportButtonContent}>
                  <Text style={styles.exportButtonTitle}>{t('exportPDF')}</Text>
                  <Text style={styles.exportButtonSubtitle}>
                    {t('pdfDescription')}
                  </Text>
                </View>
                <Download size={20} color={colors.onPrimary} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Preview section */}
        {(dateFrom && dateTo) && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{t('reportPreview')}</Text>
            <Text style={styles.previewText}>
              {t('period')}: {dateFrom} {t('to')} {dateTo}
            </Text>
            
            {isLoadingEntries ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>{t('loading')}</Text>
              </View>
            ) : entries.length > 0 ? (
              <View style={styles.entriesSummary}>
                <Text style={styles.entriesCount}>
                  {t('entriesFound', { count: entries.length })}
                </Text>
                <Text style={styles.exportNote}>
                  {t('exportNote')}
                </Text>
              </View>
            ) : (
              <Text style={styles.noEntriesText}>
                {t('noEntriesInPeriod')}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
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
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  dateInputContainer: {
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  dateInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: colors.backgroundSecondary,
    color: colors.text,
  },
  dateInputError: {
    borderColor: colors.error,
  },
  validationMessage: {
    backgroundColor: colors.backgroundTertiary,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  validationText: {
    fontSize: 14,
    color: colors.error,
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickButton: {
    backgroundColor: colors.backgroundTertiary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  exportSection: {
    gap: 16,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  csvButton: {
    backgroundColor: colors.success,
  },
  pdfButton: {
    backgroundColor: colors.error,
  },
  exportButtonContent: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.onPrimary,
    marginBottom: 2,
  },
  exportButtonSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  previewCard: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  entriesSummary: {
    gap: 4,
  },
  entriesCount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  exportNote: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  noEntriesText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});
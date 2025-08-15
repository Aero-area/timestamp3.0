import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { Download, FileText, FileSpreadsheet, Calendar } from "@/components/icons";
import { useToast } from "@/providers/ToastProvider";
import { api } from "@/utils/api";
import { colors } from "@/constants/colors";
import { t } from "@/constants/strings";

export default function ReportsScreen() {
  const { showToast } = useToast();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const validateDates = () => {
    if (!dateFrom || !dateTo) {
      showToast(t.pleaseSelectDates, "error");
      return false;
    }
    
    if (new Date(dateTo) < new Date(dateFrom)) {
      showToast(t.endDateBeforeStart, "error");
      return false;
    }
    
    return true;
  };

  const handleExportCSV = async () => {
    if (!validateDates()) return;
    
    setIsExporting(true);
    try {
      const url = await api.exportCSV(dateFrom, dateTo);
      
      if (Platform.OS === "web") {
        // For web, create a download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `timesheet_${dateFrom}_${dateTo}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, open the URL
        await Linking.openURL(url);
      }
      
      showToast(t.csvExportedSuccessfully, "success");
    } catch (error: any) {
      showToast(error.message || t.failedToExport, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!validateDates()) return;
    
    setIsExporting(true);
    try {
      const url = await api.exportPDF(dateFrom, dateTo);
      
      if (Platform.OS === "web") {
        // For web, create a download link
        const link = document.createElement("a");
        link.href = url;
        link.download = `timesheet_${dateFrom}_${dateTo}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, open the URL
        await Linking.openURL(url);
      }
      
      showToast(t.pdfExportedSuccessfully, "success");
    } catch (error: any) {
      showToast(error.message || t.failedToExport, "error");
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>{t.selectDateRange}</Text>
          </View>
          
          <View style={styles.dateInputContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.fromDate}</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={dateFrom}
                onChangeText={setDateFrom}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.toDate}</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={dateTo}
                onChangeText={setDateTo}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={setLast7Days}
          >
            <Text style={styles.quickButtonText}>{t.last7Days}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>{t.exportOptions}</Text>
          
          <TouchableOpacity
            style={[
              styles.exportButton,
              styles.csvButton,
              isExporting && styles.exportButtonDisabled
            ]}
            onPress={handleExportCSV}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <FileSpreadsheet size={24} color={colors.onPrimary} />
                <View style={styles.exportButtonContent}>
                  <Text style={styles.exportButtonTitle}>{t.exportCSV}</Text>
                  <Text style={styles.exportButtonSubtitle}>
                    {t.csvDescription}
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
              isExporting && styles.exportButtonDisabled
            ]}
            onPress={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <FileText size={24} color={colors.onPrimary} />
                <View style={styles.exportButtonContent}>
                  <Text style={styles.exportButtonTitle}>{t.exportPDF}</Text>
                  <Text style={styles.exportButtonSubtitle}>
                    {t.pdfDescription}
                  </Text>
                </View>
                <Download size={20} color={colors.onPrimary} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {(dateFrom && dateTo) && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{t.reportPreview}</Text>
            <Text style={styles.previewText}>
              {t.period}: {dateFrom} {t.to} {dateTo}
            </Text>
            <Text style={styles.previewNote}>
              {t.exportNote}
            </Text>
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
    opacity: 0.7,
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
    marginBottom: 4,
  },
  previewNote: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});
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

export default function ReportsScreen() {
  const { showToast } = useToast();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const validateDates = () => {
    if (!dateFrom || !dateTo) {
      showToast("Please select both start and end dates", "error");
      return false;
    }
    
    if (new Date(dateTo) < new Date(dateFrom)) {
      showToast("End date cannot be before start date", "error");
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
      
      showToast("CSV exported successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to export CSV", "error");
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
      
      showToast("PDF exported successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to export PDF", "error");
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
            <Calendar size={20} color="#4F46E5" />
            <Text style={styles.cardTitle}>Select Date Range</Text>
          </View>
          
          <View style={styles.dateInputContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>From Date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={dateFrom}
                onChangeText={setDateFrom}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>To Date</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={dateTo}
                onChangeText={setDateTo}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={setLast7Days}
          >
            <Text style={styles.quickButtonText}>Last 7 Days</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>Export Options</Text>
          
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
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FileSpreadsheet size={24} color="#FFFFFF" />
                <View style={styles.exportButtonContent}>
                  <Text style={styles.exportButtonTitle}>Export CSV</Text>
                  <Text style={styles.exportButtonSubtitle}>
                    Spreadsheet format for analysis
                  </Text>
                </View>
                <Download size={20} color="#FFFFFF" />
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
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FileText size={24} color="#FFFFFF" />
                <View style={styles.exportButtonContent}>
                  <Text style={styles.exportButtonTitle}>Export PDF</Text>
                  <Text style={styles.exportButtonSubtitle}>
                    Formatted report for sharing
                  </Text>
                </View>
                <Download size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {(dateFrom && dateTo) && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Report Preview</Text>
            <Text style={styles.previewText}>
              Period: {dateFrom} to {dateTo}
            </Text>
            <Text style={styles.previewNote}>
              Export will include all time entries within this period
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
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
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
    color: "#374151",
  },
  dateInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  quickButton: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4F46E5",
  },
  exportSection: {
    gap: 16,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
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
    backgroundColor: "#10B981",
  },
  pdfButton: {
    backgroundColor: "#EF4444",
  },
  exportButtonContent: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  exportButtonSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  previewCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  previewNote: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
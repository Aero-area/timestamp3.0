// lib/export.ts
// Export helper functions for CSV and PDF reports
import { Platform } from 'react-native';
import type { DayEntry } from '@/types';
import { hhmmCph, dateHumanCph } from './time';

interface ExportRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

interface UserPrefs {
  language: string;
  rollover_day_utc: number;
  rollover_hour: number;
}

interface ExportEntry {
  date: string;
  start: string;
  end: string;
  total: string;
  duration_minutes: number;
}

// Convert day entries to export format
function prepareEntriesForExport(entries: DayEntry[]): ExportEntry[] {
  return entries.map(entry => ({
    date: entry.date_utc,
    start: entry.start_ts ? hhmmCph(entry.start_ts) : '--',
    end: entry.end_ts ? hhmmCph(entry.end_ts) : '--',
    total: entry.total_hhmm || '--',
    duration_minutes: entry.total_hhmm ? 
      parseInt(entry.total_hhmm.split(':')[0]) * 60 + parseInt(entry.total_hhmm.split(':')[1]) : 0
  }));
}

// Calculate summary statistics
function calculateSummary(entries: ExportEntry[]) {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalHoursFormatted = `${totalHours}:${remainingMinutes.toString().padStart(2, '0')}`;
  
  return {
    totalEntries: entries.length,
    totalMinutes,
    totalHoursFormatted,
    averagePerDay: entries.length > 0 ? Math.round(totalMinutes / entries.length) : 0
  };
}

// Export CSV functionality
export async function exportCsv(
  entries: DayEntry[], 
  range: ExportRange, 
  userPrefs: UserPrefs
): Promise<void> {
  const exportEntries = prepareEntriesForExport(entries);
  const summary = calculateSummary(exportEntries);
  
  // Build CSV content
  const csvRows = [
    // Header
    ['Dato', 'Start', 'Slut', 'Total', 'Minutter'],
    // Data rows
    ...exportEntries.map(entry => [
      entry.date,
      entry.start,
      entry.end,
      entry.total,
      entry.duration_minutes.toString()
    ]),
    // Summary row
    [],
    ['Total', '', '', summary.totalHoursFormatted, summary.totalMinutes.toString()],
    ['Gennemsnit per dag', '', '', '', summary.averagePerDay.toString()]
  ];
  
  const csvContent = csvRows.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  const filename = `rapport-${range.start.replace(/-/g, '')}-${range.end.replace(/-/g, '')}.csv`;
  
  if (Platform.OS === 'web') {
    // Web: Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } else {
    // Native: Write to file and share
    const { FileSystem } = await import('expo-file-system');
    const { Sharing } = await import('expo-sharing');
    
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Del CSV rapport'
        });
      }
    } catch (error) {
      console.error('Failed to export CSV:', error);
      throw new Error('Kunne ikke eksportere CSV');
    }
  }
}

// Export PDF functionality
export async function exportPdf(
  entries: DayEntry[], 
  range: ExportRange, 
  userPrefs: UserPrefs
): Promise<void> {
  const exportEntries = prepareEntriesForExport(entries);
  const summary = calculateSummary(exportEntries);
  
  // Build HTML report
  const htmlContent = `
<!DOCTYPE html>
<html lang="${userPrefs.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tidsregistrering Rapport</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0; 
      padding: 20px; 
      background: white;
      color: #111827;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px; 
      border-bottom: 2px solid #008d36;
      padding-bottom: 20px;
    }
    .logo { 
      font-size: 24px; 
      font-weight: bold; 
      color: #008d36; 
      margin-bottom: 10px;
    }
    .period { 
      font-size: 18px; 
      color: #6B7280; 
      margin-bottom: 20px;
    }
    .summary { 
      background: #F9FAFB; 
      padding: 20px; 
      border-radius: 8px; 
      margin-bottom: 30px;
      border: 1px solid #E5E7EB;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #008d36;
    }
    .summary-label {
      font-size: 14px;
      color: #6B7280;
      margin-top: 5px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px;
    }
    th, td { 
      padding: 12px; 
      text-align: left; 
      border-bottom: 1px solid #E5E7EB;
    }
    th { 
      background: #F3F4F6; 
      font-weight: 600;
      color: #374151;
    }
    .total-row {
      background: #F9FAFB;
      font-weight: 600;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Timestamp 3.0</div>
    <div class="period">Periode: ${dateHumanCph(range.start)} - ${dateHumanCph(range.end)}</div>
  </div>
  
  <div class="summary">
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-value">${summary.totalEntries}</div>
        <div class="summary-label">Registreringer</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.totalHoursFormatted}</div>
        <div class="summary-label">Total tid</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${summary.averagePerDay}</div>
        <div class="summary-label">Minutter/dag</div>
      </div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Dato</th>
        <th>Start</th>
        <th>Slut</th>
        <th>Total</th>
        <th>Minutter</th>
      </tr>
    </thead>
    <tbody>
      ${exportEntries.map(entry => `
        <tr>
          <td>${entry.date}</td>
          <td>${entry.start}</td>
          <td>${entry.end}</td>
          <td>${entry.total}</td>
          <td>${entry.duration_minutes}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="3"><strong>Total</strong></td>
        <td><strong>${summary.totalHoursFormatted}</strong></td>
        <td><strong>${summary.totalMinutes}</strong></td>
      </tr>
    </tbody>
  </table>
  
  <div style="margin-top: 30px; text-align: center; color: #6B7280; font-size: 12px;">
    Genereret den ${new Date().toLocaleDateString('da-DK')} kl. ${new Date().toLocaleTimeString('da-DK')}
  </div>
</body>
</html>`;

  if (Platform.OS === 'web') {
    // Web: Open new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        // Close window after printing (optional)
        // printWindow.close();
      };
    }
  } else {
    // Native: Use expo-print and expo-sharing
    const { Print } = await import('expo-print');
    const { Sharing } = await import('expo-sharing');
    
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Del PDF rapport'
        });
      }
    } catch (error) {
      console.error('Failed to export PDF:', error);
      throw new Error('Kunne ikke eksportere PDF');
    }
  }
}

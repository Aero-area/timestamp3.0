import type { TimeEntry, Settings, EntriesResponse } from "@/types";

// Mock API implementation for testing
// In production, these would be real API calls

const MOCK_DELAY = 500;

let mockRunning = false;
let mockStartedAt: string | null = null;
let mockEntries: TimeEntry[] = [
  {
    id: "1",
    started_at: "2025-01-13T09:00:00Z",
    ended_at: "2025-01-13T12:30:00Z",
    duration_minutes: 210,
    reason: "Working on project documentation",
  },
  {
    id: "2",
    started_at: "2025-01-13T14:00:00Z",
    ended_at: "2025-01-13T17:45:00Z",
    duration_minutes: 225,
    reason: "Client meeting and follow-up tasks",
  },
];

let mockSettings: Settings = {
  rollover_day_utc: 1,
  rounding_rule: "none",
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async startTimer() {
    await delay(MOCK_DELAY);
    
    if (mockRunning) {
      const error: any = new Error("You already have a running entry");
      error.code = "ENTRY_ALREADY_RUNNING";
      throw error;
    }
    
    mockRunning = true;
    mockStartedAt = new Date().toISOString();
    
    return {
      entry_id: Date.now().toString(),
      started_at: mockStartedAt,
    };
  },

  async stopTimer() {
    await delay(MOCK_DELAY);
    
    if (!mockRunning) {
      const error: any = new Error("No active entry to stop");
      error.code = "NO_ACTIVE_ENTRY";
      throw error;
    }
    
    const endedAt = new Date().toISOString();
    const duration = mockStartedAt 
      ? Math.floor((new Date(endedAt).getTime() - new Date(mockStartedAt).getTime()) / 60000)
      : 0;
    
    // Add to mock entries
    mockEntries.unshift({
      id: Date.now().toString(),
      started_at: mockStartedAt!,
      ended_at: endedAt,
      duration_minutes: duration,
      reason: "",
    });
    
    mockRunning = false;
    mockStartedAt = null;
    
    return {
      entry_id: Date.now().toString(),
      ended_at: endedAt,
      duration_minutes: duration,
    };
  },

  async getStatus() {
    await delay(MOCK_DELAY);
    
    return {
      running: mockRunning,
      started_at: mockStartedAt,
    };
  },

  async getEntries(params: { page: number; from?: string; to?: string }): Promise<EntriesResponse> {
    await delay(MOCK_DELAY);
    
    let filtered = [...mockEntries];
    
    if (params.from) {
      filtered = filtered.filter(e => e.started_at >= params.from!);
    }
    
    if (params.to) {
      filtered = filtered.filter(e => e.started_at <= params.to! + "T23:59:59Z");
    }
    
    const pageSize = 10;
    const start = (params.page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      entries: filtered.slice(start, end),
      page: params.page,
      total_pages: Math.ceil(filtered.length / pageSize),
      total_entries: filtered.length,
      total_minutes: filtered.reduce((sum, e) => sum + (e.duration_minutes || 0), 0),
    };
  },

  async updateEntry(id: string, data: { started_at: string; ended_at: string; reason: string }) {
    await delay(MOCK_DELAY);
    
    const entry = mockEntries.find(e => e.id === id);
    if (!entry) {
      throw new Error("Entry not found");
    }
    
    // Update entry
    entry.started_at = data.started_at;
    entry.ended_at = data.ended_at;
    entry.reason = data.reason;
    
    // Recalculate duration
    if (data.ended_at) {
      entry.duration_minutes = Math.floor(
        (new Date(data.ended_at).getTime() - new Date(data.started_at).getTime()) / 60000
      );
    }
    
    return entry;
  },

  async getSettings(): Promise<Settings> {
    await delay(MOCK_DELAY);
    return { ...mockSettings };
  },

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    await delay(MOCK_DELAY);
    mockSettings = { ...mockSettings, ...data };
    return { ...mockSettings };
  },

  async exportCSV(from: string, to: string): Promise<string> {
    await delay(MOCK_DELAY);
    
    // In a real app, this would return a download URL
    // For testing, we'll create a data URL
    const csvContent = `Date,Start Time,End Time,Duration (minutes),Reason
2025-01-13,09:00:00,12:30:00,210,Working on project documentation
2025-01-13,14:00:00,17:45:00,225,Client meeting and follow-up tasks`;
    
    const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
    return dataUrl;
  },

  async exportPDF(from: string, to: string): Promise<string> {
    await delay(MOCK_DELAY);
    
    // In a real app, this would return a download URL
    // For testing, we'll return a mock URL
    return `https://example.com/reports/timesheet_${from}_${to}.pdf`;
  },
};
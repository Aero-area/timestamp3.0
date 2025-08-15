export interface TimeEntry {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes?: number;
  reason?: string;
}

export interface DayEntry {
  user_id: string;
  date_utc: string; // YYYY-MM-DD format
  start_ts: string | null; // ISO timestamp UTC
  end_ts: string | null; // ISO timestamp UTC
  total_hhmm: string | null; // HH:MM format
}

export interface Settings {
  rollover_day_utc: number;
  rounding_rule: "none" | "5" | "10" | "15";
}

export interface EntriesResponse {
  entries: TimeEntry[];
  page: number;
  total_pages: number;
  total_entries: number;
  total_minutes: number;
}

export interface TimeStatus {
  running: boolean;
  started_at: string | null;
}
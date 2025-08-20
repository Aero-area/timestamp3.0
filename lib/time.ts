// lib/time.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';
dayjs.extend(utc); dayjs.extend(tz);

// ---- Timezone & basic helpers (Copenhagen-first, UTC in DB) ----
export const TZ = 'Europe/Copenhagen';
export const nowCph = () => dayjs().tz(TZ);
export const toCph = (d: string | number | Date) => dayjs(d).tz(TZ);
export const toUTCISO = (d: Date | string | number = new Date()) => dayjs(d).utc().toISOString();

// Day key stored in DB (Copenhagen calendar day)
export const dayKeyCph = (d: Date | string) => toCph(d).format('YYYY-MM-DD');

// NEW: Logical date calculation based on rollover hour
export const logicalDateCph = (d: Date | string, rolloverHour: number) => {
  const date = toCph(d);
  const hour = date.hour();
  
  // If current hour is before rollover hour, use previous day
  if (hour < rolloverHour) {
    return date.subtract(1, 'day').format('YYYY-MM-DD');
  }
  
  return date.format('YYYY-MM-DD');
};

// Display helpers (Copenhagen)
export const hhmmCph = (iso?: string | Date | null) => (iso ? toCph(iso).format('HH:mm') : '');
export const dateHumanCph = (d: Date | string) => toCph(d).format('MMM D, YYYY');

// Occasionally useful UTC formatters (for debugging/exports)
export const hhmmUTC = (d: Date | string) => dayjs(d).utc().format('HH:mm');
export const dateKeyUTC = (d: Date | string) => dayjs(d).utc().format('YYYY-MM-DD');

// Durations
export function durationHHMM(startIso: string, endIso: string) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const mins = Math.max(0, Math.round((end - start) / 60000));
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}
export function formatDurationHMS(seconds: number) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Today as a Copenhagen day key
export const getTodayCphKey = () => nowCph().format('YYYY-MM-DD');

function getPeriodForDate(base: dayjs.Dayjs, rolloverDay: number, rolloverHour: number) {
  const thisStart = base.date(rolloverDay).hour(rolloverHour).minute(0).second(0).millisecond(0);
  
  if (base.isAfter(thisStart)) {
    const end = thisStart.add(1, 'month');
    return { 
      startDateKey: thisStart.format('YYYY-MM-DD'), 
      endDateKey: end.format('YYYY-MM-DD') 
    };
  } else {
    const prev = thisStart.subtract(1, 'month');
    return { 
      startDateKey: prev.format('YYYY-MM-DD'), 
      endDateKey: thisStart.format('YYYY-MM-DD') 
    };
  }
}

// Current rollover window computed in Copenhagen; returns day-key strings [start, end)
// REQUIRES: rolloverDay and rolloverHour from settings context
export function currentPeriodCph(rolloverDay: number, rolloverHour: number) {
  if (rolloverDay < 1 || rolloverDay > 28) {
    throw new Error(`Invalid rollover day: ${rolloverDay}. Must be between 1 and 28.`);
  }

  if (rolloverHour < 0 || rolloverHour > 23) {
    throw new Error(`Invalid rollover hour: ${rolloverHour}. Must be between 0 and 23.`);
  }

  const base = dayjs().tz(TZ);
  return getPeriodForDate(base, rolloverDay, rolloverHour);
}

// Previous rollover window computed in Copenhagen; returns day-key strings [start, end)
export function previousPeriodCph(rolloverDay: number, rolloverHour: number) {
  const { startDateKey } = currentPeriodCph(rolloverDay, rolloverHour);
  const currentStart = toCph(startDateKey);
  const dateInPrevPeriod = currentStart.subtract(1, 'day');
  return getPeriodForDate(dateInPrevPeriod, rolloverDay, rolloverHour);
}

// Helper to check if a timestamp is in the current logical period
// REQUIRES: rolloverDay and rolloverHour from settings context
export const isInCurrentPeriod = (timestamp: string | Date, rolloverDay: number, rolloverHour: number) => {
  const { startDateKey, endDateKey } = currentPeriodCph(rolloverDay, rolloverHour);
  const logicalDate = logicalDateCph(timestamp, rolloverHour);
  return logicalDate >= startDateKey && logicalDate < endDateKey;
};

// Legacy function with defaults for backward compatibility (deprecated)
// @deprecated Use currentPeriodCph(rolloverDay, rolloverHour) instead
export function currentPeriodCphLegacy(rolloverDay: number = 1, rolloverHour: number = 0) {
  console.warn('currentPeriodCphLegacy is deprecated. Use currentPeriodCph(rolloverDay, rolloverHour) with explicit values from settings context.');
  return currentPeriodCph(rolloverDay, rolloverHour);
}

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

// Current rollover window computed in Copenhagen; returns day-key strings [start, end)
export function currentPeriodCph(rolloverDay: number) {
  const base = dayjs().tz(TZ);
  const thisStart = base.date(rolloverDay).startOf('day'); // CPH midnight of rolloverDay this month
  if (base.date() >= rolloverDay) {
    const end = thisStart.add(1, 'month');
    return { startDateKey: thisStart.format('YYYY-MM-DD'), endDateKey: end.format('YYYY-MM-DD') };
  } else {
    const prev = thisStart.subtract(1, 'month');
    return { startDateKey: prev.format('YYYY-MM-DD'), endDateKey: thisStart.format('YYYY-MM-DD') };
  }
}

import { durationHHMM } from './time';

describe('durationHHMM', () => {
  it('should return 00:00 for the same start and end time', () => {
    const start = '2025-01-01T10:00:00Z';
    const end = '2025-01-01T10:00:00Z';
    expect(durationHHMM(start, end)).toBe('00:00');
  });

  it('should calculate the duration correctly for a 30-minute interval', () => {
    const start = '2025-01-01T10:00:00Z';
    const end = '2025-01-01T10:30:00Z';
    expect(durationHHMM(start, end)).toBe('00:30');
  });

  it('should calculate the duration correctly for a 1-hour interval', () => {
    const start = '2025-01-01T10:00:00Z';
    const end = '2025-01-01T11:00:00Z';
    expect(durationHHMM(start, end)).toBe('01:00');
  });

  it('should calculate the duration correctly for a 2.5-hour interval', () => {
    const start = '2025-01-01T10:00:00Z';
    const end = '2025-01-01T12:30:00Z';
    expect(durationHHMM(start, end)).toBe('02:30');
  });

  it('should return 00:00 if the end time is before the start time', () => {
    const start = '2025-01-01T11:00:00Z';
    const end = '2025-01-01T10:00:00Z';
    expect(durationHHMM(start, end)).toBe('00:00');
  });
});

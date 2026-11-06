import { describe, it, expect } from 'vitest';
import { getJakartaParts, getTodayStatus, relativeDayLabel } from './today';
import type { Course } from './types';

describe('getJakartaParts', () => {
  it('maps weekday names including Minggu', () => {
    // 2026-11-08 is Sunday in Jakarta (UTC+7)
    const sunday = new Date('2026-11-08T03:00:00Z'); // 10:00 WIB
    const parts = getJakartaParts(sunday);
    expect(parts.day).toBe('Minggu');
  });

  it('handles boundary at midnight WIB', () => {
    // Use a date we know for sure: Nov 2 2026 is Monday
    // 2026-11-02 00:30 WIB = 2026-11-01 17:30 UTC
    const mondayMidnight = new Date('2026-11-01T17:30:00Z');
    const parts = getJakartaParts(mondayMidnight);
    expect(parts.day).toBe('Senin'); // Monday
    expect(parts.minutes).toBe(30); // 00:30
  });

  it('handles boundary before midnight WIB', () => {
    // 2026-11-02 23:30 WIB = 2026-11-02 16:30 UTC
    // Nov 2 2026 is Monday
    const mondayNight = new Date('2026-11-02T16:30:00Z');
    const parts = getJakartaParts(mondayNight);
    expect(parts.day).toBe('Senin'); // Still Monday
    expect(parts.minutes).toBe(23 * 60 + 30);
  });

  it('calculates minutes correctly', () => {
    // 2026-11-06 14:45 WIB = 07:45 UTC
    const afternoon = new Date('2026-11-06T07:45:00Z');
    const parts = getJakartaParts(afternoon);
    expect(parts.minutes).toBe(14 * 60 + 45);
  });

  it('formats dateLabel in Indonesian', () => {
    const date = new Date('2026-11-06T03:00:00Z'); // 10:00 WIB Nov 6
    const parts = getJakartaParts(date);
    expect(parts.dateLabel).toContain('November');
    expect(parts.dateLabel).toContain('2026');
  });
});

describe('getTodayStatus', () => {
  const courses: Course[] = [
    { id: 'c1', day: 'Senin', start: '08:00', end: '10:00', name: 'Math' },
    { id: 'c2', day: 'Senin', start: '10:00', end: '12:00', name: 'Physics' },
    { id: 'c3', day: 'Selasa', start: '08:00', end: '10:00', name: 'Chemistry' },
    { id: 'c4', day: 'Kamis', start: '14:00', end: '16:00', name: 'Biology' },
    { id: 'c5', day: 'Sabtu', start: '09:00', end: '11:00', name: 'English' },
  ];

  it('identifies current course when time is at start boundary', () => {
    // Monday 08:00 WIB exactly
    const mondayStart = new Date('2026-11-02T01:00:00Z'); // 08:00 WIB
    const status = getTodayStatus(courses, mondayStart);
    expect(status.currentId).toBe('c1');
  });

  it('does not mark as current when time equals end boundary', () => {
    // Monday 10:00 WIB exactly (c1 ends, c2 starts)
    const mondayEnd = new Date('2026-11-02T03:00:00Z');
    const status = getTodayStatus(courses, mondayEnd);
    expect(status.currentId).toBe('c2'); // c1 ended, c2 current
  });

  it('identifies next course', () => {
    // Monday 07:00 WIB (before first class)
    const beforeFirst = new Date('2026-11-02T00:00:00Z');
    const status = getTodayStatus(courses, beforeFirst);
    expect(status.currentId).toBeNull();
    expect(status.nextId).toBe('c1');
  });

  it('finds next course when between classes', () => {
    // Monday 09:00 WIB (during c1)
    const duringC1 = new Date('2026-11-02T02:00:00Z');
    const status = getTodayStatus(courses, duringC1);
    expect(status.currentId).toBe('c1');
    expect(status.nextId).toBe('c2'); // c2 starts after c1, so it's next
  });

  it('handles empty day', () => {
    // Sunday (no courses)
    const sunday = new Date('2026-11-08T03:00:00Z'); // 10:00 WIB Sunday
    const status = getTodayStatus(courses, sunday);
    expect(status.todayCourses).toHaveLength(0);
    expect(status.currentId).toBeNull();
    expect(status.nextId).toBeNull();
    expect(status.nextCrossDay).toEqual({ day: 'Senin', start: '08:00', course: courses[0] });
  });

  it('handles all courses finished for the day', () => {
    // Monday 18:00 WIB (after all Monday courses)
    const afterAll = new Date('2026-11-02T11:00:00Z');
    const status = getTodayStatus(courses, afterAll);
    expect(status.currentId).toBeNull();
    expect(status.nextId).toBeNull();
    expect(status.nextCrossDay).toEqual({ day: 'Selasa', start: '08:00', course: courses[2] });
  });

  it('jumps from Saturday to Monday when Sunday is empty', () => {
    // Saturday 18:00 WIB (after Saturday course)
    const saturdayEvening = new Date('2026-11-07T11:00:00Z');
    const status = getTodayStatus(courses, saturdayEvening);
    expect(status.nextCrossDay).toEqual({ day: 'Senin', start: '08:00', course: courses[0] });
  });

  it('sorts today courses by time', () => {
    const unsorted: Course[] = [
      { id: 'c2', day: 'Senin', start: '10:00', end: '12:00', name: 'Physics' },
      { id: 'c1', day: 'Senin', start: '08:00', end: '10:00', name: 'Math' },
    ];
    const monday = new Date('2026-11-02T00:00:00Z'); // 07:00 WIB
    const status = getTodayStatus(unsorted, monday);
    expect(status.todayCourses[0].id).toBe('c1');
    expect(status.todayCourses[1].id).toBe('c2');
  });

  it('handles Thursday afternoon correctly', () => {
    // Thursday 15:00 WIB (during c4)
    const thursday = new Date('2026-11-05T08:00:00Z');
    const status = getTodayStatus(courses, thursday);
    expect(status.currentId).toBe('c4');
  });

  it('finds next cross-day when today has no courses', () => {
    // Wednesday (no courses scheduled)
    const wednesday = new Date('2026-11-04T03:00:00Z'); // 10:00 WIB
    const status = getTodayStatus(courses, wednesday);
    expect(status.todayCourses).toHaveLength(0);
    expect(status.nextCrossDay).toEqual({ day: 'Kamis', start: '14:00', course: courses[3] });
  });
});

describe('relativeDayLabel', () => {
  it('returns "Besok" for exactly one day ahead', () => {
    expect(relativeDayLabel('Jumat', 'Sabtu')).toBe('Besok');
  });

  it('returns "Besok" for Saturday to Sunday', () => {
    expect(relativeDayLabel('Sabtu', 'Minggu')).toBe('Besok');
  });

  it('returns "Besok" for Sunday to Monday (wraps week)', () => {
    expect(relativeDayLabel('Minggu', 'Senin')).toBe('Besok');
  });

  it('does NOT return "Besok" for Saturday to Monday (2 days)', () => {
    expect(relativeDayLabel('Sabtu', 'Senin')).toBe('Senin');
  });

  it('returns day name for same day', () => {
    expect(relativeDayLabel('Senin', 'Senin')).toBe('Senin');
  });

  it('returns day name for multiple days ahead', () => {
    expect(relativeDayLabel('Senin', 'Rabu')).toBe('Rabu');
  });
});

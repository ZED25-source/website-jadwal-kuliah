import type { Day } from './types';

const WIB_DAY_MAP: Record<string, Day> = {
  Monday: 'Senin',
  Tuesday: 'Selasa',
  Wednesday: 'Rabu',
  Thursday: 'Kamis',
  Friday: 'Jumat',
  Saturday: 'Sabtu',
  Sunday: 'Minggu',
};

export function todayWib(now: Date = new Date()): Day {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
  }).format(now);
  return WIB_DAY_MAP[weekday];
}

export function formatTime(time: string): string {
  return time.replace(':', '.');
}

import type { Task } from './types';

export type DayMark = 'none' | 'open' | 'done';

export interface MonthCell {
  dateKey: string;
  day: number;
}

/**
 * Build a 6×7 grid for a given month (1-12).
 * Week starts on Sunday. Empty cells are null.
 */
export function buildMonthGrid(year: number, month: number): (MonthCell | null)[][] {
  // First day of the month
  const firstDate = new Date(Date.UTC(year, month - 1, 1));
  const firstDayOfWeek = firstDate.getUTCDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  // Sunday-based index: Sunday=0, Monday=1, ..., Saturday=6
  const sundayIndex = firstDayOfWeek;
  
  // Days in this month
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  
  const grid: (MonthCell | null)[][] = [];
  let currentDay = 1;
  
  for (let row = 0; row < 6; row++) {
    const week: (MonthCell | null)[] = [];
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      
      if (cellIndex < sundayIndex || currentDay > daysInMonth) {
        // Empty cell
        week.push(null);
      } else {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
        week.push({ dateKey, day: currentDay });
        currentDay++;
      }
    }
    grid.push(week);
  }
  
  return grid;
}

/**
 * Shift a month by delta months (can be negative).
 * Returns [newYear, newMonth].
 */
export function shiftMonth(year: number, month: number, delta: number): [number, number] {
  // Convert to zero-based month
  let m = month - 1 + delta;
  let y = year;
  
  // Handle year overflow/underflow
  while (m < 0) {
    m += 12;
    y -= 1;
  }
  while (m >= 12) {
    m -= 12;
    y += 1;
  }
  
  return [y, m + 1];
}

/**
 * Shift a dateKey (YYYY-MM-DD) by a number of days.
 */
export function shiftDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  
  const newYear = date.getUTCFullYear();
  const newMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const newDay = String(date.getUTCDate()).padStart(2, '0');
  
  return `${newYear}-${newMonth}-${newDay}`;
}

/**
 * Group tasks by their due date.
 * Only tasks with a due date are included.
 */
export function tasksByDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  
  for (const task of tasks) {
    if (task.due) {
      const existing = map.get(task.due) ?? [];
      map.set(task.due, [...existing, task]);
    }
  }
  
  return map;
}

/**
 * Determine the mark for a day based on its tasks.
 * - 'none': no tasks
 * - 'open': has at least one incomplete task
 * - 'done': has tasks but all are complete
 */
export function getDayMark(tasksOnDay: Task[]): DayMark {
  if (tasksOnDay.length === 0) return 'none';
  
  const hasOpen = tasksOnDay.some((t) => !t.done);
  return hasOpen ? 'open' : 'done';
}

/**
 * Format a month label in Indonesian (e.g., "November 2026").
 */
export function formatMonthLabel(year: number, month: number): string {
  // Use UTC to avoid local timezone issues
  const date = new Date(Date.UTC(year, month - 1, 1));
  const formatter = new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  });
  return formatter.format(date);
}

/**
 * Format a dateKey (YYYY-MM-DD) as a full date in Indonesian (e.g., "9 November 2026").
 */
export function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
  return formatter.format(date);
}

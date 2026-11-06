import { describe, it, expect } from 'vitest';
import {
  buildMonthGrid,
  shiftMonth,
  shiftDateKey,
  tasksByDate,
  getDayMark,
  formatMonthLabel,
  formatDateLabel,
  type MonthCell
} from './calendar';
import type { Task } from './types';

describe('buildMonthGrid', () => {
  it('builds November 2026 correctly (starts on Sunday)', () => {
    const grid = buildMonthGrid(2026, 11);
    
    expect(grid).toHaveLength(6);
    expect(grid[0]).toHaveLength(7);
    
    // November 1, 2026 is a Sunday, should be in column 0 (first column, Sunday-first)
    expect(grid[0][0]).toEqual({ dateKey: '2026-11-01', day: 1 });
    
    // No empty cells in first row (Nov 1-7 fill Sunday-Saturday)
    for (let i = 0; i < 7; i++) {
      expect(grid[0][i]).not.toBeNull();
    }
    
    // November 2 (Monday) should be in row 0, column 1
    expect(grid[0][1]).toEqual({ dateKey: '2026-11-02', day: 2 });
    
    // November has 30 days
    // Last day November 30 (Monday) should be in row 4, column 1
    expect(grid[4][1]).toEqual({ dateKey: '2026-11-30', day: 30 });
    
    // Last cell overall should be November 30
    const lastCell = grid.flat().filter((c): c is MonthCell => c !== null).pop();
    expect(lastCell).toEqual({ dateKey: '2026-11-30', day: 30 });
  });
  
  it('builds February 2024 (leap year) correctly', () => {
    const grid = buildMonthGrid(2024, 2);
    
    // February 2024 has 29 days (leap year)
    const cells = grid.flat().filter((c): c is MonthCell => c !== null);
    expect(cells).toHaveLength(29);
    
    const lastCell = cells[cells.length - 1];
    expect(lastCell).toEqual({ dateKey: '2024-02-29', day: 29 });
  });
  
  it('builds February 2025 (non-leap year) correctly', () => {
    const grid = buildMonthGrid(2025, 2);
    
    // February 2025 has 28 days (non-leap year)
    const cells = grid.flat().filter((c): c is MonthCell => c !== null);
    expect(cells).toHaveLength(28);
    
    const lastCell = cells[cells.length - 1];
    expect(lastCell).toEqual({ dateKey: '2025-02-28', day: 28 });
  });
  
  it('builds a month that needs exactly 6 rows', () => {
    // May 2026: starts on Friday, has 31 days
    // Needs 6 rows
    const grid = buildMonthGrid(2026, 5);
    
    expect(grid).toHaveLength(6);
    
    const cells = grid.flat().filter((c): c is MonthCell => c !== null);
    expect(cells).toHaveLength(31);
  });
  
  it('builds a month that ends exactly at the end of a row', () => {
    // February 2021: starts on Monday, has 28 days
    // Ends exactly at end of row 3 (Sunday)
    const grid = buildMonthGrid(2021, 2);
    
    expect(grid).toHaveLength(6);
    
    // First day (Monday) should be in column 1 (column 0 is Sunday, empty)
    expect(grid[0][0]).toBeNull();
    expect(grid[0][1]).toEqual({ dateKey: '2021-02-01', day: 1 });
    
    // Last day (28, Sunday) should be in row 4, column 0
    expect(grid[4][0]).toEqual({ dateKey: '2021-02-28', day: 28 });
    
    // Row 4: col 0 is Feb 28, cols 1-6 null. Row 5: all null.
    for (let col = 1; col < 7; col++) {
      expect(grid[4][col]).toBeNull();
    }
    for (let col = 0; col < 7; col++) {
      expect(grid[5][col]).toBeNull();
    }
  });
});

describe('shiftMonth', () => {
  it('shifts forward by one month', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual([2026, 12]);
  });
  
  it('shifts backward by one month', () => {
    expect(shiftMonth(2026, 11, -1)).toEqual([2026, 10]);
  });
  
  it('shifts from December to January (year boundary)', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual([2027, 1]);
  });
  
  it('shifts from January to December (year boundary)', () => {
    expect(shiftMonth(2027, 1, -1)).toEqual([2026, 12]);
  });
  
  it('shifts forward multiple years', () => {
    expect(shiftMonth(2026, 11, 14)).toEqual([2028, 1]);
  });
  
  it('shifts backward multiple years', () => {
    expect(shiftMonth(2027, 1, -13)).toEqual([2025, 12]);
  });
});

describe('shiftDateKey', () => {
  it('shifts forward by one day', () => {
    expect(shiftDateKey('2026-11-09', 1)).toBe('2026-11-10');
  });
  
  it('shifts backward by one day', () => {
    expect(shiftDateKey('2026-11-09', -1)).toBe('2026-11-08');
  });
  
  it('shifts across month boundary', () => {
    expect(shiftDateKey('2026-11-30', 1)).toBe('2026-12-01');
    expect(shiftDateKey('2026-12-01', -1)).toBe('2026-11-30');
  });
  
  it('shifts across year boundary', () => {
    expect(shiftDateKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(shiftDateKey('2027-01-01', -1)).toBe('2026-12-31');
  });
  
  it('shifts by 7 days', () => {
    expect(shiftDateKey('2026-11-09', 7)).toBe('2026-11-16');
    expect(shiftDateKey('2026-11-09', -7)).toBe('2026-11-02');
  });
  
  it('handles leap year February correctly', () => {
    expect(shiftDateKey('2024-02-28', 1)).toBe('2024-02-29');
    expect(shiftDateKey('2024-02-29', 1)).toBe('2024-03-01');
  });
  
  it('handles non-leap year February correctly', () => {
    expect(shiftDateKey('2025-02-28', 1)).toBe('2025-03-01');
  });
});

describe('tasksByDate', () => {
  it('groups tasks by due date', () => {
    const tasks: Task[] = [
      { id: '1', courseId: 'c1', title: 'Task 1', due: '2026-11-09', done: false, createdAt: '2026-11-01T10:00:00Z' },
      { id: '2', courseId: 'c1', title: 'Task 2', due: '2026-11-09', done: true, createdAt: '2026-11-01T11:00:00Z' },
      { id: '3', courseId: 'c2', title: 'Task 3', due: '2026-11-10', done: false, createdAt: '2026-11-01T12:00:00Z' },
    ];
    
    const map = tasksByDate(tasks);
    
    expect(map.size).toBe(2);
    expect(map.get('2026-11-09')).toHaveLength(2);
    expect(map.get('2026-11-09')?.[0].id).toBe('1');
    expect(map.get('2026-11-09')?.[1].id).toBe('2');
    expect(map.get('2026-11-10')).toHaveLength(1);
    expect(map.get('2026-11-10')?.[0].id).toBe('3');
  });
  
  it('ignores tasks without due dates', () => {
    const tasks: Task[] = [
      { id: '1', courseId: 'c1', title: 'Task 1', due: '2026-11-09', done: false, createdAt: '2026-11-01T10:00:00Z' },
      { id: '2', courseId: 'c1', title: 'Task 2', done: false, createdAt: '2026-11-01T11:00:00Z' },
      { id: '3', courseId: 'c2', title: 'Task 3', due: undefined, done: false, createdAt: '2026-11-01T12:00:00Z' },
    ];
    
    const map = tasksByDate(tasks);
    
    expect(map.size).toBe(1);
    expect(map.get('2026-11-09')).toHaveLength(1);
  });
  
  it('returns empty map for empty tasks', () => {
    const map = tasksByDate([]);
    expect(map.size).toBe(0);
  });
  
  it('does not mutate input tasks array', () => {
    const tasks: Task[] = [
      { id: '1', courseId: 'c1', title: 'Task 1', due: '2026-11-09', done: false, createdAt: '2026-11-01T10:00:00Z' },
    ];
    
    const original = [...tasks];
    tasksByDate(tasks);
    
    expect(tasks).toEqual(original);
  });
});

describe('getDayMark', () => {
  it('returns "none" for empty task list', () => {
    expect(getDayMark([])).toBe('none');
  });
  
  it('returns "open" when at least one task is not done', () => {
    const tasks: Task[] = [
      { id: '1', courseId: 'c1', title: 'Task 1', done: false, createdAt: '2026-11-01T10:00:00Z' },
      { id: '2', courseId: 'c1', title: 'Task 2', done: true, createdAt: '2026-11-01T11:00:00Z' },
    ];
    
    expect(getDayMark(tasks)).toBe('open');
  });
  
  it('returns "open" when all tasks are not done', () => {
    const tasks: Task[] = [
      { id: '1', courseId: 'c1', title: 'Task 1', done: false, createdAt: '2026-11-01T10:00:00Z' },
      { id: '2', courseId: 'c1', title: 'Task 2', done: false, createdAt: '2026-11-01T11:00:00Z' },
    ];
    
    expect(getDayMark(tasks)).toBe('open');
  });
  
  it('returns "done" when all tasks are complete', () => {
    const tasks: Task[] = [
      { id: '1', courseId: 'c1', title: 'Task 1', done: true, createdAt: '2026-11-01T10:00:00Z' },
      { id: '2', courseId: 'c1', title: 'Task 2', done: true, createdAt: '2026-11-01T11:00:00Z' },
    ];
    
    expect(getDayMark(tasks)).toBe('done');
  });
  
  it('returns "done" when single task is complete', () => {
    const tasks: Task[] = [
      { id: '1', courseId: 'c1', title: 'Task 1', done: true, createdAt: '2026-11-01T10:00:00Z' },
    ];
    
    expect(getDayMark(tasks)).toBe('done');
  });
});

describe('formatMonthLabel', () => {
  it('formats November 2026 in Indonesian', () => {
    expect(formatMonthLabel(2026, 11)).toBe('November 2026');
  });
  
  it('formats January 2027 in Indonesian', () => {
    expect(formatMonthLabel(2027, 1)).toBe('Januari 2027');
  });
  
  it('formats December 2026 in Indonesian', () => {
    expect(formatMonthLabel(2026, 12)).toBe('Desember 2026');
  });
});

describe('formatDateLabel', () => {
  it('formats a date in Indonesian', () => {
    expect(formatDateLabel('2026-11-09')).toBe('9 November 2026');
  });
  
  it('formats first day of month', () => {
    expect(formatDateLabel('2026-11-01')).toBe('1 November 2026');
  });
  
  it('formats last day of month', () => {
    expect(formatDateLabel('2026-11-30')).toBe('30 November 2026');
  });
  
  it('formats a date in different month', () => {
    expect(formatDateLabel('2027-01-15')).toBe('15 Januari 2027');
  });
});

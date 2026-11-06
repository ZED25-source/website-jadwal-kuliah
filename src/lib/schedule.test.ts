import { describe, it, expect } from 'vitest';
import { toMinutes, sortCourses, groupByDay, totalSks, findConflicts } from './schedule';
import { DEFAULT_COURSES } from './defaults';
import type { Course } from './types';

describe('toMinutes', () => {
  it('mengubah HH:mm menjadi menit sejak tengah malam', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('07:30')).toBe(450);
    expect(toMinutes('12:30')).toBe(750);
    expect(toMinutes('23:59')).toBe(1439);
  });
});

describe('sortCourses', () => {
  it('mengurutkan menurut hari lalu jam mulai', () => {
    const input: Course[] = [
      { id: 'b', day: 'Rabu', start: '15:30', end: '17:10', name: 'B' },
      { id: 'a', day: 'Senin', start: '07:30', end: '09:10', name: 'A' },
      { id: 'c', day: 'Selasa', start: '07:30', end: '09:10', name: 'C' },
    ];
    const result = sortCourses(input);
    expect(result.map((c) => c.id)).toEqual(['a', 'c', 'b']);
  });

  it('tidak mengubah array input', () => {
    const input: Course[] = [
      { id: 'b', day: 'Rabu', start: '15:30', end: '17:10', name: 'B' },
      { id: 'a', day: 'Senin', start: '07:30', end: '09:10', name: 'A' },
    ];
    const before = [...input];
    sortCourses(input);
    expect(input).toEqual(before);
  });
});

describe('groupByDay', () => {
  it('hanya berisi hari yang punya mata kuliah', () => {
    const input: Course[] = [
      { id: 'a', day: 'Senin', start: '07:30', end: '09:10', name: 'A' },
      { id: 'b', day: 'Rabu', start: '10:00', end: '12:30', name: 'B' },
    ];
    const result = groupByDay(input);
    expect(result.map((g) => g.day)).toEqual(['Senin', 'Rabu']);
    expect(result.length).toBe(2);
  });

  it('tiap kelompok urut jam', () => {
    const input: Course[] = [
      { id: 'b', day: 'Selasa', start: '10:50', end: '12:30', name: 'B' },
      { id: 'a', day: 'Selasa', start: '07:30', end: '09:10', name: 'A' },
    ];
    const result = groupByDay(input);
    expect(result[0].courses.map((c) => c.id)).toEqual(['a', 'b']);
  });
});

describe('totalSks', () => {
  it('data default = 20', () => {
    expect(totalSks(DEFAULT_COURSES)).toBe(20);
  });

  it('SKS kosong dihitung 0', () => {
    const input: Course[] = [
      { id: 'a', day: 'Senin', start: '07:30', end: '09:10', name: 'A' },
      { id: 'b', day: 'Selasa', start: '07:30', end: '09:10', name: 'B', sks: 3 },
    ];
    expect(totalSks(input)).toBe(3);
  });
});

describe('findConflicts', () => {
  const candidate: Course = {
    id: 'cand',
    day: 'Senin',
    start: '08:00',
    end: '10:00',
    name: 'Candidate',
  };

  it('deteksi tumpang tindih pada hari yang sama', () => {
    const courses: Course[] = [
      { id: 'x', day: 'Senin', start: '09:00', end: '11:00', name: 'X' },
    ];
    expect(findConflicts(candidate, courses).map((c) => c.id)).toEqual(['x']);
  });

  it('jam selesai = jam mulai berikutnya BUKAN bentrok', () => {
    const courses: Course[] = [
      { id: 'x', day: 'Senin', start: '10:00', end: '12:00', name: 'X' },
    ];
    expect(findConflicts(candidate, courses)).toEqual([]);
  });

  it('hari berbeda bukan bentrok', () => {
    const courses: Course[] = [
      { id: 'x', day: 'Selasa', start: '08:00', end: '10:00', name: 'X' },
    ];
    expect(findConflicts(candidate, courses)).toEqual([]);
  });

  it('id yang sama diabaikan', () => {
    const courses: Course[] = [
      { id: 'cand', day: 'Senin', start: '08:00', end: '10:00', name: 'Candidate' },
    ];
    expect(findConflicts(candidate, courses)).toEqual([]);
  });
});

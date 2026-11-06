import { describe, it, expect, beforeEach } from 'vitest';
import {
  addCourse,
  updateCourse,
  deleteCourse,
  countTasksOf,
  updateMeta,
  resetState,
} from './actions';
import { createDefaultState } from './defaults';
import { loadState, saveState } from './storage';
import { groupByDay } from './schedule';
import type { AppState } from './types';

const baseState: AppState = createDefaultState();

describe('addCourse', () => {
  it('tidak mengubah state input (immutable)', () => {
    const before = JSON.parse(JSON.stringify(baseState));
    const result = addCourse(baseState, {
      day: 'Selasa',
      start: '13:00',
      end: '14:00',
      name: 'Baru',
    });
    expect(result).not.toBe(baseState);
    expect(baseState).toEqual(before);
    expect(result.courses).toHaveLength(baseState.courses.length + 1);
  });

  it('menambahkan course dengan id yang diberikan', () => {
    const result = addCourse(
      baseState,
      { day: 'Rabu', start: '10:00', end: '11:00', name: 'Baru' },
      'custom-id'
    );
    const c = result.courses.find((x) => x.id === 'custom-id');
    expect(c).toBeDefined();
    expect(c!.name).toBe('Baru');
  });

  it('course baru muncul di groupByDay pada hari yang benar', () => {
    const result = addCourse(baseState, {
      day: 'Jumat',
      start: '08:00',
      end: '09:00',
      name: 'Jumat Baru',
    });
    const groups = groupByDay(result.courses);
    const jumat = groups.find((g) => g.day === 'Jumat');
    expect(jumat).toBeDefined();
    expect(jumat!.courses.some((c) => c.name === 'Jumat Baru')).toBe(true);
  });
});

describe('updateCourse', () => {
  it('mengupdate course yang ditemukan', () => {
    const result = updateCourse(baseState, 'inf625107', {
      day: 'Senin',
      start: '07:30',
      end: '09:10',
      name: 'Diubah Nama',
      sks: 3,
    });
    const c = result.courses.find((x) => x.id === 'inf625107');
    expect(c).toBeDefined();
    expect(c!.name).toBe('Diubah Nama');
    expect(c!.sks).toBe(3);
    expect(c!.day).toBe('Senin');
  });

  it('id tidak ditemukan mengembalikan state tak berubah', () => {
    const result = updateCourse(baseState, 'tidak-ada', {
      day: 'Senin',
      start: '07:30',
      end: '09:10',
      name: 'X',
    });
    expect(result).toBe(baseState);
  });

  it('tidak mengubah state input', () => {
    const before = baseState.courses.find((c) => c.id === 'inf625107')!.name;
    updateCourse(baseState, 'inf625107', {
      day: 'Senin',
      start: '07:30',
      end: '09:10',
      name: 'Diubah',
    });
    expect(baseState.courses.find((c) => c.id === 'inf625107')!.name).toBe(before);
  });
});

describe('deleteCourse', () => {
  it('menghapus course dan semua task miliknya', () => {
    const stateWithTasks: AppState = {
      ...baseState,
      tasks: [
        { id: 't1', courseId: 'inf625107', title: 'Tugas 1', done: false, createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'inf625107', title: 'Tugas 2', done: false, createdAt: '2026-01-02T00:00:00Z' },
        { id: 't3', courseId: 'uni625109', title: 'Tugas Lain', done: false, createdAt: '2026-01-03T00:00:00Z' },
      ],
    };
    const result = deleteCourse(stateWithTasks, 'inf625107');
    expect(result.courses.some((c) => c.id === 'inf625107')).toBe(false);
    expect(result.tasks.some((t) => t.courseId === 'inf625107')).toBe(false);
    expect(result.tasks.some((t) => t.id === 't3')).toBe(true);
  });

  it('tidak meninggalkan task yatim', () => {
    const stateWithTasks: AppState = {
      ...baseState,
      tasks: [
        { id: 't1', courseId: 'inf625107', title: 'Tugas 1', done: false, createdAt: '2026-01-01T00:00:00Z' },
      ],
    };
    const result = deleteCourse(stateWithTasks, 'inf625107');
    expect(result.tasks).toHaveLength(0);
  });

  it('tidak menghapus task course lain', () => {
    const stateWithTasks: AppState = {
      ...baseState,
      tasks: [
        { id: 't1', courseId: 'inf625107', title: 'Tugas 1', done: false, createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'uni625109', title: 'Tugas 2', done: false, createdAt: '2026-01-02T00:00:00Z' },
      ],
    };
    const result = deleteCourse(stateWithTasks, 'inf625107');
    expect(result.tasks.some((t) => t.id === 't2')).toBe(true);
  });
});

describe('countTasksOf', () => {
  it('menghitung task milik course', () => {
    const stateWithTasks: AppState = {
      ...baseState,
      tasks: [
        { id: 't1', courseId: 'inf625107', title: 'Tugas 1', done: false, createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'inf625107', title: 'Tugas 2', done: false, createdAt: '2026-01-02T00:00:00Z' },
        { id: 't3', courseId: 'uni625109', title: 'Tugas Lain', done: false, createdAt: '2026-01-03T00:00:00Z' },
      ],
    };
    expect(countTasksOf(stateWithTasks, 'inf625107')).toBe(2);
    expect(countTasksOf(stateWithTasks, 'uni625109')).toBe(1);
    expect(countTasksOf(stateWithTasks, 'tidak-ada')).toBe(0);
  });
});

describe('updateMeta', () => {
  it('mengganti meta', () => {
    const result = updateMeta(baseState, {
      title: 'Baru',
      program: 'X',
      semester: 'Genap',
    });
    expect(result.meta).toEqual({ title: 'Baru', program: 'X', semester: 'Genap' });
  });

  it('tidak mengubah state input', () => {
    const beforeTitle = baseState.meta.title;
    updateMeta(baseState, { title: 'Baru', program: 'X', semester: 'Genap' });
    expect(baseState.meta.title).toBe(beforeTitle);
  });
});

describe('resetState', () => {
  it('mengembalikan 10 course dan tasks kosong', () => {
    const result = resetState();
    expect(result.courses).toHaveLength(10);
    expect(result.tasks).toHaveLength(0);
    expect(result.seeded).toBe(true);
  });
});

describe('hapus semua course lalu saveState dan loadState tetap kosong', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seed tidak diulang setelah semua course dihapus', () => {
    const emptyState = resetState();
    emptyState.courses = [];
    emptyState.tasks = [];
    saveState(emptyState);

    const loaded = loadState();
    expect(loaded.state.courses).toHaveLength(0);
    expect(loaded.state.tasks).toHaveLength(0);
    expect(loaded.state.seeded).toBe(true);
  });
});

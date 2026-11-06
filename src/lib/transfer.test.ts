import { describe, it, expect } from 'vitest';
import { exportState, parseImport } from './transfer';
import { createDefaultState } from './defaults';
import type { AppState } from './types';

const baseState: AppState = createDefaultState();

describe('exportState', () => {
  it('mengembalikan JSON string yang valid dari state', () => {
    const json = exportState(baseState);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(baseState);
  });

  it('JSON string diformat dengan indentasi 2 spasi', () => {
    const json = exportState(baseState);
    expect(json).toContain('\n  ');
  });
});

describe('parseImport', () => {
  it('teks lebih dari 1.000.000 karakter ditolak', () => {
    const longText = 'a'.repeat(1_000_001);
    const result = parseImport(longText);
    if (!result.ok) {
      expect(result.error).toBe('File terlalu besar.');
    } else {
      throw new Error('harusnya gagal');
    }
  });

  it('teks 1.000.000 karakter diterima', () => {
    const result = parseImport('a'.repeat(1_000_000));
    // 'a' is not valid JSON, so should be "File bukan JSON yang valid."
    if (!result.ok) {
      expect(result.error).toBe('File bukan JSON yang valid.');
    }
  });

  it('JSON tidak valid ditolak', () => {
    const result = parseImport('{ not valid json');
    if (!result.ok) {
      expect(result.error).toBe('File bukan JSON yang valid.');
    } else {
      throw new Error('harusnya gagal');
    }
  });

  it('string bukan JSON ditolak', () => {
    const result = parseImport('halo');
    if (!result.ok) {
      expect(result.error).toBe('File bukan JSON yang valid.');
    } else {
      throw new Error('harusnya gagal');
    }
  });

  it('array JSON ditolak karena bukan objek state', () => {
    const result = parseImport(JSON.stringify([1, 2, 3]));
    if (!result.ok) {
      expect(result.error).toBe('Format data tidak dikenali.');
    } else {
      throw new Error('harusnya gagal');
    }
  });

  it('schemaVersion lebih besar ditolak', () => {
    const futureState = { ...baseState, schemaVersion: 999 };
    const result = parseImport(JSON.stringify(futureState));
    if (!result.ok) {
      expect(result.error).toBe('File berasal dari versi aplikasi yang lebih baru.');
    } else {
      throw new Error('harusnya gagal');
    }
  });

  it('schemaVersion sama diterima', () => {
    const result = parseImport(JSON.stringify(baseState));
    if (result.ok) {
      expect(result.state).toEqual(baseState);
      expect(result.state.seeded).toBe(true);
      expect(result.courseCount).toBe(baseState.courses.length);
      expect(result.taskCount).toBe(baseState.tasks.length);
      expect(result.droppedCourses).toBe(0);
      expect(result.droppedTasks).toBe(0);
    } else {
      throw new Error(`harusnya berhasil: ${result.error}`);
    }
  });

  it('course yonim dan task yonim dibuang dan dihitung', () => {
    const corrupted: AppState = {
      ...baseState,
      courses: [
        ...baseState.courses,
        { id: '', day: 'Senin', start: '07:30', end: '09:10', name: '' },
      ],
      tasks: [
        ...baseState.tasks,
        { id: 't-orphan', courseId: 'tidak-ada', title: 'Orphan', done: false, createdAt: '2026-01-01T00:00:00Z' },
      ],
    };
    const result = parseImport(JSON.stringify(corrupted));
    if (result.ok) {
      expect(result.state.courses).toHaveLength(baseState.courses.length);
      expect(result.state.tasks).toHaveLength(baseState.tasks.length);
      expect(result.droppedCourses).toBe(1);
      expect(result.droppedTasks).toBe(1);
      expect(result.state.seeded).toBe(true);
    } else {
      throw new Error(`harusnya berhasil: ${result.error}`);
    }
  });

  it('courses kosong tetap diterima', () => {
    const emptyCourses: AppState = { ...baseState, courses: [] };
    const result = parseImport(JSON.stringify(emptyCourses));
    if (result.ok) {
      expect(result.state.courses).toHaveLength(0);
      expect(result.droppedCourses).toBe(0);
    } else {
      throw new Error(`harusnya berhasil: ${result.error}`);
    }
  });

  it('tidak melempar untuk input sembarang', () => {
    expect(() => parseImport(null as unknown as string)).not.toThrow();
    expect(() => parseImport(undefined as unknown as string)).not.toThrow();
    expect(() => parseImport(42 as unknown as string)).not.toThrow();
  });
});

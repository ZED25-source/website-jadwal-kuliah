import { describe, it, expect } from 'vitest';
import { DEFAULT_COURSES, createDefaultState } from './defaults';

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

describe('defaults', () => {
  it('memiliki 10 mata kuliah', () => {
    expect(DEFAULT_COURSES).toHaveLength(10);
  });

  it('semua start/end berformat HH:mm dan end > start', () => {
    for (const c of DEFAULT_COURSES) {
      expect(c.start).toMatch(/^\d{2}:\d{2}$/);
      expect(c.end).toMatch(/^\d{2}:\d{2}$/);
      expect(toMinutes(c.end)).toBeGreaterThan(toMinutes(c.start));
    }
  });

  it('semua id unik', () => {
    const ids = DEFAULT_COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('"Algoritma Pemrograman B": Rabu 10:00–12:30, 3 SKS', () => {
    const c = DEFAULT_COURSES.find((x) => x.name === 'Algoritma Pemrograman B');
    expect(c).toBeDefined();
    expect(c!.day).toBe('Rabu');
    expect(c!.start).toBe('10:00');
    expect(c!.end).toBe('12:30');
    expect(c!.sks).toBe(3);
  });

  it('"Praktikum Teknik Digital B" tidak punya pd1', () => {
    const c = DEFAULT_COURSES.find((x) => x.name === 'Praktikum Teknik Digital B');
    expect(c).toBeDefined();
    expect(c!.pd1).toBeUndefined();
  });
});

describe('createDefaultState', () => {
  it('mengembalikan objek berbeda setiap dipanggil', () => {
    const a = createDefaultState();
    const b = createDefaultState();
    expect(a).not.toBe(b);
  });

  it('mengubah satu tidak memengaruhi yang lain (courses)', () => {
    const a = createDefaultState();
    const b = createDefaultState();
    a.courses.pop();
    expect(b.courses).toHaveLength(10);
  });

  it('mengubah satu tidak memengaruhi yang lain (meta)', () => {
    const a = createDefaultState();
    const b = createDefaultState();
    a.meta.title = 'Diubah';
    expect(b.meta.title).toBe('JADWAL KULIAH TEKNIK INFORMATIKA');
  });

  it('mengubah satu tidak memengaruhi yang lain (tasks)', () => {
    const a = createDefaultState();
    const b = createDefaultState();
    a.tasks.push({ id: 't1', courseId: 'x', title: 'Tugas', done: false, createdAt: '2026-01-01T00:00:00Z' });
    expect(b.tasks).toHaveLength(0);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState, validateState, STORAGE_KEY } from './storage';
import { createDefaultState } from './defaults';
import { SCHEMA_VERSION } from './types';

beforeEach(() => {
  localStorage.clear();
});

describe('validateState', () => {
  it('mengembalikan null untuk input yang bukan objek', () => {
    expect(validateState(null)).toBeNull();
    expect(validateState('string')).toBeNull();
    expect(validateState(42)).toBeNull();
    expect(validateState(undefined)).toBeNull();
  });

  it('validateState tidak melempar untuk array', () => {
    expect(validateState([1, 2, 3])).toBeNull();
  });

  it('mengembalikan null bila schemaVersion bukan angka', () => {
    expect(
      validateState({
        schemaVersion: '1',
        seeded: true,
        meta: { title: 't', program: 'p', semester: 's' },
        courses: [],
        tasks: [],
      })
    ).toBeNull();
  });

  it('mengembalikan null bila seeded bukan boolean', () => {
    expect(
      validateState({
        schemaVersion: 1,
        seeded: 'yes',
        meta: { title: 't', program: 'p', semester: 's' },
        courses: [],
        tasks: [],
      })
    ).toBeNull();
  });

  it('mengembalikan null bila meta tidak lengkap', () => {
    expect(
      validateState({
        schemaVersion: 1,
        seeded: true,
        meta: { title: 't', program: 'p' },
        courses: [],
        tasks: [],
      })
    ).toBeNull();
  });

  it('mengembalikan null bila courses bukan array', () => {
    expect(
      validateState({
        schemaVersion: 1,
        seeded: true,
        meta: { title: 't', program: 'p', semester: 's' },
        courses: 'x',
        tasks: [],
      })
    ).toBeNull();
  });

  it('buang Course yang tidak valid satu per satu, tetapkan yang valid', () => {
    const state = validateState({
      schemaVersion: 1,
      seeded: true,
      meta: { title: 't', program: 'p', semester: 's' },
      courses: [
        { id: 'a', day: 'Senin', start: '07:30', end: '09:10', name: 'Valid' },
        { id: 'b', day: 'HariAneh', start: '07:30', end: '09:10', name: 'Invalid Day' },
        { id: 'c', day: 'Senin', start: '07:30', end: '09:10', name: 'Also Valid' },
      ],
      tasks: [],
    });
    expect(state).not.toBeNull();
    expect(state!.courses.map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('buang Task yatim yang courseId-nya tidak ada', () => {
    const state = validateState({
      schemaVersion: 1,
      seeded: true,
      meta: { title: 't', program: 'p', semester: 's' },
      courses: [{ id: 'a', day: 'Senin', start: '07:30', end: '09:10', name: 'A' }],
      tasks: [
        { id: 't1', courseId: 'a', title: 'T1', done: false, createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'nonexistent', title: 'T2', done: false, createdAt: '2026-01-01T00:00:00Z' },
      ],
    });
    expect(state).not.toBeNull();
    expect(state!.tasks.map((t) => t.id)).toEqual(['t1']);
  });
});

describe('loadState', () => {
  it('pertama kali: data default dimuat dan tersimpan; pemanggilan berikutnya tidak menggandakan', () => {
    const first = loadState();
    expect(first.state.courses).toHaveLength(10);
    expect(first.state.seeded).toBe(true);
    expect(first.persistent).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    const second = loadState();
    expect(second.state.courses).toHaveLength(10);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('state dengan courses kosong dan seeded true: courses tetap kosong saat dimuat ulang', () => {
    const empty = createDefaultState();
    empty.courses = [];
    saveState(empty);

    const loaded = loadState();
    expect(loaded.state.courses).toHaveLength(0);
    expect(loaded.state.seeded).toBe(true);
  });

  it('JSON rusak tidak melempar, mengembalikan default di memori', () => {
    localStorage.setItem(STORAGE_KEY, '{ not valid json');
    const result = loadState();
    expect(result.state.courses).toHaveLength(10);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{ not valid json');
  });

  it('string biasa di localStorage tidak melempar, mengembalikan default', () => {
    localStorage.setItem(STORAGE_KEY, 'halo');
    const result = loadState();
    expect(result.state.courses).toHaveLength(10);
  });

  it('array di localStorage tidak melempar, mengembalikan default', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
    const result = loadState();
    expect(result.state.courses).toHaveLength(10);
  });

  it('null string di localStorage tidak melempar', () => {
    localStorage.setItem(STORAGE_KEY, 'null');
    const result = loadState();
    expect(result.state.courses).toHaveLength(10);
  });

  it('localStorage melempar error → persistent false, tidak crash', () => {
    const spy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    const result = loadState();
    expect(result.persistent).toBe(false);
    expect(result.state.courses).toHaveLength(10);
    spy.mockRestore();
  });

  it('schemaVersion lebih baru → default di memori, data asli tidak ditimpa', () => {
    const futureState = createDefaultState();
    futureState.schemaVersion = 999;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(futureState));

    const result = loadState();
    expect(result.state.schemaVersion).toBe(SCHEMA_VERSION);
    expect(result.state.courses).toHaveLength(10);
    // data asli tidak ditimpa sebelum saveState
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(futureState));

    // setelah saveState, data ditimpa
    const newState = createDefaultState();
    newState.meta.title = 'Baru';
    saveState(newState);
    const reloaded = loadState();
    expect(reloaded.state.meta.title).toBe('Baru');
  });

  it('round-trip saveState lalu loadState mengembalikan data sama', () => {
    const state = createDefaultState();
    state.tasks.push({
      id: 't1',
      courseId: 'inf625107',
      title: 'Tugas Contoh',
      done: false,
      createdAt: '2026-01-01T00:00:00Z',
    });

    expect(saveState(state)).toBe(true);
    const loaded = loadState();
    expect(loaded.state).toEqual(state);
    expect(loaded.state.tasks).toHaveLength(1);
    expect(loaded.state.tasks[0].title).toBe('Tugas Contoh');
  });

  it('data rusak ditimpa hanya setelah saveState', () => {
    localStorage.setItem(STORAGE_KEY, '{ corrupt data');

    // sebelum saveState, nilai lama tetap ada di localStorage
    const before = loadState();
    expect(before.state.courses).toHaveLength(10); // default di memori
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{ corrupt data');

    // setelah saveState, data ditimpa
    const newState = createDefaultState();
    newState.meta.title = 'Baru';
    saveState(newState);

    const after = loadState();
    expect(after.state.meta.title).toBe('Baru');
    expect(localStorage.getItem(STORAGE_KEY)).not.toBe('{ corrupt data');
  });
});

describe('saveState', () => {
  it('mengembalikan true saat berhasil, false saat localStorage gagal', () => {
    const state = createDefaultState();
    expect(saveState(state)).toBe(true);

    const spy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    expect(saveState(state)).toBe(false);
    spy.mockRestore();
  });
});

describe('STORAGE_KEY', () => {
  it('nilai yang benar', () => {
    expect(STORAGE_KEY).toBe('jadwal-kuliah:v1');
  });
});

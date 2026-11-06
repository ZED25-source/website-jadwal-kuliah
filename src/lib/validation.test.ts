import { describe, it, expect } from 'vitest';
import { validateCourseForm, validateMetaForm } from './validation';
import type { CourseFormValues } from './validation';

const base: CourseFormValues = {
  day: 'Senin',
  start: '07:30',
  end: '09:10',
  code: 'INF625107',
  name: 'Teknik Digital B',
  sks: '2',
  pj: 'Mona A.M. Batubara',
  pd1: 'Rizkima Akbar Setiawan',
  room: 'Mektan 3.1',
};

describe('validateCourseForm', () => {
  it('mengembalikan ok true dengan value yang benar untuk input valid', () => {
    const result = validateCourseForm(base);
    if (result.ok) {
      expect(result.value).toEqual({
        day: 'Senin',
        start: '07:30',
        end: '09:10',
        code: 'INF625107',
        name: 'Teknik Digital B',
        sks: 2,
        pj: 'Mona A.M. Batubara',
        pd1: 'Rizkima Akbar Setiawan',
        room: 'Mektan 3.1',
      });
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('nama kosong memberikan error "Nama mata kuliah wajib diisi."', () => {
    const result = validateCourseForm({ ...base, name: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBe('Nama mata kuliah wajib diisi.');
    }
  });

  it('nama hanya spasi dianggap kosong', () => {
    const result = validateCourseForm({ ...base, name: '   ' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBe('Nama mata kuliah wajib diisi.');
    }
  });

  it('day tidak valid memberikan error "Pilih hari."', () => {
    const result = validateCourseForm({ ...base, day: 'HariAneh' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.day).toBe('Pilih hari.');
    }
  });

  it('jam kosong memberikan error "Jam wajib diisi."', () => {
    const result = validateCourseForm({ ...base, start: '', end: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.start).toBe('Jam wajib diisi.');
      expect(result.errors.end).toBe('Jam wajib diisi.');
    }
  });

  it('start kosong memberikan error pada start', () => {
    const result = validateCourseForm({ ...base, start: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.start).toBe('Jam wajib diisi.');
    }
  });

  it('end kosong memberikan error pada end', () => {
    const result = validateCourseForm({ ...base, end: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.end).toBe('Jam wajib diisi.');
    }
  });

  it('format jam 25:00 memberikan error "Format jam tidak valid."', () => {
    const result = validateCourseForm({ ...base, start: '25:00', end: '26:00' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.start).toBe('Format jam tidak valid.');
      expect(result.errors.end).toBe('Format jam tidak valid.');
    }
  });

  it('format jam menit 60 memberikan error format', () => {
    const result = validateCourseForm({ ...base, start: '07:60', end: '08:00' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.start).toBe('Format jam tidak valid.');
    }
  });

  it('end = start ditolak dengan "Jam selesai harus setelah jam mulai."', () => {
    const result = validateCourseForm({ ...base, start: '07:30', end: '07:30' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.end).toBe('Jam selesai harus setelah jam mulai.');
    }
  });

  it('end < start ditolak dengan "Jam selesai harus setelah jam mulai."', () => {
    const result = validateCourseForm({ ...base, start: '09:10', end: '07:30' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.end).toBe('Jam selesai harus setelah jam mulai.');
    }
  });

  it('end setelah start diterima', () => {
    const result = validateCourseForm({ ...base, start: '07:30', end: '09:10' });
    expect(result.ok).toBe(true);
  });

  it('SKS "2.5" ditolak', () => {
    const result = validateCourseForm({ ...base, sks: '2.5' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.sks).toBe('SKS harus bilangan bulat 0-6.');
    }
  });

  it('SKS "7" ditolak', () => {
    const result = validateCourseForm({ ...base, sks: '7' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.sks).toBe('SKS harus bilangan bulat 0-6.');
    }
  });

  it('SKS "-1" ditolak', () => {
    const result = validateCourseForm({ ...base, sks: '-1' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.sks).toBe('SKS harus bilangan bulat 0-6.');
    }
  });

  it('SKS "abc" ditolak', () => {
    const result = validateCourseForm({ ...base, sks: 'abc' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.sks).toBe('SKS harus bilangan bulat 0-6.');
    }
  });

  it('SKS kosong menghasilkan sks undefined', () => {
    const result = validateCourseForm({ ...base, sks: '' });
    if (result.ok) {
      expect(result.value.sks).toBeUndefined();
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('SKS "0" diterima', () => {
    const result = validateCourseForm({ ...base, sks: '0' });
    if (result.ok) {
      expect(result.value.sks).toBe(0);
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('SKS "6" diterima', () => {
    const result = validateCourseForm({ ...base, sks: '6' });
    if (result.ok) {
      expect(result.value.sks).toBe(6);
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('field opsional kosong menghasilkan undefined', () => {
    const result = validateCourseForm({
      ...base,
      code: '',
      pj: '',
      pd1: '',
      room: '',
    });
    if (result.ok) {
      expect(result.value.code).toBeUndefined();
      expect(result.value.pj).toBeUndefined();
      expect(result.value.pd1).toBeUndefined();
      expect(result.value.room).toBeUndefined();
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('nilai di-trim sebelum disimpan', () => {
    const result = validateCourseForm({
      ...base,
      name: '  Teknik Digital B  ',
      code: '  INF625107  ',
      pj: '  Mona  ',
      pd1: '  Rizkima  ',
      room: '  Mektan 3.1  ',
    });
    if (result.ok) {
      expect(result.value.name).toBe('Teknik Digital B');
      expect(result.value.code).toBe('INF625107');
      expect(result.value.pj).toBe('Mona');
      expect(result.value.pd1).toBe('Rizkima');
      expect(result.value.room).toBe('Mektan 3.1');
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('banyak error sekaligus dikembalikan', () => {
    const result = validateCourseForm({
      ...base,
      name: '',
      day: 'HariAneh',
      start: '25:00',
      end: '',
      sks: '9',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.day).toBeDefined();
      expect(result.errors.start).toBeDefined();
      expect(result.errors.end).toBeDefined();
      expect(result.errors.sks).toBeDefined();
    }
  });
});

describe('validateMetaForm', () => {
  it('title kosong gagal', () => {
    const result = validateMetaForm({ title: '', program: 'W/TI', semester: 'Ganjil 2026/2027' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe('Judul wajib diisi.');
    }
  });

  it('title hanya spasi gagal', () => {
    const result = validateMetaForm({ title: '   ', program: 'W/TI', semester: 'Ganjil' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe('Judul wajib diisi.');
    }
  });

  it('program dan semester boleh kosong', () => {
    const result = validateMetaForm({ title: 'Judul', program: '', semester: '' });
    if (result.ok) {
      expect(result.value).toEqual({ title: 'Judul', program: '', semester: '' });
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('nilai di-trim', () => {
    const result = validateMetaForm({
      title: '  Judul  ',
      program: '  W/TI  ',
      semester: '  Ganjil  ',
    });
    if (result.ok) {
      expect(result.value).toEqual({ title: 'Judul', program: 'W/TI', semester: 'Ganjil' });
    } else {
      throw new Error('harusnya ok');
    }
  });
});

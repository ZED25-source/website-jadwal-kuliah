import type { Course, Day } from './types';
import { DAYS } from './types';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface CourseFormValues {
  day: string;
  start: string;
  end: string;
  code: string;
  name: string;
  sks: string;
  pj: string;
  pd1: string;
  room: string;
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function validateCourseForm(
  v: CourseFormValues
):
  | { ok: true; value: Omit<Course, 'id'> }
  | { ok: false; errors: Partial<Record<keyof CourseFormValues, string>> } {
  const errors: Partial<Record<keyof CourseFormValues, string>> = {};

  const name = v.name.trim();
  if (!name) {
    errors.name = 'Nama mata kuliah wajib diisi.';
  }

  if (!DAYS.includes(v.day as Day)) {
    errors.day = 'Pilih hari.';
  }

  if (!v.start) {
    errors.start = 'Jam wajib diisi.';
  }
  if (!v.end) {
    errors.end = 'Jam wajib diisi.';
  }

  if (v.start && !errors.start && !TIME_REGEX.test(v.start)) {
    errors.start = 'Format jam tidak valid.';
  }
  if (v.end && !errors.end && !TIME_REGEX.test(v.end)) {
    errors.end = 'Format jam tidak valid.';
  }

  if (v.start && v.end && !errors.start && !errors.end) {
    const startMinutes = toMinutes(v.start);
    const endMinutes = toMinutes(v.end);
    if (endMinutes <= startMinutes) {
      errors.end = 'Jam selesai harus setelah jam mulai.';
    }
  }

  const sksTrimmed = v.sks.trim();
  if (sksTrimmed !== '') {
    if (!/^[0-9]+$/.test(sksTrimmed)) {
      errors.sks = 'SKS harus bilangan bulat 0-6.';
    } else {
      const sksNum = parseInt(sksTrimmed, 10);
      if (sksNum < 0 || sksNum > 6) {
        errors.sks = 'SKS harus bilangan bulat 0-6.';
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const value: Omit<Course, 'id'> = {
    day: v.day as Day,
    start: v.start,
    end: v.end,
    name,
    code: v.code.trim() || undefined,
    sks: sksTrimmed ? parseInt(sksTrimmed, 10) : undefined,
    pj: v.pj.trim() || undefined,
    pd1: v.pd1.trim() || undefined,
    room: v.room.trim() || undefined,
  };

  return { ok: true, value };
}

export function validateMetaForm(
  values: { title: string; program: string; semester: string }
):
  | { ok: true; value: { title: string; program: string; semester: string } }
  | { ok: false; errors: Partial<Record<'title' | 'program' | 'semester', string>> } {
  const errors: Partial<Record<'title' | 'program' | 'semester', string>> = {};

  const title = values.title.trim();
  if (!title) {
    errors.title = 'Judul wajib diisi.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title,
      program: values.program.trim(),
      semester: values.semester.trim(),
    },
  };
}

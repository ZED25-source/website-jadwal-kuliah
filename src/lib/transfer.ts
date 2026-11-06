import type { AppState } from './types';
import { SCHEMA_VERSION } from './types';
import { validateState } from './storage';

const MAX_IMPORT_CHARS = 1_000_000;

export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function parseImport(text: string):
  | { ok: true; state: AppState; courseCount: number; taskCount: number; droppedCourses: number; droppedTasks: number }
  | { ok: false; error: string } {
  if (typeof text !== 'string') {
    return { ok: false, error: 'File bukan JSON yang valid.' };
  }

  if (text.length > MAX_IMPORT_CHARS) {
    return { ok: false, error: 'File terlalu besar.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'File bukan JSON yang valid.' };
  }

  if (parsed && typeof parsed === 'object' && 'schemaVersion' in parsed) {
    const sv = (parsed as Record<string, unknown>).schemaVersion;
    if (typeof sv === 'number' && sv > SCHEMA_VERSION) {
      return { ok: false, error: 'File berasal dari versi aplikasi yang lebih baru.' };
    }
  }

  const validated = validateState(parsed);
  if (validated === null) {
    return { ok: false, error: 'Format data tidak dikenali.' };
  }

  let rawCourseCount = 0;
  let rawTaskCount = 0;
  if (parsed && typeof parsed === 'object') {
    const r = parsed as Record<string, unknown>;
    if (Array.isArray(r.courses)) rawCourseCount = r.courses.length;
    if (Array.isArray(r.tasks)) rawTaskCount = r.tasks.length;
  }

  const courseCount = validated.courses.length;
  const taskCount = validated.tasks.length;

  const state: AppState = {
    ...validated,
    seeded: true,
  };

  return {
    ok: true,
    state,
    courseCount,
    taskCount,
    droppedCourses: rawCourseCount - courseCount,
    droppedTasks: rawTaskCount - taskCount,
  };
}

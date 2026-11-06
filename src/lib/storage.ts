import type { AppState, Course, Day, Task } from './types';
import { DAYS, SCHEMA_VERSION } from './types';
import { createDefaultState } from './defaults';

export const STORAGE_KEY = 'jadwal-kuliah:v1';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function validateCourse(raw: unknown): Course | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;

  const id = c.id;
  if (typeof id !== 'string' || id.length === 0) return null;

  const dayRaw = c.day;
  if (typeof dayRaw !== 'string' || !DAYS.includes(dayRaw as Day)) return null;
  const day = dayRaw as Day;

  const startRaw = c.start;
  if (typeof startRaw !== 'string' || !TIME_REGEX.test(startRaw)) return null;
  const start = startRaw;

  const endRaw = c.end;
  if (typeof endRaw !== 'string' || !TIME_REGEX.test(endRaw)) return null;
  const end = endRaw;

  const nameRaw = c.name;
  if (typeof nameRaw !== 'string' || nameRaw.length === 0) return null;
  const name = nameRaw;

  if (c.code !== undefined && typeof c.code !== 'string') return null;
  if (c.sks !== undefined && (typeof c.sks !== 'number' || !Number.isInteger(c.sks))) return null;
  if (c.pj !== undefined && typeof c.pj !== 'string') return null;
  if (c.pd1 !== undefined && typeof c.pd1 !== 'string') return null;
  if (c.room !== undefined && typeof c.room !== 'string') return null;

  const course: Course = {
    id,
    day,
    start,
    end,
    name,
  };
  if (c.code !== undefined) course.code = c.code;
  if (c.sks !== undefined) course.sks = c.sks;
  if (c.pj !== undefined) course.pj = c.pj;
  if (c.pd1 !== undefined) course.pd1 = c.pd1;
  if (c.room !== undefined) course.room = c.room;
  return course;
}

function validateTask(raw: unknown): Task | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as Record<string, unknown>;

  const id = t.id;
  if (typeof id !== 'string' || id.length === 0) return null;

  const courseId = t.courseId;
  if (typeof courseId !== 'string' || courseId.length === 0) return null;

  const title = t.title;
  if (typeof title !== 'string' || title.length === 0) return null;

  if (typeof t.done !== 'boolean') return null;

  const createdAt = t.createdAt;
  if (typeof createdAt !== 'string' || createdAt.length === 0) return null;

  if (t.due !== undefined && typeof t.due !== 'string') return null;

  const task: Task = {
    id,
    courseId,
    title,
    done: t.done,
    createdAt,
  };
  if (t.due !== undefined) task.due = t.due;

  const dueTimeRaw = t.dueTime;
  if (dueTimeRaw !== undefined) {
    const dueTimeValid =
      typeof dueTimeRaw === 'string' &&
      TIME_REGEX.test(dueTimeRaw) &&
      task.due !== undefined;
    if (dueTimeValid) {
      task.dueTime = dueTimeRaw;
    }
    // invalid dueTime → dropped, task kept
  }

  return task;
}

export function validateState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (typeof r.schemaVersion !== 'number') return null;
  if (typeof r.seeded !== 'boolean') return null;

  const meta = r.meta;
  if (!meta || typeof meta !== 'object') return null;
  const m = meta as Record<string, unknown>;
  if (typeof m.title !== 'string' || typeof m.program !== 'string' || typeof m.semester !== 'string') return null;

  const rawCourses = r.courses;
  if (!Array.isArray(rawCourses)) return null;
  const rawTasks = r.tasks;
  if (!Array.isArray(rawTasks)) return null;

  const courses: Course[] = [];
  for (const c of rawCourses) {
    const course = validateCourse(c);
    if (course) courses.push(course);
  }

  const courseIds = new Set(courses.map((c) => c.id));
  const tasks: Task[] = [];
  for (const t of rawTasks) {
    const task = validateTask(t);
    if (task && courseIds.has(task.courseId)) tasks.push(task);
  }

  return {
    schemaVersion: r.schemaVersion,
    seeded: r.seeded,
    meta: { title: m.title, program: m.program, semester: m.semester },
    courses,
    tasks,
  };
}

export function loadState(): { state: AppState; persistent: boolean } {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { state: createDefaultState(), persistent: false };
  }

  if (raw === null) {
    const state = createDefaultState();
    saveState(state);
    return { state, persistent: true };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: createDefaultState(), persistent: true };
  }

  const validated = validateState(parsed);
  if (validated === null) {
    return { state: createDefaultState(), persistent: true };
  }

  if (validated.schemaVersion > SCHEMA_VERSION) {
    // Migrasi versi lama ke baru ditambahkan nanti; treat as corrupt.
    return { state: createDefaultState(), persistent: true };
  }

  return { state: validated, persistent: true };
}

export function saveState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

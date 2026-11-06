import type { AppState, Task } from './types';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export function getJakartaDateKey(now: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export function isValidDueTime(dueTime: string | undefined): boolean {
  if (!dueTime) return false;
  return TIME_REGEX.test(dueTime);
}

export function dueTimeMinutes(dueTime: string | undefined): number | undefined {
  if (!dueTime) return undefined;
  const [h, m] = dueTime.split(':').map(Number);
  return h * 60 + m;
}

export function isOverdue(task: Task, todayKey: string, nowMinutes?: number): boolean {
  if (task.done || !task.due) return false;
  if (task.due < todayKey) return true;
  if (task.due === todayKey && nowMinutes !== undefined && task.dueTime) {
    const dueM = dueTimeMinutes(task.dueTime);
    if (dueM !== undefined && nowMinutes > dueM) return true;
  }
  return false;
}

export function partitionTasks(tasks: Task[]): { open: Task[]; done: Task[] } {
  const open: Task[] = [];
  const done: Task[] = [];
  for (const task of tasks) {
    if (task.done) {
      done.push(task);
    } else {
      open.push(task);
    }
  }
  return { open, done };
}

function compareTaskOrder(a: Task, b: Task, todayKey: string, nowMinutes?: number): number {
  const aOverdue = isOverdue(a, todayKey, nowMinutes);
  const bOverdue = isOverdue(b, todayKey, nowMinutes);

  // Overdue first
  if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

  // Both no due: sort by createdAt
  if (!a.due && !b.due) {
    const cmp = a.createdAt.localeCompare(b.createdAt);
    return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
  }
  if (!a.due) return 1; // a no due, b has due → a later
  if (!b.due) return -1; // b no due, a has due → a earlier

  // Both have due dates
  const dueCmp = a.due.localeCompare(b.due);
  if (dueCmp !== 0) return dueCmp;

  // Same date: timed before untimed, then earlier time first
  const aTime = dueTimeMinutes(a.dueTime);
  const bTime = dueTimeMinutes(b.dueTime);
  if (aTime !== undefined && bTime === undefined) return -1; // a timed, b not → a first
  if (aTime === undefined && bTime !== undefined) return 1; // b timed, a not → b first
  if (aTime !== undefined && bTime !== undefined) {
    const timeCmp = aTime - bTime;
    if (timeCmp !== 0) return timeCmp;
  }

  // Tie-breaker
  const createdCmp = a.createdAt.localeCompare(b.createdAt);
  return createdCmp !== 0 ? createdCmp : a.id.localeCompare(b.id);
}

export function sortOpenTasks(tasks: Task[], todayKey: string, nowMinutes?: number): Task[] {
  return [...tasks].sort((a, b) => compareTaskOrder(a, b, todayKey, nowMinutes));
}

export function isValidCalendarDate(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1) return false;
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getDate();
  return d <= daysInMonth;
}

export interface TaskFormValue {
  title: string;
  due?: string;
  dueTime?: string;
}

export interface TaskFormErrors {
  title?: string;
  due?: string;
}

export function validateTaskForm(input: {
  title: string;
  due?: string;
  dueTime?: string;
}): { ok: true; value: TaskFormValue } | { ok: false; errors: TaskFormErrors } {
  const errors: TaskFormErrors = {};
  const title = input.title.trim();
  if (!title) {
    errors.title = 'Judul tugas wajib diisi.';
  }

  let due: string | undefined;
  const dueRaw = input.due;
  if (dueRaw !== undefined && dueRaw !== '') {
    if (!isValidCalendarDate(dueRaw)) {
      errors.due = 'Tanggal tenggat tidak valid.';
    } else {
      due = dueRaw;
    }
  }

  let dueTime: string | undefined;
  const dueTimeRaw = input.dueTime;
  if (dueTimeRaw !== undefined && dueTimeRaw !== '') {
    dueTime = dueTimeRaw;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { title, due, dueTime } };
}

export function addTask(
  state: AppState,
  courseId: string,
  value: { title: string; due?: string; dueTime?: string },
  id: string = crypto.randomUUID(),
  createdAt: string = new Date().toISOString()
): AppState {
  if (!state.courses.some((c) => c.id === courseId)) return state;
  const task: Task = { id, courseId, title: value.title, due: value.due, dueTime: value.dueTime, done: false, createdAt };
  return { ...state, tasks: [...state.tasks, task] };
}

export function toggleTask(state: AppState, taskId: string): AppState {
  const index = state.tasks.findIndex((t) => t.id === taskId);
  if (index === -1) return state;
  const tasks = [...state.tasks];
  tasks[index] = { ...tasks[index], done: !tasks[index].done };
  return { ...state, tasks };
}

export function deleteTask(state: AppState, taskId: string): AppState {
  const tasks = state.tasks.filter((t) => t.id !== taskId);
  if (tasks.length === state.tasks.length) return state;
  return { ...state, tasks };
}

export function tasksOf(state: AppState, courseId: string): Task[] {
  return [...state.tasks]
    .filter((t) => t.courseId === courseId)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (!a.due && !b.due) return a.createdAt.localeCompare(b.createdAt);
      if (!a.due) return 1;
      if (!b.due) return -1;
      if (a.due !== b.due) return a.due.localeCompare(b.due);
      return a.createdAt.localeCompare(b.createdAt);
    });
}

export function openTaskCount(state: AppState, courseId: string): number {
  return state.tasks.filter((t) => t.courseId === courseId && !t.done).length;
}

export function formatDateId(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${BULAN_ID[m - 1]} ${y}`;
}

export function formatDueDateTime(dateStr: string, timeStr?: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const datePart = `${d} ${BULAN_ID[m - 1]} ${y}`;
  if (timeStr) {
    return `${datePart} · ${timeStr}`;
  }
  return datePart;
}

export function formatDue(task: Task): string {
  if (!task.due) return '';
  const datePart = formatDateId(task.due);
  if (task.dueTime) {
    const [h, m] = task.dueTime.split(':').map(Number);
    return `${datePart} · ${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
  }
  return datePart;
}

export type TaskStatus = 'none' | 'open' | 'done';

export function getCourseTaskStatus(tasks: Task[], courseId: string): TaskStatus {
  const courseTasks = tasks.filter((t) => t.courseId === courseId);
  if (courseTasks.length === 0) return 'none';
  const hasOpen = courseTasks.some((t) => !t.done);
  return hasOpen ? 'open' : 'done';
}

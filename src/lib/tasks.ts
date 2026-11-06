import type { AppState, Task } from './types';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

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
}

export interface TaskFormErrors {
  title?: string;
  due?: string;
}

export function validateTaskForm(input: {
  title: string;
  due?: string;
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

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { title, due } };
}

export function addTask(
  state: AppState,
  courseId: string,
  value: { title: string; due?: string },
  id: string = crypto.randomUUID(),
  createdAt: string = new Date().toISOString()
): AppState {
  if (!state.courses.some((c) => c.id === courseId)) return state;
  const task: Task = { id, courseId, title: value.title, due: value.due, done: false, createdAt };
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

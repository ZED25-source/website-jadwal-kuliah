import type { AppState, Course } from './types';
import { createDefaultState } from './defaults';

export function addCourse(
  state: AppState,
  value: Omit<Course, 'id'>,
  id: string = crypto.randomUUID()
): AppState {
  const course: Course = { id, ...value };
  return {
    ...state,
    courses: [...state.courses, course],
  };
}

export function updateCourse(
  state: AppState,
  id: string,
  value: Omit<Course, 'id'>
): AppState {
  const index = state.courses.findIndex((c) => c.id === id);
  if (index === -1) return state;
  const courses = [...state.courses];
  courses[index] = { ...courses[index], ...value };
  return { ...state, courses };
}

export function deleteCourse(state: AppState, id: string): AppState {
  const courses = state.courses.filter((c) => c.id !== id);
  const tasks = state.tasks.filter((t) => t.courseId !== id);
  return { ...state, courses, tasks };
}

export function countTasksOf(state: AppState, courseId: string): number {
  return state.tasks.filter((t) => t.courseId === courseId).length;
}

export function updateMeta(
  state: AppState,
  meta: AppState['meta']
): AppState {
  return { ...state, meta };
}

export function resetState(): AppState {
  return createDefaultState();
}

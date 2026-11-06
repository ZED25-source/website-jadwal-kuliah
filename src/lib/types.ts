export type Day = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

export interface Course {
  id: string;
  day: Day;
  start: string;
  end: string;
  code?: string;
  name: string;
  sks?: number;
  pj?: string;
  pd1?: string;
  room?: string;
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  due?: string;
  done: boolean;
  createdAt: string;
}

export interface AppState {
  schemaVersion: number;
  seeded: boolean;
  meta: { title: string; program: string; semester: string };
  courses: Course[];
  tasks: Task[];
}

export const DAYS: Day[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const SCHEMA_VERSION = 1;

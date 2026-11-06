import type { Course, Day } from './types';
import { DAYS } from './types';

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function sortCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const dayA = DAYS.indexOf(a.day);
    const dayB = DAYS.indexOf(b.day);
    if (dayA !== dayB) return dayA - dayB;
    return toMinutes(a.start) - toMinutes(b.start);
  });
}

export function groupByDay(courses: Course[]): { day: Day; courses: Course[] }[] {
  const result: { day: Day; courses: Course[] }[] = [];
  for (const day of DAYS) {
    const dayCourses = courses.filter((c) => c.day === day);
    if (dayCourses.length > 0) {
      result.push({ day, courses: dayCourses.sort((a, b) => toMinutes(a.start) - toMinutes(b.start)) });
    }
  }
  return result;
}

export function totalSks(courses: Course[]): number {
  return courses.reduce((sum, c) => sum + (c.sks ?? 0), 0);
}

export function findConflicts(candidate: Course, courses: Course[]): Course[] {
  const candidateStart = toMinutes(candidate.start);
  const candidateEnd = toMinutes(candidate.end);

  return courses.filter((c) => {
    if (c.id === candidate.id) return false;
    if (c.day !== candidate.day) return false;
    const start = toMinutes(c.start);
    const end = toMinutes(c.end);
    return candidateStart < end && start < candidateEnd;
  });
}

import type { Course, Day } from './types';
import { DAYS } from './types';
import { toMinutes } from './schedule';

export interface JakartaParts {
  day: Day;
  minutes: number;
  dateLabel: string;
}

export function getJakartaParts(now: Date): JakartaParts {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const parts = formatter.formatToParts(now);
  const weekdayPart = parts.find((p) => p.type === 'weekday')?.value ?? 'Senin';

  const dayMap: Record<string, Day> = {
    'Senin': 'Senin',
    'Selasa': 'Selasa',
    'Rabu': 'Rabu',
    'Kamis': 'Kamis',
    'Jumat': 'Jumat',
    'Sabtu': 'Sabtu',
    'Minggu': 'Minggu',
  };

  const day = dayMap[weekdayPart] ?? 'Senin';
  const dateLabel = formatter.format(now);

  const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const timeParts = timeFormatter.formatToParts(now);
  const hoursStr = timeParts.find((p) => p.type === 'hour')?.value ?? '0';
  const minsStr = timeParts.find((p) => p.type === 'minute')?.value ?? '0';
  const hours = parseInt(hoursStr, 10);
  const mins = parseInt(minsStr, 10);
  const minutes = hours * 60 + mins;

  return { day, minutes, dateLabel };
}

export interface TodayStatus {
  todayCourses: Course[];
  currentId: string | null;
  nextId: string | null;
  nextCrossDay: { day: Day; start: string; course?: Course } | null;
}

export function relativeDayLabel(fromDay: Day, toDay: Day): string {
  const fromIndex = DAYS.indexOf(fromDay);
  const toIndex = DAYS.indexOf(toDay);
  
  // Calculate days ahead, wrapping around the week
  const daysAhead = (toIndex - fromIndex + 7) % 7;
  
  // "Besok" only if exactly 1 day ahead
  return daysAhead === 1 ? 'Besok' : toDay;
}

export function getTodayStatus(courses: Course[], now: Date): TodayStatus {
  const { day, minutes } = getJakartaParts(now);

  const todayCourses = courses
    .filter((c) => c.day === day)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  let currentId: string | null = null;
  let nextId: string | null = null;

  for (const course of todayCourses) {
    const start = toMinutes(course.start);
    const end = toMinutes(course.end);

    if (start <= minutes && minutes < end) {
      currentId = course.id;
    } else if (minutes < start && !nextId) {
      nextId = course.id;
    }
  }

  let nextCrossDay: { day: Day; start: string; course?: Course } | null = null;

  if (todayCourses.length === 0 || (todayCourses.length > 0 && !nextId && !currentId)) {
    const todayIndex = DAYS.indexOf(day);
    const sortedCourses = [...courses].sort((a, b) => {
      const dayA = DAYS.indexOf(a.day);
      const dayB = DAYS.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return toMinutes(a.start) - toMinutes(b.start);
    });

    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7;
      const nextDay = DAYS[nextDayIndex];
      const nextDayCourses = sortedCourses.filter((c) => c.day === nextDay);

      if (nextDayCourses.length > 0) {
        const first = nextDayCourses[0];
        nextCrossDay = { day: nextDay, start: first.start, course: first };
        break;
      }
    }
  }

  return { todayCourses, currentId, nextId, nextCrossDay };
}

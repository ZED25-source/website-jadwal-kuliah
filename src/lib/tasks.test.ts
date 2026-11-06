import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateTaskForm,
  addTask,
  toggleTask,
  deleteTask,
  tasksOf,
  openTaskCount,
  formatDateId,
  formatDue,
  getJakartaDateKey,
  isOverdue,
  sortOpenTasks,
  partitionTasks,
  getCourseTaskStatus,
} from './tasks';
import { deleteCourse } from './actions';
import { createDefaultState } from './defaults';
import { loadState, saveState } from './storage';
import type { AppState, Task } from './types';

const baseState: AppState = createDefaultState();

describe('getJakartaDateKey', () => {
  it('formats date in WIB timezone as YYYY-MM-DD', () => {
    // 2026-11-06 10:00 WIB = 2026-11-06 03:00 UTC
    const date = new Date('2026-11-06T03:00:00Z');
    expect(getJakartaDateKey(date)).toBe('2026-11-06');
  });

  it('handles midnight boundary (23:30 WIB = 16:30 UTC same day)', () => {
    // 2026-11-06 23:30 WIB = 2026-11-06 16:30 UTC
    const date = new Date('2026-11-06T16:30:00Z');
    expect(getJakartaDateKey(date)).toBe('2026-11-06');
  });

  it('handles midnight boundary (00:30 WIB = 17:30 UTC previous day)', () => {
    // 2026-11-06 00:30 WIB = 2026-11-05 17:30 UTC
    const date = new Date('2026-11-05T17:30:00Z');
    expect(getJakartaDateKey(date)).toBe('2026-11-06');
  });
});

describe('isOverdue', () => {
  it('returns true when due is before today', () => {
    const task: Task = {
      id: 't1',
      courseId: 'c1',
      title: 'Task',
      done: false,
      due: '2026-11-05',
      createdAt: '2026-01-01T00:00:00Z',
    };
    expect(isOverdue(task, '2026-11-06')).toBe(true);
  });

  it('returns false when due equals today', () => {
    const task: Task = {
      id: 't1',
      courseId: 'c1',
      title: 'Task',
      done: false,
      due: '2026-11-06',
      createdAt: '2026-01-01T00:00:00Z',
    };
    expect(isOverdue(task, '2026-11-06')).toBe(false);
  });

  it('returns false when due is after today', () => {
    const task: Task = {
      id: 't1',
      courseId: 'c1',
      title: 'Task',
      done: false,
      due: '2026-11-07',
      createdAt: '2026-01-01T00:00:00Z',
    };
    expect(isOverdue(task, '2026-11-06')).toBe(false);
  });

  it('returns false for done tasks regardless of due date', () => {
    const task: Task = {
      id: 't1',
      courseId: 'c1',
      title: 'Task',
      done: true,
      due: '2026-11-05',
      createdAt: '2026-01-01T00:00:00Z',
    };
    expect(isOverdue(task, '2026-11-06')).toBe(false);
  });

  it('returns false for tasks without due date', () => {
    const task: Task = {
      id: 't1',
      courseId: 'c1',
      title: 'Task',
      done: false,
      createdAt: '2026-01-01T00:00:00Z',
    };
    expect(isOverdue(task, '2026-11-06')).toBe(false);
  });
});

describe('isOverdue with time (nowMinutes)', () => {
    it('today with dueTime before nowMinutes is overdue', () => {
      const task: Task = {
        id: 't1', courseId: 'c1', title: 'Task', done: false,
        due: '2026-11-06', dueTime: '10:00', createdAt: '2026-01-01T00:00:00Z',
      };
      expect(isOverdue(task, '2026-11-06', 10 * 60 + 1)).toBe(true);
    });

    it('today with dueTime exactly at nowMinutes is NOT overdue', () => {
      const task: Task = {
        id: 't1', courseId: 'c1', title: 'Task', done: false,
        due: '2026-11-06', dueTime: '10:00', createdAt: '2026-01-01T00:00:00Z',
      };
      expect(isOverdue(task, '2026-11-06', 10 * 60)).toBe(false);
    });

    it('today with dueTime after nowMinutes is NOT overdue', () => {
      const task: Task = {
        id: 't1', courseId: 'c1', title: 'Task', done: false,
        due: '2026-11-06', dueTime: '10:00', createdAt: '2026-01-01T00:00:00Z',
      };
      expect(isOverdue(task, '2026-11-06', 9 * 60)).toBe(false);
    });

    it('today without dueTime is NOT overdue even with nowMinutes', () => {
      const task: Task = {
        id: 't1', courseId: 'c1', title: 'Task', done: false,
        due: '2026-11-06', createdAt: '2026-01-01T00:00:00Z',
      };
      expect(isOverdue(task, '2026-11-06', 23 * 60 + 59)).toBe(false);
    });

    it('yesterday is always overdue regardless of time', () => {
      const task: Task = {
        id: 't1', courseId: 'c1', title: 'Task', done: false,
        due: '2026-11-05', dueTime: '23:59', createdAt: '2026-01-01T00:00:00Z',
      };
      expect(isOverdue(task, '2026-11-06', 0)).toBe(true);
    });

    it('done task is never overdue', () => {
      const task: Task = {
        id: 't1', courseId: 'c1', title: 'Task', done: true,
        due: '2026-11-05', dueTime: '10:00', createdAt: '2026-01-01T00:00:00Z',
      };
      expect(isOverdue(task, '2026-11-06', 12 * 60)).toBe(false);
    });

    it('without third parameter behaves like before (date-only)', () => {
      const task: Task = {
        id: 't1', courseId: 'c1', title: 'Task', done: false,
        due: '2026-11-04', dueTime: '10:00', createdAt: '2026-01-01T00:00:00Z',
      };
      expect(isOverdue(task, '2026-11-06')).toBe(true);
      expect(isOverdue(task, '2026-11-06', 12 * 60)).toBe(true);
      expect(isOverdue(task, '2026-11-03')).toBe(false);
    });
  });

describe('partitionTasks', () => {
  it('separates open and done tasks', () => {
    const tasks: Task[] = [
      { id: 't1', courseId: 'c1', title: 'Done', done: true, createdAt: '2026-01-01T00:00:00Z' },
      { id: 't2', courseId: 'c1', title: 'Open', done: false, createdAt: '2026-01-02T00:00:00Z' },
      { id: 't3', courseId: 'c1', title: 'Open 2', done: false, createdAt: '2026-01-03T00:00:00Z' },
    ];
    const result = partitionTasks(tasks);
    expect(result.open).toHaveLength(2);
    expect(result.done).toHaveLength(1);
    expect(result.open.every((t) => !t.done)).toBe(true);
    expect(result.done.every((t) => t.done)).toBe(true);
  });
});

describe('sortOpenTasks', () => {
  it('overdue tasks come first, sorted by due date', () => {
    const tasks: Task[] = [
      { id: 't1', courseId: 'c1', title: 'Due later', done: false, due: '2026-11-03', createdAt: '2026-01-01T00:00:00Z' },
      { id: 't2', courseId: 'c1', title: 'Due earliest', done: false, due: '2026-11-01', createdAt: '2026-01-02T00:00:00Z' },
      { id: 't3', courseId: 'c1', title: 'Due middle', done: false, due: '2026-11-02', createdAt: '2026-01-03T00:00:00Z' },
    ];
    const result = sortOpenTasks(tasks, '2026-11-06');
    expect(result.map((t) => t.id)).toEqual(['t2', 't3', 't1']);
  });

  it('upcoming tasks come after overdue, no due comes last', () => {
    const tasks: Task[] = [
      { id: 't1', courseId: 'c1', title: 'No due', done: false, createdAt: '2026-01-01T00:00:00Z' },
      { id: 't2', courseId: 'c1', title: 'Overdue', done: false, due: '2026-11-05', createdAt: '2026-01-02T00:00:00Z' },
      { id: 't3', courseId: 'c1', title: 'Upcoming', done: false, due: '2026-11-07', createdAt: '2026-01-03T00:00:00Z' },
    ];
    const result = sortOpenTasks(tasks, '2026-11-06');
    expect(result.map((t) => t.id)).toEqual(['t2', 't3', 't1']);
  });

  it('tasks with same due date sorted by createdAt', () => {
    const tasks: Task[] = [
      { id: 't1', courseId: 'c1', title: 'Second', done: false, due: '2026-11-05', createdAt: '2026-01-02T00:00:00Z' },
      { id: 't2', courseId: 'c1', title: 'First', done: false, due: '2026-11-05', createdAt: '2026-01-01T00:00:00Z' },
    ];
    const result = sortOpenTasks(tasks, '2026-11-06');
    expect(result.map((t) => t.id)).toEqual(['t2', 't1']);
  });

  it('tie-breaker with id when createdAt is same', () => {
    const tasks: Task[] = [
      { id: 'tb', courseId: 'c1', title: 'B', done: false, due: '2026-11-05', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'ta', courseId: 'c1', title: 'A', done: false, due: '2026-11-05', createdAt: '2026-01-01T00:00:00Z' },
    ];
    const result = sortOpenTasks(tasks, '2026-11-06');
    expect(result.map((t) => t.id)).toEqual(['ta', 'tb']);
  });

  it('does not modify input array', () => {
    const tasks: Task[] = [
      { id: 't2', courseId: 'c1', title: 'B', done: false, due: '2026-11-07', createdAt: '2026-01-02T00:00:00Z' },
      { id: 't1', courseId: 'c1', title: 'A', done: false, due: '2026-11-05', createdAt: '2026-01-01T00:00:00Z' },
    ];
    const original = [...tasks];
    sortOpenTasks(tasks, '2026-11-06');
    expect(tasks).toEqual(original);
  });

  it('tasks without due date sorted by createdAt then id', () => {
    const tasks: Task[] = [
      { id: 't2', courseId: 'c1', title: 'Later', done: false, createdAt: '2026-01-02T00:00:00Z' },
      { id: 't1', courseId: 'c1', title: 'Earlier', done: false, createdAt: '2026-01-01T00:00:00Z' },
    ];
    const result = sortOpenTasks(tasks, '2026-11-06');
    expect(result.map((t) => t.id)).toEqual(['t1', 't2']);
  });

  describe('sortOpenTasks with time (nowMinutes)', () => {
    it('same date: timed tasks sorted by time, timed before untimed', () => {
      const tasks: Task[] = [
        { id: 't1', courseId: 'c1', title: 'Untimed', done: false, due: '2026-11-06', createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'c1', title: '14:00', done: false, due: '2026-11-06', dueTime: '14:00', createdAt: '2026-01-02T00:00:00Z' },
        { id: 't3', courseId: 'c1', title: '09:00', done: false, due: '2026-11-06', dueTime: '09:00', createdAt: '2026-01-03T00:00:00Z' },
      ];
      const result = sortOpenTasks(tasks, '2026-11-06', 10 * 60);
      expect(result.map((t) => t.id)).toEqual(['t3', 't2', 't1']);
    });

    it('today with past dueTime goes to overdue group', () => {
      const tasks: Task[] = [
        { id: 't1', courseId: 'c1', title: 'Future', done: false, due: '2026-11-07', createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'c1', title: 'Past 10:00', done: false, due: '2026-11-06', dueTime: '10:00', createdAt: '2026-01-02T00:00:00Z' },
        { id: 't3', courseId: 'c1', title: 'No time today', done: false, due: '2026-11-06', createdAt: '2026-01-03T00:00:00Z' },
      ];
      const result = sortOpenTasks(tasks, '2026-11-06', 12 * 60);
      expect(result.map((t) => t.id)).toEqual(['t2', 't3', 't1']);
    });

    it('does not modify input array', () => {
      const tasks: Task[] = [
        { id: 't2', courseId: 'c1', title: 'B', done: false, due: '2026-11-06', dueTime: '10:00', createdAt: '2026-01-02T00:00:00Z' },
        { id: 't1', courseId: 'c1', title: 'A', done: false, due: '2026-11-06', dueTime: '09:00', createdAt: '2026-01-01T00:00:00Z' },
      ];
      const original = [...tasks];
      sortOpenTasks(tasks, '2026-11-06', 12 * 60);
      expect(tasks).toEqual(original);
    });

    it('without third parameter behaves like before', () => {
      const tasks: Task[] = [
        { id: 't2', courseId: 'c1', title: 'Due later', done: false, due: '2026-11-03', createdAt: '2026-01-01T00:00:00Z' },
        { id: 't1', courseId: 'c1', title: 'Due earliest', done: false, due: '2026-11-01', createdAt: '2026-01-02T00:00:00Z' },
      ];
      const result = sortOpenTasks(tasks, '2026-11-06');
      expect(result.map((t) => t.id)).toEqual(['t1', 't2']);
    });
  });
});

describe('validateTaskForm', () => {
  it('input valid mengembalikan ok dengan title di-trim dan due undefined', () => {
    const result = validateTaskForm({ title: '  Latihan  ', due: undefined });
    if (result.ok) {
      expect(result.value).toEqual({ title: 'Latihan', due: undefined });
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('title kosong gagal', () => {
    const result = validateTaskForm({ title: '', due: '2026-11-06' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe('Judul tugas wajib diisi.');
    }
  });

  it('title hanya spasi gagal', () => {
    const result = validateTaskForm({ title: '   ', due: '2026-11-06' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBe('Judul tugas wajib diisi.');
    }
  });

  it('tenggat kosong diterima (opsional)', () => {
    const result = validateTaskForm({ title: 'Latihan', due: '' });
    if (result.ok) {
      expect(result.value.due).toBeUndefined();
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('tenggat 2026-02-30 ditolak', () => {
    const result = validateTaskForm({ title: 'Latihan', due: '2026-02-30' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.due).toBe('Tanggal tenggat tidak valid.');
    }
  });

  it('format salah ditolak', () => {
    const result = validateTaskForm({ title: 'Latihan', due: '06-11-2026' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.due).toBe('Tanggal tenggat tidak valid.');
    }
  });

  it('tenggat valid diterima', () => {
    const result = validateTaskForm({ title: 'Latihan', due: '2026-11-06' });
    if (result.ok) {
      expect(result.value.due).toBe('2026-11-06');
    } else {
      throw new Error('harusnya ok');
    }
  });

  it('keduanya error sekaligus dikembalikan', () => {
    const result = validateTaskForm({ title: '   ', due: '2026-02-30' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.title).toBeDefined();
      expect(result.errors.due).toBeDefined();
    }
  });
});

describe('addTask', () => {
  it('courseId tidak ada mengembalikan state tak berubah', () => {
    const result = addTask(baseState, 'tidak-ada', { title: 'X' });
    expect(result).toBe(baseState);
    expect(result.tasks).toHaveLength(0);
  });

  it('menambahkan task dengan id dan createdAt yang diinjeksi', () => {
    const result = addTask(
      baseState,
      'inf625107',
      { title: 'Tugas Baru' },
      'custom-id',
      '2026-01-01T00:00:00Z'
    );
    const t = result.tasks.find((x) => x.id === 'custom-id');
    expect(t).toBeDefined();
    expect(t!.title).toBe('Tugas Baru');
    expect(t!.courseId).toBe('inf625107');
    expect(t!.done).toBe(false);
    expect(t!.createdAt).toBe('2026-01-01T00:00:00Z');
    expect(t!.due).toBeUndefined();
  });

  it('dengan tenggat', () => {
    const result = addTask(baseState, 'inf625107', { title: 'Tugas', due: '2026-11-06' });
    const t = result.tasks[0];
    expect(t!.due).toBe('2026-11-06');
  });

  it('tidak mengubah state input (immutable)', () => {
    const before = JSON.parse(JSON.stringify(baseState));
    const result = addTask(baseState, 'inf625107', { title: 'X' });
    expect(result).not.toBe(baseState);
    expect(baseState).toEqual(before);
    expect(baseState.tasks).toHaveLength(0);
  });
});

describe('toggleTask', () => {
  it('mengubah false menjadi true', () => {
    const stateWithTask: AppState = {
      ...baseState,
      tasks: [{ id: 't1', courseId: 'inf625107', title: 'Tugas', done: false, createdAt: '2026-01-01T00:00:00Z' }],
    };
    const result = toggleTask(stateWithTask, 't1');
    expect(result.tasks[0].done).toBe(true);
  });

  it('mengubah true menjadi false (dua arah)', () => {
    const stateWithTask: AppState = {
      ...baseState,
      tasks: [{ id: 't1', courseId: 'inf625107', title: 'Tugas', done: true, createdAt: '2026-01-01T00:00:00Z' }],
    };
    const result = toggleTask(stateWithTask, 't1');
    expect(result.tasks[0].done).toBe(false);
  });

  it('id tidak ditemukan mengembalikan state tak berubah', () => {
    const result = toggleTask(baseState, 'tidak-ada');
    expect(result).toBe(baseState);
  });

  it('tidak mengubah state input', () => {
    const stateWithTask: AppState = {
      ...baseState,
      tasks: [{ id: 't1', courseId: 'inf625107', title: 'Tugas', done: false, createdAt: '2026-01-01T00:00:00Z' }],
    };
    toggleTask(stateWithTask, 't1');
    expect(stateWithTask.tasks[0].done).toBe(false);
  });
});

describe('deleteTask', () => {
  it('menghapus task yang ditemukan', () => {
    const stateWithTask: AppState = {
      ...baseState,
      tasks: [
        { id: 't1', courseId: 'inf625107', title: 'Tugas 1', done: false, createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'inf625107', title: 'Tugas 2', done: false, createdAt: '2026-01-02T00:00:00Z' },
      ],
    };
    const result = deleteTask(stateWithTask, 't1');
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].id).toBe('t2');
  });

  it('id tidak ditemukan mengembalikan state tak berubah', () => {
    const result = deleteTask(baseState, 'tidak-ada');
    expect(result).toBe(baseState);
  });

  it('tidak mengubah state input', () => {
    const stateWithTask: AppState = {
      ...baseState,
      tasks: [{ id: 't1', courseId: 'inf625107', title: 'Tugas', done: false, createdAt: '2026-01-01T00:00:00Z' }],
    };
    deleteTask(stateWithTask, 't1');
    expect(stateWithTask.tasks).toHaveLength(1);
  });
});

describe('tasksOf', () => {
  const stateWithTasks: AppState = {
    ...baseState,
    tasks: [
      { id: 't1', courseId: 'inf625107', title: 'Selesai Awal', done: true, due: '2026-11-01', createdAt: '2026-01-01T00:00:00Z' },
      { id: 't2', courseId: 'inf625107', title: 'Belum Tenggat', done: false, due: undefined, createdAt: '2026-01-02T00:00:00Z' },
      { id: 't3', courseId: 'inf625107', title: 'Belum Tenggat 2', done: false, due: undefined, createdAt: '2026-01-01T00:00:00Z' },
      { id: 't4', courseId: 'inf625107', title: 'Belum Terlambat', done: false, due: '2026-11-10', createdAt: '2026-01-03T00:00:00Z' },
      { id: 't5', courseId: 'inf625107', title: 'Belum Awal', done: false, due: '2026-11-01', createdAt: '2026-01-04T00:00:00Z' },
      { id: 't6', courseId: 'uni625109', title: 'Lain MK', done: false, due: '2026-11-01', createdAt: '2026-01-01T00:00:00Z' },
    ],
  };

  it('belum selesai dulu, lalu selesai', () => {
    const result = tasksOf(stateWithTasks, 'inf625107');
    const doneIndex = result.findIndex((t) => t.done);
    expect(doneIndex).toBe(result.length - 1);
    expect(result.slice(0, doneIndex).every((t) => !t.done)).toBe(true);
  });

  it('di dalam kelompok belum selesai: tenggat lebih awal dulu, tanpa tenggat di akhir, lalu createdAt naik', () => {
    const result = tasksOf(stateWithTasks, 'inf625107');
    const notDone = result.filter((t) => !t.done);
    expect(notDone.map((t) => t.id)).toEqual(['t5', 't4', 't3', 't2']);
  });

  it('task course lain tidak masuk', () => {
    const result = tasksOf(stateWithTasks, 'inf625107');
    expect(result.some((t) => t.id === 't6')).toBe(false);
  });

  it('tidak mengubah input', () => {
    const before = [...stateWithTasks.tasks];
    tasksOf(stateWithTasks, 'inf625107');
    expect(stateWithTasks.tasks).toEqual(before);
  });
});

describe('openTaskCount', () => {
  it('menghitung task belum selesai per course', () => {
    const stateWithTasks: AppState = {
      ...baseState,
      tasks: [
        { id: 't1', courseId: 'inf625107', title: 'A', done: false, createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'inf625107', title: 'B', done: true, createdAt: '2026-01-02T00:00:00Z' },
        { id: 't3', courseId: 'uni625109', title: 'C', done: false, createdAt: '2026-01-03T00:00:00Z' },
      ],
    };
    expect(openTaskCount(stateWithTasks, 'inf625107')).toBe(1);
    expect(openTaskCount(stateWithTasks, 'uni625109')).toBe(1);
    expect(openTaskCount(stateWithTasks, 'tidak-ada')).toBe(0);
  });
});

describe('formatDateId', () => {
  it('format YYYY-MM-DD menjadi tanggal Indonesia tanpa zona waktu', () => {
    expect(formatDateId('2026-11-06')).toBe('6 Nov 2026');
    expect(formatDateId('2026-01-01')).toBe('1 Jan 2026');
    expect(formatDateId('2026-12-31')).toBe('31 Des 2026');
  });
});

describe('formatDue', () => {
  it('without dueTime returns date only', () => {
    expect(formatDue({ id: 't1', courseId: 'c1', title: 'T', due: '2026-11-06', done: false, createdAt: '2026-01-01T00:00:00Z' })).toBe('6 Nov 2026');
  });

  it('with dueTime returns date and time with dot separator', () => {
    expect(formatDue({ id: 't1', courseId: 'c1', title: 'T', due: '2026-11-06', dueTime: '14:00', done: false, createdAt: '2026-01-01T00:00:00Z' })).toBe('6 Nov 2026 · 14.00');
  });

  it('with dueTime 09:05 pads minutes', () => {
    expect(formatDue({ id: 't1', courseId: 'c1', title: 'T', due: '2026-11-06', dueTime: '09:05', done: false, createdAt: '2026-01-01T00:00:00Z' })).toBe('6 Nov 2026 · 09.05');
  });

  it('without due returns empty string', () => {
    expect(formatDue({ id: 't1', courseId: 'c1', title: 'T', done: false, createdAt: '2026-01-01T00:00:00Z' })).toBe('');
  });
});

describe('deleteCourse tidak meninggalkan tugas yatim', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hapus course ikut menghapus semua task miliknya', () => {
    const stateWithTasks: AppState = {
      ...baseState,
      tasks: [
        { id: 't1', courseId: 'inf625107', title: 'Tugas 1', done: false, createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'inf625107', title: 'Tugas 2', done: false, createdAt: '2026-01-02T00:00:00Z' },
        { id: 't3', courseId: 'uni625109', title: 'Tugas Lain', done: false, createdAt: '2026-01-03T00:00:00Z' },
      ],
    };
    const result = deleteCourse(stateWithTasks, 'inf625107');
    expect(result.tasks.some((t) => t.courseId === 'inf625107')).toBe(false);
    expect(result.tasks.some((t) => t.id === 't3')).toBe(true);
  });

  it('tidak menghapus task course lain', () => {
    const stateWithTasks: AppState = {
      ...baseState,
      tasks: [
        { id: 't1', courseId: 'inf625107', title: 'Tugas 1', done: false, createdAt: '2026-01-01T00:00:00Z' },
        { id: 't2', courseId: 'uni625109', title: 'Tugas 2', done: false, createdAt: '2026-01-02T00:00:00Z' },
      ],
    };
    const result = deleteCourse(stateWithTasks, 'inf625107');
    expect(result.tasks.some((t) => t.id === 't2')).toBe(true);
    expect(result.tasks.some((t) => t.id === 't1')).toBe(false);
  });
});

describe('round-trip saveState lalu loadState mempertahankan tugas', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('termasuk task yang sudah selesai', () => {
    let state = createDefaultState();
    state = addTask(state, 'inf625107', { title: 'Tugas Contoh', due: '2026-11-06' });
    state = toggleTask(state, state.tasks[0].id);
    saveState(state);

    const loaded = loadState();
    expect(loaded.state.tasks).toHaveLength(1);
    expect(loaded.state.tasks[0].title).toBe('Tugas Contoh');
    expect(loaded.state.tasks[0].done).toBe(true);
    expect(loaded.state.tasks[0].due).toBe('2026-11-06');
  });

  it('mempertahankan dueTime melalui saveState dan loadState', () => {
    let state = createDefaultState();
    state = addTask(state, 'inf625107', { title: 'Tugas dengan Jam', due: '2026-11-06', dueTime: '14:00' });
    saveState(state);

    const loaded = loadState();
    expect(loaded.state.tasks).toHaveLength(1);
    expect(loaded.state.tasks[0].dueTime).toBe('14:00');
  });
});

describe('getCourseTaskStatus', () => {
  it('returns "none" when course has no tasks', () => {
    const tasks: Task[] = [];
    expect(getCourseTaskStatus(tasks, 'c1')).toBe('none');
  });

  it('returns "open" when course has open tasks', () => {
    const tasks: Task[] = [
      {
        id: 't1',
        courseId: 'c1',
        title: 'Task 1',
        done: false,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];
    expect(getCourseTaskStatus(tasks, 'c1')).toBe('open');
  });

  it('returns "done" when all course tasks are complete', () => {
    const tasks: Task[] = [
      {
        id: 't1',
        courseId: 'c1',
        title: 'Task 1',
        done: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 't2',
        courseId: 'c1',
        title: 'Task 2',
        done: true,
        createdAt: '2026-01-02T00:00:00Z',
      },
    ];
    expect(getCourseTaskStatus(tasks, 'c1')).toBe('done');
  });

  it('returns "open" when course has both done and open tasks', () => {
    const tasks: Task[] = [
      {
        id: 't1',
        courseId: 'c1',
        title: 'Task 1',
        done: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 't2',
        courseId: 'c1',
        title: 'Task 2',
        done: false,
        createdAt: '2026-01-02T00:00:00Z',
      },
    ];
    expect(getCourseTaskStatus(tasks, 'c1')).toBe('open');
  });

  it('ignores tasks from other courses', () => {
    const tasks: Task[] = [
      {
        id: 't1',
        courseId: 'c2',
        title: 'Task 1',
        done: false,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];
    expect(getCourseTaskStatus(tasks, 'c1')).toBe('none');
  });
});

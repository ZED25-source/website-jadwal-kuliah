<script lang="ts">
  import type { Course, Task } from '../lib/types';
  import { formatTime } from '../lib/view';
  import { getCourseTaskStatus, type TaskStatus } from '../lib/tasks';

  let {
    course,
    tasks = [],
    openCount,
    onclick
  }: {
    course: Course;
    tasks?: Task[];
    openCount: number;
    onclick: (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
  } = $props();

  const taskStatus: TaskStatus = $derived(getCourseTaskStatus(tasks, course.id));
</script>

<button
  type="button"
  class="chip"
  onclick={onclick}
  aria-label="Lihat detail {course.name}"
>
  <div class="chip__time">{formatTime(course.start)}</div>
  <div class="chip__name">{course.name}</div>
  {#if course.room}
    <div class="chip__room">{course.room}</div>
  {/if}
  {#if taskStatus === 'open'}
    <span class="chip__badge chip__badge--danger" aria-label="{openCount} tugas belum selesai">
      {openCount}
    </span>
  {:else if taskStatus === 'done'}
    <span class="chip__badge chip__badge--success" aria-label="Semua tugas selesai">
      ✓
    </span>
  {/if}
</button>

<style>
  .chip {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--bg-card);
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: left;
    width: 100%;
    box-shadow: var(--shadow-soft);
    transition: transform 150ms ease-out, box-shadow 150ms ease-out;
  }

  .chip:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
    border-color: var(--royal);
  }

  .chip:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .chip__time {
    font-size: var(--font-size-caption);
    font-weight: 700;
    color: var(--royal);
  }

  .chip__name {
    font-size: var(--font-size-body);
    font-weight: 600;
    color: var(--navy);
    overflow-wrap: break-word;
    hyphens: auto;
    word-break: break-word;
  }

  .chip__room {
    font-size: var(--font-size-caption);
    color: var(--text-muted);
  }

  .chip__badge {
    display: inline-block;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-pill);
    font-size: var(--font-size-caption);
    font-weight: 700;
    min-width: 24px;
    text-align: center;
  }

  .chip__badge--danger {
    background: var(--danger);
    color: var(--on-danger);
  }

  .chip__badge--success {
    background: var(--success);
    color: var(--on-success);
  }

  @media (prefers-reduced-motion: reduce) {
    .chip {
      transition: none;
    }

    .chip:hover {
      transform: none;
    }
  }
</style>

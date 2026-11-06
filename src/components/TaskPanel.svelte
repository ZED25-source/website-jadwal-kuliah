<script lang="ts">
  import type { Task, Course } from '../lib/types';
  import { formatDue, sortOpenTasks, partitionTasks, getJakartaDateKey, isOverdue } from '../lib/tasks';
  import { getJakartaParts } from '../lib/today';

  let {
    tasks,
    courses,
    onToggle,
    onDelete,
    currentTime
  }: {
    tasks: Task[];
    courses: Course[];
    onToggle: (taskId: string) => void;
    onDelete: (task: Task, trigger: HTMLButtonElement) => void;
    currentTime: Date;
  } = $props();

  const todayKey = $derived(getJakartaDateKey(currentTime));
  const nowMinutes = $derived(getJakartaParts(currentTime).minutes);
  const partitioned = $derived(partitionTasks(tasks));
  const sortedOpen = $derived(sortOpenTasks(partitioned.open, todayKey, nowMinutes));
  const sortedDone = $derived([...partitioned.done].sort((a, b) => {
    const cmp = b.createdAt.localeCompare(a.createdAt);
    return cmp !== 0 ? cmp : b.id.localeCompare(a.id);
  }));

  function getCourse(courseId: string): Course | undefined {
    return courses.find((c) => c.id === courseId);
  }
</script>

{#if sortedOpen.length === 0 && sortedDone.length === 0}
  <p class="task-panel__empty">Tidak ada tugas.</p>
{:else}
  {#if sortedOpen.length > 0}
    <ul class="task-list">
      {#each sortedOpen as task}
        {@const course = getCourse(task.courseId)}
        {@const overdue = isOverdue(task, todayKey, nowMinutes)}
        <li class="task-item" class:task-item--overdue={overdue}>
          <label class="task-item__label">
            <input
              type="checkbox"
              class="task-item__checkbox"
              checked={false}
              onchange={() => onToggle(task.id)}
              aria-label="Tandai selesai: {task.title}"
            />
              <div class="task-item__content">
                <div class="task-item__title">{task.title}</div>
                <div class="task-item__meta">
                  {#if course}
                    <div class="task-item__course">{course.name}</div>
                  {/if}
                  {#if task.due}
                    <div class="task-item__due" class:task-item__due--overdue={overdue}>
                      {#if overdue}
                        <span class="task-item__overdue-label">Terlambat:</span>
                      {/if}
                      {formatDue(task)}
                    </div>
                  {/if}
                </div>
              </div>
          </label>
          <button
            type="button"
            class="task-item__delete"
            onclick={(e) => onDelete(task, e.currentTarget)}
            aria-label="Hapus tugas {task.title}"
          >
            ×
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if sortedDone.length > 0}
    <details class="task-done">
      <summary class="task-done__summary">Selesai ({sortedDone.length})</summary>
      <ul class="task-list">
        {#each sortedDone as task}
          {@const course = getCourse(task.courseId)}
          <li class="task-item task-item--done">
            <label class="task-item__label">
              <input
                type="checkbox"
                class="task-item__checkbox"
                checked={true}
                onchange={() => onToggle(task.id)}
                aria-label="Tandai belum selesai: {task.title}"
              />
              <div class="task-item__content">
                <div class="task-item__title">{task.title}</div>
                <div class="task-item__meta">
                  {#if course}
                    <div class="task-item__course">{course.name}</div>
                  {/if}
                  {#if task.due}
                    <div class="task-item__due">{formatDue(task)}</div>
                  {/if}
                </div>
              </div>
            </label>
            <button
              type="button"
              class="task-item__delete"
              onclick={(e) => onDelete(task, e.currentTarget)}
              aria-label="Hapus tugas {task.title}"
            >
              ×
            </button>
          </li>
        {/each}
      </ul>
    </details>
  {/if}
{/if}

<style>
  .task-panel__empty {
    color: var(--text-muted);
    font-size: var(--font-size-body);
    margin: 0;
    padding: var(--space-4) 0;
    text-align: center;
  }

  .task-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .task-item {
    display: flex;
    align-items: flex-start;
    gap: calc(var(--space-1) * 0.5);
    padding: calc(var(--space-2) * 0.5);
    background: var(--bg-card);
    border: var(--border-medium) solid var(--grid-gray);
    border-radius: var(--radius-md);
  }

  .task-item--overdue {
    border-color: var(--red);
    border-width: var(--border-medium);
  }

  .task-item--done {
    opacity: 0.7;
  }

  .task-item__label {
    display: flex;
    align-items: center;
    gap: calc(var(--space-1) * 0.5);
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }

  .task-item__checkbox {
    cursor: pointer;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .task-item__content {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-1) * 0.5);
    flex: 1;
    min-width: 0;
  }

  .task-item__meta {
    display: flex;
    gap: calc(var(--space-1) * 0.5);
    flex-wrap: wrap;
    align-items: center;
  }

  .task-item__title {
    font-size: calc(var(--font-size-caption) * 0.9);
    font-weight: 600;
    color: var(--navy);
    overflow-wrap: break-word;
    hyphens: auto;
    border-left: var(--border-medium) solid var(--navy);
    padding-left: var(--space-2);
  }

  .task-item--done .task-item__title {
    text-decoration: line-through;
  }

  .task-item__course {
    font-size: calc(var(--font-size-caption) * 0.9);
    color: var(--text-muted);
  }

  .task-item__due {
    font-size: calc(var(--font-size-caption) * 0.9);
    color: var(--text);
  }

  .task-item__due--overdue {
    color: var(--red);
    font-weight: 700;
  }

  .task-item__overdue-label {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
  }

  .task-item__delete {
    background: transparent;
    border: none;
    font-size: 1rem;
    line-height: 1;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  .task-item__delete:hover {
    color: var(--red);
    background: rgba(220, 38, 38, 0.1);
  }

  .task-item__delete:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .task-done {
    margin-top: var(--space-3);
  }

  .task-done__summary {
    font-size: var(--font-size-body);
    font-weight: 700;
    color: var(--navy);
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--radius-sm);
  }

  .task-done__summary:hover {
    background: var(--off-white);
  }

  .task-done__summary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .task-done[open] .task-list {
    margin-top: var(--space-3);
  }
</style>

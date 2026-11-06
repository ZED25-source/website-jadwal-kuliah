<script lang="ts">
  // Komponen item tunggal tugas: checkbox, judul, status selesai/terlambat, tanggal tenggat,
  // dan tombol hapus.
  import type { Task } from '../lib/types';
  import { formatDateId, isOverdue, getJakartaDateKey } from '../lib/tasks';

  export let tasks: Task[] = [];
  export let onToggle: (taskId: string) => void = () => {};
  export let onDelete: (taskId: string, trigger: HTMLButtonElement) => void = () => {};

  const todayKey = getJakartaDateKey(new Date());
</script>

<ul class="task-list">
  {#each tasks as task (task.id)}
    {@const overdue = isOverdue(task, todayKey)}
    <li class="task-list__item" class:task-list__item--done={task.done}>
      <label class="task-list__label">
        <input
          type="checkbox"
          class="task-list__checkbox"
          checked={task.done}
          onchange={() => onToggle(task.id)}
        />
        <span class="task-list__title">{task.title}</span>
        {#if task.done}
          <span class="task-list__done-text">Selesai</span>
        {:else if overdue}
          <span class="task-list__overdue-text">Terlambat</span>
        {/if}
      </label>
      {#if task.due}
        <span class="task-list__due">{formatDateId(task.due)}</span>
      {/if}
      <button
        type="button"
        class="task-list__delete"
        onclick={(e) => onDelete(task.id, e.currentTarget as HTMLButtonElement)}
        aria-label="Hapus tugas {task.title}"
      >
        Hapus
      </button>
    </li>
  {/each}
</ul>

<style>
  .task-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .task-list__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    flex-wrap: wrap;
  }

  .task-list__item--done {
    background: rgba(85, 166, 78, 0.05);
  }

  .task-list__label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1;
    margin: 0;
    cursor: pointer;
    font-size: var(--font-size-body);
    color: var(--text);
    min-width: 0;
  }

  .task-list__checkbox {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    cursor: pointer;
  }

  .task-list__checkbox:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .task-list__title {
    flex: 1;
    text-decoration: none;
    word-break: break-word;
  }

  .task-list__item--done .task-list__title {
    text-decoration: line-through;
    color: var(--text-muted);
  }

  .task-list__done-text {
    font-size: var(--font-size-body);
    color: var(--success);
    font-weight: 700;
    white-space: nowrap;
  }

  .task-list__overdue-text {
    font-size: var(--font-size-caption);
    color: var(--danger);
    font-weight: 700;
    white-space: nowrap;
  }

  .task-list__due {
    font-size: var(--font-size-caption);
    color: var(--text);
    background: var(--grid-gray);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-pill);
    white-space: nowrap;
    font-weight: 600;
  }

  .task-list__delete {
    font-size: var(--font-size-caption);
    color: var(--text-muted);
    background: none;
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-pill);
    padding: var(--space-1) var(--space-3);
    cursor: pointer;
    flex-shrink: 0;
    font-weight: 600;
    white-space: nowrap;
  }

  .task-list__delete:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .task-list__delete:hover {
    border-color: var(--red);
    color: var(--red);
  }

  @media (max-width: 480px) {
    .task-list__item {
      flex-direction: column;
      align-items: flex-start;
    }

    .task-list__label {
      width: 100%;
    }

    .task-list__due,
    .task-list__delete {
      align-self: flex-end;
    }
  }
</style>

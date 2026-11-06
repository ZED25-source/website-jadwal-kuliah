<script lang="ts">
  import type { Task } from '../lib/types';
  import { formatDateId } from '../lib/tasks';

  export let tasks: Task[] = [];
  export let onToggle: (taskId: string) => void = () => {};
  export let onDelete: (taskId: string, trigger: HTMLButtonElement) => void = () => {};
</script>

<ul class="task-list">
  {#each tasks as task}
    <li class="task-list__item">
      <label class="task-list__label">
        <input
          type="checkbox"
          class="task-list__checkbox"
          checked={task.done}
          onchange={() => onToggle(task.id)}
        />
        <span class="task-list__title">{task.title}</span>
        {#if task.done}
          <span class="task-list__done">Selesai</span>
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
    gap: var(--space-1);
  }

  .task-list__item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--text-muted);
    border-radius: 4px;
    background: var(--bg);
  }

  .task-list__label {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex: 1;
    margin: 0;
    cursor: pointer;
    font-size: var(--font-size-body);
    color: var(--text);
  }

  .task-list__checkbox {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .task-list__checkbox:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .task-list__title {
    flex: 1;
  }

  .task-list__done {
    font-size: var(--font-size-caption);
    color: var(--text-muted);
  }

  .task-list__due {
    font-size: var(--font-size-caption);
    color: var(--text-muted);
    white-space: nowrap;
  }

  .task-list__delete {
    font-size: var(--font-size-caption);
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--text-muted);
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    flex-shrink: 0;
  }

  .task-list__delete:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .task-list__delete:hover {
    background: var(--bg);
  }
</style>

<script lang="ts">
  import type { AppState, Task } from '../lib/types';
  import { validateTaskForm } from '../lib/tasks';
  import { groupByDay } from '../lib/schedule';
  import TaskPanel from './TaskPanel.svelte';
  import Calendar from './Calendar.svelte';
  import DataTools from './DataTools.svelte';
  import Motivation from './Motivation.svelte';

  let {
    appState,
    onAddCourse,
    onAddTask,
    onToggleTask,
    onDeleteTask,
    onImportConfirmed,
    currentTime
  }: {
    appState: AppState;
    onAddCourse: () => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (task: Task, trigger: HTMLButtonElement) => void;
    onAddTask: (courseId: string, value: { title: string; due?: string; dueTime?: string }) => void;
    onImportConfirmed: (nextState: AppState) => void;
    currentTime: Date;
  } = $props();

  let taskFormValues = $state({ courseId: '', title: '', due: '', dueTime: '' });
  let taskFormErrors = $state<Partial<Record<'courseId' | 'title' | 'due' | 'dueTime', string>>>({});

  const groups = $derived(groupByDay(appState.courses));
  const coursesWithDay = $derived(
    groups.flatMap((g) => g.courses.map((c) => ({ ...c, dayLabel: g.day })))
  );

  function handleTaskFormChange(field: 'courseId' | 'title' | 'due' | 'dueTime', value: string) {
    taskFormValues = { ...taskFormValues, [field]: value };
    if (field === 'due' && value === '') {
      taskFormValues = { ...taskFormValues, dueTime: '' };
    }
    if (taskFormErrors[field]) {
      const newErrors = { ...taskFormErrors };
      delete newErrors[field];
      taskFormErrors = newErrors;
    }
  }

  function handleTaskFormSubmit() {
    const errors: Partial<Record<'courseId' | 'title' | 'due', string>> = {};
    
    if (!taskFormValues.courseId) {
      errors.courseId = 'Pilih mata kuliah.';
    }

    const validation = validateTaskForm({
      title: taskFormValues.title,
      due: taskFormValues.due || undefined,
      dueTime: taskFormValues.dueTime || undefined,
    });

    if (!validation.ok) {
      Object.assign(errors, validation.errors);
    }

    if (Object.keys(errors).length > 0) {
      taskFormErrors = errors;
      return;
    }

    if (validation.ok) {
      onAddTask(taskFormValues.courseId, validation.value);
      taskFormValues = { courseId: '', title: '', due: '', dueTime: '' };
      taskFormErrors = {};
    }
  }
</script>

<aside class="sidebar" aria-label="Panel samping">
  <div class="sidebar__section">
    <button
      type="button"
      class="sidebar__button sidebar__button--primary"
      onclick={onAddCourse}
    >
      Tambah mata kuliah
    </button>
  </div>

  <div class="sidebar__section">
    <Calendar
      tasks={appState.tasks}
      courses={appState.courses}
      onToggle={onToggleTask}
      onDelete={onDeleteTask}
      {currentTime}
    />
  </div>

  <div class="sidebar__section">
    <h2 class="sidebar__heading">Tugas</h2>
    
    <TaskPanel
      tasks={appState.tasks}
      courses={appState.courses}
      onToggle={onToggleTask}
      onDelete={onDeleteTask}
      {currentTime}
    />
  </div>

  <div class="sidebar__section">
    <details class="task-form-details">
      <summary class="task-form-details__summary">Tambah tugas</summary>
      
      <form class="task-form" onsubmit={(e) => { e.preventDefault(); handleTaskFormSubmit(); }}>
        {#if appState.courses.length === 0}
          <p class="task-form__disabled">Tambah mata kuliah dulu.</p>
        {:else}
          <div class="form-field">
            <label class="form-field__label" for="sidebar-task-course">
              Mata Kuliah <span class="form-field__required">(wajib)</span>
            </label>
            <select
              id="sidebar-task-course"
              class="form-field__select"
              bind:value={taskFormValues.courseId}
              onchange={(e) => handleTaskFormChange('courseId', (e.target as HTMLSelectElement).value)}
              aria-invalid={!!taskFormErrors.courseId}
              aria-describedby={taskFormErrors.courseId ? 'error-sidebar-task-course' : undefined}
            >
              <option value="">Pilih mata kuliah</option>
              {#each coursesWithDay as course}
                <option value={course.id}>{course.name} ({course.dayLabel})</option>
              {/each}
            </select>
            {#if taskFormErrors.courseId}
              <p id="error-sidebar-task-course" class="form-field__error">{taskFormErrors.courseId}</p>
            {/if}
          </div>

          <div class="form-field">
            <label class="form-field__label" for="sidebar-task-title">
              Judul <span class="form-field__required">(wajib)</span>
            </label>
            <input
              id="sidebar-task-title"
              type="text"
              class="form-field__input"
              maxlength="120"
              bind:value={taskFormValues.title}
              oninput={(e) => handleTaskFormChange('title', (e.target as HTMLInputElement).value)}
              aria-invalid={!!taskFormErrors.title}
              aria-describedby={taskFormErrors.title ? 'error-sidebar-task-title' : undefined}
            />
            {#if taskFormErrors.title}
              <p id="error-sidebar-task-title" class="form-field__error">{taskFormErrors.title}</p>
            {/if}
          </div>

          <div class="form-field">
            <label class="form-field__label" for="sidebar-task-due">Tenggat</label>
            <input
              id="sidebar-task-due"
              type="date"
              class="form-field__input"
              bind:value={taskFormValues.due}
              oninput={(e) => handleTaskFormChange('due', (e.target as HTMLInputElement).value)}
              aria-invalid={!!taskFormErrors.due}
              aria-describedby={taskFormErrors.due ? 'error-sidebar-task-due' : undefined}
            />
            {#if taskFormErrors.due}
              <p id="error-sidebar-task-due" class="form-field__error">{taskFormErrors.due}</p>
            {/if}
          </div>

          <div class="form-field">
            <label class="form-field__label" for="sidebar-task-due-time">Jam (WIB, opsional)</label>
            <input
              id="sidebar-task-due-time"
              type="time"
              class="form-field__input"
              disabled={!taskFormValues.due}
              bind:value={taskFormValues.dueTime}
              oninput={(e) => handleTaskFormChange('dueTime', (e.target as HTMLInputElement).value)}
              aria-invalid={!!taskFormErrors.dueTime}
              aria-describedby={taskFormErrors.dueTime ? 'error-sidebar-task-due-time' : undefined}
            />
            {#if taskFormErrors.dueTime}
              <p id="error-sidebar-task-due-time" class="form-field__error">{taskFormErrors.dueTime}</p>
            {/if}
          </div>

          <button type="submit" class="sidebar__button sidebar__button--secondary">
            Tambah Tugas
          </button>
        {/if}
      </form>
    </details>
  </div>

  <Motivation />
  <div class="sidebar__section">
    <DataTools state={appState} {onImportConfirmed} />
  </div>
</aside>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    min-width: 0;
    background: var(--bg-card);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-soft);
  }

  .sidebar__section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .sidebar__heading {
    font-size: var(--font-size-h3);
    font-weight: 700;
    color: var(--navy);
    margin: 0;
    line-height: 1.2;
  }

  .sidebar__button {
    font-size: var(--font-size-body);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-weight: 700;
    text-align: center;
    border: none;
  }

  .sidebar__button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .sidebar__button--primary {
    background: var(--navy);
    color: var(--text-on-navy);
    box-shadow: var(--shadow-soft);
  }

  .sidebar__button--primary:hover {
    background: var(--royal);
    box-shadow: var(--shadow-medium);
  }

  .sidebar__button--secondary {
    background: var(--green);
    color: var(--navy);
  }

  .sidebar__button--secondary:hover {
    background: var(--teal);
  }

  .task-form-details {
    border: none;
    padding: 0;
  }

  .task-form-details__summary {
    font-size: var(--font-size-lead);
    font-weight: 700;
    color: var(--navy);
    cursor: pointer;
    padding: var(--space-3);
    background: var(--off-white);
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-md);
    list-style: none;
    user-select: none;
  }

  .task-form-details__summary::-webkit-details-marker {
    display: none;
  }

  .task-form-details__summary::marker {
    display: none;
  }

  .task-form-details__summary::before {
    content: '▸ ';
    display: inline-block;
    margin-right: var(--space-2);
    transition: transform 0.2s;
  }

  .task-form-details[open] .task-form-details__summary::before {
    transform: rotate(90deg);
  }

  .task-form-details__summary:hover {
    background: var(--light-blue);
    border-color: var(--royal);
  }

  .task-form-details__summary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .task-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--off-white);
    border: var(--border-thin) solid var(--grid-gray);
    border-top: none;
    border-radius: 0 0 var(--radius-md) var(--radius-md);
  }

  .task-form__disabled {
    font-size: var(--font-size-body);
    color: var(--text-muted);
    margin: 0;
    font-style: italic;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0;
  }

  .form-field__label {
    font-size: var(--font-size-body);
    color: var(--text);
    font-weight: 700;
    margin: 0;
  }

  .form-field__required {
    color: var(--text-muted);
    font-weight: 400;
  }

  .form-field__input,
  .form-field__select {
    font-size: var(--font-size-body);
    padding: var(--space-2) var(--space-3);
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--text);
    width: 100%;
    box-sizing: border-box;
  }

  .form-field__input:focus-visible,
  .form-field__select:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .form-field__input[aria-invalid="true"],
  .form-field__select[aria-invalid="true"] {
    border-color: var(--red);
  }

  .form-field__error {
    font-size: var(--font-size-caption);
    color: var(--red);
    margin: 0;
    font-weight: 600;
  }

  @media (prefers-reduced-motion: reduce) {
    .task-form-details__summary::before {
      transition: none;
    }
  }
</style>

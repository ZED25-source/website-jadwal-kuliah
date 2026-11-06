<script lang="ts">
  // Komponen kartu detail mata kuliah: waktu, nama, meta (SKS/PJ/PD1/ruang), daftar tugas,
  // form tambah tugas inline, dan aksi ubah/hapus/tambah tugas.
  import type { Course, Task } from '../lib/types';
  import { formatTime } from '../lib/view';
  import TaskList from './TaskList.svelte';

  export let course: Course;
  export let tasks: Task[] = [];
  export let openCount: number = 0;
  export let onDelete: () => void = () => {};
  export let onEdit: () => void = () => {};
  export let onAddTask: (courseId: string, trigger: HTMLButtonElement) => void = () => {};
  export let onToggleTask: (taskId: string) => void = () => {};
  export let onDeleteTask: (taskId: string, trigger: HTMLButtonElement) => void = () => {};
  export let isAddingTask: boolean = false;
  export let taskValues: { title: string; due: string; dueTime?: string } = { title: '', due: '' };
  export let taskErrors: Partial<Record<'title' | 'due' | 'dueTime', string>> = {};
  export let onTaskInputChange: (field: 'title' | 'due' | 'dueTime', value: string) => void = () => {};
  export let onTaskSave: () => void = () => {};
  export let onTaskClose: () => void = () => {};
  export let isEven: boolean = false;

  let addTaskButton: HTMLButtonElement;
  let titleInput: HTMLInputElement | null = null;

  // Fokuskan input judul saat form tambah tugas dibuka.
  $: if (isAddingTask && titleInput) {
    titleInput.focus();
  }
</script>

<div class="course-box">
  <div class="course" class:course--even={isEven}>
    <div class="course__time-col">
      <time class="course__time" aria-label="{formatTime(course.start)} sampai {formatTime(course.end)}">
        {formatTime(course.start)}<br />– {formatTime(course.end)}
      </time>
    </div>

  <div class="course__content-col">
    <h3 class="course__name">
      {#if course.code}<span class="course__code">{course.code}</span>{/if}
      {course.name}
    </h3>

    {#if course.sks !== undefined || course.pj || course.pd1 || course.room}
      <div class="course__meta">
        {#if course.sks !== undefined}
          <span class="course__meta-item"><strong>SKS:</strong> {course.sks}</span>
        {/if}
        {#if course.pj}
          <span class="course__meta-item"><strong>PJ:</strong> {course.pj}</span>
        {/if}
        {#if course.pd1}
          <span class="course__meta-item"><strong>PD 1:</strong> {course.pd1}</span>
        {/if}
        {#if course.room}
          <span class="course__meta-item"><strong>Ruang:</strong> {course.room}</span>
        {/if}
      </div>
    {/if}

    {#if tasks.length > 0}
      {#if openCount > 0}
        <div class="course__task-badge">{openCount} tugas belum selesai</div>
      {/if}
      <TaskList
        {tasks}
        onToggle={onToggleTask}
        onDelete={onDeleteTask}
      />
    {/if}

    {#if isAddingTask}
      <form class="task-form" onsubmit={(e) => { e.preventDefault(); onTaskSave(); }}>
        <div class="form-field">
          <label class="form-field__label" for="task-title-{course.id}">
            Judul <span class="form-field__required">(wajib)</span>
          </label>
          <input
            id="task-title-{course.id}"
            type="text"
            bind:this={titleInput}
            bind:value={taskValues.title}
            oninput={(e) => onTaskInputChange('title', (e.target as HTMLInputElement).value)}
            aria-invalid={!!taskErrors.title}
            aria-describedby={taskErrors.title ? `error-task-title-${course.id}` : undefined}
          />
          {#if taskErrors.title}
            <p id="error-task-title-{course.id}" class="form-field__error">{taskErrors.title}</p>
          {/if}
        </div>
        <div class="form-field">
          <label class="form-field__label" for="task-due-{course.id}">Tenggat</label>
          <input
            id="task-due-{course.id}"
            type="date"
            bind:value={taskValues.due}
            oninput={(e) => onTaskInputChange('due', (e.target as HTMLInputElement).value)}
            aria-invalid={!!taskErrors.due}
            aria-describedby={taskErrors.due ? `error-task-due-${course.id}` : undefined}
          />
          {#if taskErrors.due}
            <p id="error-task-due-{course.id}" class="form-field__error">{taskErrors.due}</p>
          {/if}
        </div>

        <div class="form-field">
          <label class="form-field__label" for="task-due-time-{course.id}">Jam (WIB, opsional)</label>
          <input
            id="task-due-time-{course.id}"
            type="time"
            class="form-field__input"
            disabled={!taskValues.due}
            bind:value={taskValues.dueTime}
            oninput={(e) => onTaskInputChange('dueTime', (e.target as HTMLInputElement).value)}
            aria-invalid={!!taskErrors.dueTime}
            aria-describedby={taskErrors.dueTime ? `error-task-due-time-${course.id}` : undefined}
          />
          {#if taskErrors.dueTime}
            <p id="error-task-due-time-{course.id}" class="form-field__error">{taskErrors.dueTime}</p>
          {/if}
        </div>
        <div class="task-form__actions">
          <button type="button" class="button button--secondary" onclick={onTaskClose}>Batal</button>
          <button type="submit" class="button button--primary">Simpan</button>
        </div>
      </form>
    {/if}
  </div>

  <div class="course__actions-col">
    <div class="course__actions">
      <button type="button" class="course__button course__button--edit" onclick={onEdit} aria-label="Ubah {course.name}">Ubah</button>
      <button type="button" class="course__button course__button--delete" onclick={onDelete} aria-label="Hapus {course.name}">Hapus</button>
      <button
        type="button"
        class="course__button course__button--add-task"
        bind:this={addTaskButton}
        onclick={() => onAddTask(course.id, addTaskButton)}
        aria-label="Tambah tugas {course.name}"
      >
        + Tugas
      </button>
    </div>
  </div>
  </div>
</div>

<style>
  .course-box {
    container-type: inline-size;
  }

  .course {
    display: grid;
    grid-template-columns: 7rem minmax(12ch, 1fr) 9rem;
    gap: var(--space-4);
    padding: var(--space-5);
    border-bottom: var(--border-thin) solid var(--grid-gray);
  }

  .course:last-child {
    border-bottom: none;
  }

  .course--even {
    background: rgba(220, 236, 247, 0.15);
  }

  @media (min-width: 768px) {
    .course {
      gap: var(--space-5);
    }
  }

  @container (max-width: 560px) {
    .course {
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }
    .course__actions {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  .course__time-col {
    display: flex;
    flex-direction: column;
  }

  .course__time {
    font-size: var(--font-size-lead);
    font-weight: 700;
    color: var(--royal);
    line-height: var(--line-height-snug);
  }

  .course__content-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .course__name {
    font-size: var(--font-size-h3);
    line-height: var(--line-height-relaxed);
    font-weight: 700;
    margin: 0;
    color: var(--navy);
  }

  .course__code {
    display: inline-block;
    margin-right: var(--space-2);
    color: var(--royal);
    font-weight: 700;
  }

  .course__meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-size: var(--font-size-caption);
    color: var(--text-muted);
  }

  .course__meta-item {
    display: block;
  }

  .course__task-badge {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    background: var(--danger);
    color: var(--on-danger);
    border-radius: var(--radius-pill);
    font-size: var(--font-size-caption);
    font-weight: 700;
    align-self: flex-start;
  }

  .course__actions-col {
    display: flex;
    flex-direction: column;
  }

  .course__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .course__button {
    font-size: var(--font-size-caption);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    max-width: 100%;
  }

  .course__button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .course__button--edit {
    background: transparent;
    color: var(--royal);
    border: var(--border-thin) solid var(--royal);
  }

  .course__button--edit:hover {
    background: var(--royal);
    color: var(--text-on-navy);
  }

  .course__button--delete {
    background: transparent;
    color: var(--text-muted);
    border: var(--border-thin) solid var(--grid-gray);
  }

  .course__button--delete:hover {
    border-color: var(--red);
    color: var(--red);
  }

  .course__button--add-task {
    background: var(--navy);
    color: var(--text-on-navy);
    border: none;
  }

  .course__button--add-task:hover {
    background: var(--royal);
  }

  .task-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin: var(--space-3) 0 0 0;
    padding: var(--space-4);
    border: var(--border-medium) dashed var(--grid-gray);
    border-radius: var(--radius-md);
    background: var(--off-white);
  }

  .task-form__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin: 0;
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

  .form-field input {
    font-size: var(--font-size-body);
    padding: var(--space-3);
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--text);
    width: 100%;
    box-sizing: border-box;
  }

  .form-field input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .form-field input[aria-invalid="true"] {
    border-color: var(--red);
  }

  .form-field__error {
    font-size: var(--font-size-caption);
    color: var(--red);
    margin: 0;
    font-weight: 600;
  }

  .button {
    font-size: var(--font-size-body);
    padding: var(--space-2) var(--space-5);
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-weight: 600;
    min-width: 100px;
  }

  .button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .button--primary {
    background: var(--navy);
    color: var(--text-on-navy);
    border: none;
  }

  .button--primary:hover {
    background: var(--royal);
  }

  .button--secondary {
    background: transparent;
    color: var(--text);
    border: var(--border-thin) solid var(--grid-gray);
  }

  .button--secondary:hover {
    background: var(--grid-gray);
  }
</style>

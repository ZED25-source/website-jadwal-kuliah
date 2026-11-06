<script lang="ts">
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
export let taskValues: { title: string; due: string } = { title: '', due: '' };
export let taskErrors: Partial<Record<'title' | 'due', string>> = {};
export let onTaskInputChange: (field: 'title' | 'due', value: string) => void = () => {};
export let onTaskSave: () => void = () => {};
export let onTaskClose: () => void = () => {};

let addTaskButton: HTMLButtonElement;
let titleInput: HTMLInputElement | null = null;

$: if (isAddingTask && titleInput) {
  titleInput.focus();
}
</script>

<li class="course">
  <time class="course__time">
    {formatTime(course.start)} – {formatTime(course.end)}
  </time>
  <h3 class="course__name">
    {#if course.code}{course.code} {/if}{course.name}
  </h3>
  <p class="course__meta">
    {#if course.sks !== undefined}
      <span class="course__meta-item">{course.sks} SKS</span>
    {/if}
    {#if course.pj}
      <span class="course__meta-item">PJ {course.pj}</span>
    {/if}
    {#if course.pd1}
      <span class="course__meta-item">PD 1 {course.pd1}</span>
    {/if}
    {#if course.room}
      <span class="course__meta-item">{course.room}</span>
    {/if}
  </p>
  <div class="course__actions">
    <button type="button" class="course__button course__button--edit" onclick={onEdit}>Ubah {course.name}</button>
    <button type="button" class="course__button course__button--delete" onclick={onDelete}>Hapus {course.name}</button>
    <button
      type="button"
      class="course__button course__button--add-task"
      bind:this={addTaskButton}
      onclick={() => onAddTask(course.id, addTaskButton)}
    >
      Tambah tugas {course.name}
    </button>
  </div>

  {#if tasks.length > 0}
    <p class="course__task-count">{openCount} tugas belum selesai</p>
    <TaskList
      {tasks}
      onToggle={onToggleTask}
      onDelete={onDeleteTask}
    />
  {/if}

  {#if isAddingTask}
    <form class="task-form" onsubmit={(e) => { e.preventDefault(); onTaskSave(); }}>
      <div class="form-field">
        <label class="form-field__label" for="task-title">
          Judul <span class="form-field__required">(wajib)</span>
        </label>
        <input
          id="task-title"
          type="text"
          bind:this={titleInput}
          bind:value={taskValues.title}
          oninput={(e) => onTaskInputChange('title', (e.target as HTMLInputElement).value)}
          aria-invalid={!!taskErrors.title}
          aria-describedby={taskErrors.title ? 'error-task-title' : undefined}
        />
        {#if taskErrors.title}
          <p id="error-task-title" class="form-field__error">{taskErrors.title}</p>
        {/if}
      </div>
      <div class="form-field">
        <label class="form-field__label" for="task-due">Tenggat</label>
        <input
          id="task-due"
          type="date"
          bind:value={taskValues.due}
          oninput={(e) => onTaskInputChange('due', (e.target as HTMLInputElement).value)}
          aria-invalid={!!taskErrors.due}
          aria-describedby={taskErrors.due ? 'error-task-due' : undefined}
        />
        {#if taskErrors.due}
          <p id="error-task-due" class="form-field__error">{taskErrors.due}</p>
        {/if}
      </div>
      <div class="task-form__actions">
        <button type="button" class="button button--secondary" onclick={onTaskClose}>Batal</button>
        <button type="submit" class="button button--primary">Simpan</button>
      </div>
    </form>
  {/if}
</li>

<style>
  .course {
    margin-bottom: var(--space-2);
  }

  .course__time {
    font-size: var(--font-size-caption);
    color: var(--text-muted);
    display: block;
    margin-bottom: var(--space-1);
  }

  .course__name {
    font-size: var(--font-size-h3);
    line-height: var(--line-height-snug);
    font-weight: 600;
    margin: 0 0 var(--space-1) 0;
    color: var(--text);
  }

  .course__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    font-size: var(--font-size-caption);
    color: var(--text-muted);
    margin: 0 0 var(--space-1) 0;
  }

  .course__meta-item {
    display: inline-block;
  }

  .course__actions {
    display: flex;
    gap: var(--space-1);
    margin: 0 0 var(--space-2) 0;
    flex-wrap: wrap;
  }

  .course__button {
    font-size: var(--font-size-caption);
    padding: var(--space-1) var(--space-2);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .course__button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .course__button--edit {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--text-muted);
  }

  .course__button--edit:hover {
    background: var(--bg);
  }

  .course__button--delete {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--text-muted);
  }

  .course__button--delete:hover {
    background: var(--bg);
  }

  .course__button--add-task {
    background: var(--accent);
    color: var(--bg);
  }

  .course__button--add-task:hover {
    background: var(--accent-hover);
  }

  .course__task-count {
    font-size: var(--font-size-caption);
    color: var(--text-muted);
    margin: 0 0 var(--space-1) 0;
  }

  .task-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin: 0 0 var(--space-2) 0;
    padding: var(--space-3);
    border: 1px solid var(--text-muted);
    border-radius: 4px;
    background: var(--bg);
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
    gap: var(--space-1);
    margin: 0;
  }

  .form-field__label {
    font-size: var(--font-size-body);
    color: var(--text);
    font-weight: 600;
    margin: 0;
  }

  .form-field__required {
    color: var(--text-muted);
    font-weight: 400;
  }

  .form-field input {
    font-size: var(--font-size-body);
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--text-muted);
    border-radius: 4px;
    background: var(--bg);
    color: var(--text);
    width: 100%;
    box-sizing: border-box;
  }

  .form-field input:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .form-field input[aria-invalid="true"] {
    border-color: var(--accent);
  }

  .form-field__error {
    font-size: var(--font-size-caption);
    color: var(--accent);
    margin: 0;
  }

  .button {
    font-size: var(--font-size-body);
    padding: var(--space-1) var(--space-3);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    min-width: 80px;
  }

  .button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .button--primary {
    background: var(--accent);
    color: var(--bg);
  }

  .button--primary:hover {
    background: var(--accent-hover);
  }

  .button--secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--text-muted);
  }

  .button--secondary:hover {
    background: var(--bg);
  }
</style>

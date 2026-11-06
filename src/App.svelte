<script lang="ts">
  import { loadState, saveState } from './lib/storage';
  import { addCourse, updateCourse, deleteCourse, countTasksOf, updateMeta, resetState } from './lib/actions';
  import { addTask, toggleTask, deleteTask, validateTaskForm } from './lib/tasks';
  import { validateMetaForm } from './lib/validation';
  import { groupByDay, totalSks } from './lib/schedule';
  import { todayWib } from './lib/view';
  import type { Course, Task } from './lib/types';
  import Header from './components/Header.svelte';
  import DayGroup from './components/DayGroup.svelte';
  import Motivation from './components/Motivation.svelte';
  import CourseForm from './components/CourseForm.svelte';

  let state = loadState().state;

  $: meta = state.meta;
  $: courses = state.courses;

  let showForm = false;
  let editingId: string | null = null;

  let showDeleteDialog = false;
  let deleteTarget: { id: string; name: string } | null = null;

  let showResetDialog = false;

  let showHeaderDialog = false;
  let headerValues = { title: state.meta.title, program: state.meta.program, semester: state.meta.semester };
  let headerErrors: Partial<Record<'title' | 'program' | 'semester', string>> = {};

  let deleteDialog: HTMLDialogElement;
  let resetDialog: HTMLDialogElement;
  let headerDialog: HTMLDialogElement;

  let taskFormCourseId: string | null = null;
  let taskValues = { title: '', due: '' };
  let taskErrors: Partial<Record<'title' | 'due', string>> = {};
  let taskFormTrigger: HTMLButtonElement | null = null;

let taskDeleteOpen = false;
let taskDeleteTarget: { id: string; title: string; courseId: string } | null = null;
let taskDeleteTrigger: HTMLButtonElement | null = null;
  let taskDeleteDialog: HTMLDialogElement;

  $: sksTotal = totalSks(courses);
  $: groups = groupByDay(courses);
  $: today = todayWib();
  $: todayEmpty = courses.length > 0 && !groups.some((g) => g.day === today);
  $: if (showDeleteDialog) deleteDialog?.showModal();
  $: if (!showDeleteDialog) deleteDialog?.close();
  $: if (showResetDialog) resetDialog?.showModal();
  $: if (!showResetDialog) resetDialog?.close();
  $: if (showHeaderDialog) headerDialog?.showModal();
  $: if (!showHeaderDialog) headerDialog?.close();
  $: if (taskDeleteOpen) taskDeleteDialog?.showModal();
  $: if (!taskDeleteOpen) taskDeleteDialog?.close();

  function openAddForm() {
    editingId = null;
    showForm = true;
  }

  function openEditForm(course: Course) {
    editingId = course.id;
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingId = null;
  }

  function onFormSave(values: Omit<Course, 'id'>) {
    if (editingId) {
      state = updateCourse(state, editingId, values);
    } else {
      state = addCourse(state, values);
    }
    saveState(state);
    closeForm();
  }

  function onDelete(course: Course) {
    deleteTarget = { id: course.id, name: course.name };
    showDeleteDialog = true;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    state = deleteCourse(state, deleteTarget.id);
    saveState(state);
    showDeleteDialog = false;
    deleteTarget = null;
  }

  function onReset() {
    state = resetState();
    saveState(state);
    showResetDialog = false;
  }

  function openHeaderDialog() {
    headerValues = { title: meta.title, program: meta.program, semester: meta.semester };
    headerErrors = {};
    showHeaderDialog = true;
  }

  function closeHeaderDialog() {
    showHeaderDialog = false;
  }

  function onHeaderSubmit() {
    const result = validateMetaForm(headerValues);
    if (result.ok) {
      state = updateMeta(state, result.value);
      saveState(state);
      closeHeaderDialog();
    } else {
      headerErrors = result.errors;
    }
  }

  function onHeaderInputChange(field: 'title' | 'program' | 'semester', value: string) {
    headerValues = { ...headerValues, [field]: value };
    if (headerErrors[field]) {
      const newErrors = { ...headerErrors };
      delete newErrors[field];
      headerErrors = newErrors;
    }
  }

  function openTaskForm(courseId: string, trigger: HTMLButtonElement) {
    taskFormCourseId = courseId;
    taskFormTrigger = trigger;
    taskValues = { title: '', due: '' };
    taskErrors = {};
  }

  function closeTaskForm() {
    taskFormTrigger?.focus();
    taskFormTrigger = null;
    taskFormCourseId = null;
  }

  function onTaskInputChange(field: 'title' | 'due', value: string) {
    taskValues = { ...taskValues, [field]: value };
    if (taskErrors[field]) {
      const newErrors = { ...taskErrors };
      delete newErrors[field];
      taskErrors = newErrors;
    }
  }

  function onTaskSave() {
    if (!taskFormCourseId) return;
    const result = validateTaskForm(taskValues);
    if (result.ok) {
      state = addTask(state, taskFormCourseId, result.value);
      saveState(state);
      closeTaskForm();
    } else {
      taskErrors = result.errors;
    }
  }

  function openTaskDelete(task: Task, trigger: HTMLButtonElement) {
    taskDeleteTarget = { id: task.id, title: task.title, courseId: task.courseId };
    taskDeleteTrigger = trigger;
    taskDeleteOpen = true;
  }

  function confirmTaskDelete() {
    if (!taskDeleteTarget) return;
    state = deleteTask(state, taskDeleteTarget.id);
    saveState(state);
    taskDeleteOpen = false;
    taskDeleteTrigger?.focus();
    taskDeleteTarget = null;
    taskDeleteTrigger = null;
  }
</script>

<main>
  <Header {meta} totalSks={sksTotal} onEditHeader={openHeaderDialog} />

  <button class="button-add" onclick={openAddForm}>Tambah mata kuliah</button>

  {#if showForm}
    <CourseForm
      open={showForm}
      course={editingId ? courses.find((c) => c.id === editingId) ?? undefined : null}
      courses={courses}
      onSave={onFormSave}
      onClose={closeForm}
    />
  {/if}

  {#if courses.length === 0}
    <p class="empty">Belum ada jadwal mata kuliah.</p>
  {:else}
    {#if todayEmpty}
      <p class="empty">Tidak ada kuliah hari ini</p>
    {/if}
    {#each groups as group}
      <DayGroup
        day={group.day}
        courses={group.courses}
        isToday={group.day === today}
        state={state}
        onDelete={onDelete}
        onEdit={openEditForm}
        onAddTask={openTaskForm}
        onToggleTask={(id) => {
          state = toggleTask(state, id);
          saveState(state);
        }}
        onDeleteTask={(taskId, trigger) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (task) openTaskDelete(task, trigger);
        }}
        taskFormCourseId={taskFormCourseId}
        {taskValues}
        {taskErrors}
        onTaskInputChange={onTaskInputChange}
        onTaskSave={onTaskSave}
        onTaskClose={closeTaskForm}
      />
    {/each}
  {/if}

  <Motivation />

  <dialog bind:this={deleteDialog}>
    {#if deleteTarget}
      <p class="dialog__body">
        Hapus "{deleteTarget.name}"?
        <br />
        {countTasksOf(state, deleteTarget.id) === 0
          ? 'Tidak ada tugas yang terhapus.'
          : `Tugas yang ikut terhapus: ${countTasksOf(state, deleteTarget.id)}`}
      </p>
    {/if}
    <div class="dialog__actions">
      <button type="button" class="button-cancel" onclick={() => { showDeleteDialog = false; deleteTarget = null; }}>Batal</button>
      <button type="button" class="button-delete" onclick={confirmDelete}>Hapus</button>
    </div>
  </dialog>

  <dialog bind:this={resetDialog}>
    <p class="dialog__body">Reset ke jadwal default? Semua perubahan dan tugas akan hilang.</p>
    <div class="dialog__actions">
      <button type="button" class="button-cancel" onclick={() => { showResetDialog = false; }}>Batal</button>
      <button type="button" class="button-delete" onclick={onReset}>Reset</button>
    </div>
  </dialog>

  <dialog bind:this={headerDialog}>
    <h2 class="dialog__title">Ubah Header</h2>
    <form class="dialog__form" onsubmit={(e) => { e.preventDefault(); onHeaderSubmit(); }}>
      <div class="form-field">
        <label class="form-field__label" for="field-header-title">
          Judul <span class="form-field__required">(wajib)</span>
        </label>
        <input
          id="field-header-title"
          type="text"
          bind:value={headerValues.title}
          oninput={(e) => onHeaderInputChange('title', (e.target as HTMLInputElement).value)}
          aria-invalid={!!headerErrors.title}
          aria-describedby={headerErrors.title ? 'error-header-title' : undefined}
        />
        {#if headerErrors.title}
          <p id="error-header-title" class="form-field__error">{headerErrors.title}</p>
        {/if}
      </div>
      <div class="form-field">
        <label class="form-field__label" for="field-header-program">Program</label>
        <input
          id="field-header-program"
          type="text"
          bind:value={headerValues.program}
          oninput={(e) => onHeaderInputChange('program', (e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="form-field">
        <label class="form-field__label" for="field-header-semester">Semester</label>
        <input
          id="field-header-semester"
          type="text"
          bind:value={headerValues.semester}
          oninput={(e) => onHeaderInputChange('semester', (e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="dialog__actions">
        <button type="button" class="button-cancel" onclick={closeHeaderDialog}>Batal</button>
        <button type="submit" class="button-primary">Simpan</button>
      </div>
    </form>
  </dialog>

  <dialog bind:this={taskDeleteDialog}>
    {#if taskDeleteTarget}
      <p class="dialog__body">Hapus tugas "{taskDeleteTarget.title}"?</p>
    {/if}
    <div class="dialog__actions">
      <button type="button" class="button-cancel" onclick={() => { taskDeleteOpen = false; taskDeleteTarget = null; }}>Batal</button>
      <button type="button" class="button-delete" onclick={confirmTaskDelete}>Hapus</button>
    </div>
  </dialog>
</main>

<style>
  .button-add {
    font-size: var(--font-size-body);
    padding: var(--space-1) var(--space-3);
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    margin-bottom: var(--space-3);
  }

  .button-add:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .button-add:hover {
    background: var(--accent-hover);
  }

  .empty {
    color: var(--text-muted);
    font-size: var(--font-size-body);
    margin-top: var(--space-3);
  }

  .button-cancel:focus-visible,
  .button-delete:focus-visible,
  .button-primary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0 0 var(--space-2) 0;
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
</style>

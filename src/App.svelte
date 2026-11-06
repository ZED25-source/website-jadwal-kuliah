<script lang="ts">
  import { loadState, saveState } from './lib/storage';
  import { addCourse, updateCourse, deleteCourse, countTasksOf, updateMeta, resetState } from './lib/actions';
  import { addTask, toggleTask, deleteTask, validateTaskForm } from './lib/tasks';
  import { validateMetaForm } from './lib/validation';
  import { groupByDay, totalSks } from './lib/schedule';
  import { todayWib } from './lib/view';
  import type { Course, Task, AppState } from './lib/types';
  import Header from './components/Header.svelte';
  import DayGroup from './components/DayGroup.svelte';
  import Motivation from './components/Motivation.svelte';
  import CourseForm from './components/CourseForm.svelte';
  import StorageNotice from './components/StorageNotice.svelte';
  import DataTools from './components/DataTools.svelte';
  import BackgroundDecor from './components/BackgroundDecor.svelte';

  const loaded = loadState();
  let state = loaded.state;
  const storagePersistent = loaded.persistent;
  let lastSaveOk = true;

  function persist(nextState: AppState) {
    lastSaveOk = saveState(nextState);
  }

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
    persist(state);
    closeForm();
  }

  function onDelete(course: Course) {
    deleteTarget = { id: course.id, name: course.name };
    showDeleteDialog = true;
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    state = deleteCourse(state, deleteTarget.id);
    persist(state);
    showDeleteDialog = false;
    deleteTarget = null;
  }

  function onReset() {
    state = resetState();
    persist(state);
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
      persist(state);
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
      persist(state);
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
    persist(state);
    taskDeleteOpen = false;
    taskDeleteTrigger?.focus();
    taskDeleteTarget = null;
    taskDeleteTrigger = null;
  }

  function onImportConfirmed(nextState: AppState) {
    state = nextState;
    persist(state);
  }
</script>

<BackgroundDecor />

<main class="main">
  <StorageNotice persistent={storagePersistent} {lastSaveOk} />

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
          persist(state);
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

  <DataTools {state} onImportConfirmed={onImportConfirmed} />

  <dialog bind:this={deleteDialog} class="dialog">
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

  <dialog bind:this={resetDialog} class="dialog">
    <p class="dialog__body">Reset ke jadwal default? Semua perubahan dan tugas akan hilang.</p>
    <div class="dialog__actions">
      <button type="button" class="button-cancel" onclick={() => { showResetDialog = false; }}>Batal</button>
      <button type="button" class="button-delete" onclick={onReset}>Reset</button>
    </div>
  </dialog>

  <dialog bind:this={headerDialog} class="dialog">
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

  <dialog bind:this={taskDeleteDialog} class="dialog">
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
  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-5);
    position: relative;
    z-index: 1;
  }

  @media (min-width: 768px) {
    .main {
      padding: var(--space-8) var(--space-7);
    }
  }

  .button-add {
    font-size: var(--font-size-body);
    padding: var(--space-3) var(--space-6);
    background: var(--navy);
    color: var(--text-on-navy);
    border: none;
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-weight: 700;
    margin-bottom: var(--space-6);
    box-shadow: var(--shadow-soft);
  }

  .button-add:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .button-add:hover {
    background: var(--royal);
    box-shadow: var(--shadow-medium);
  }

  .empty {
    color: var(--text-muted);
    font-size: var(--font-size-body);
    margin: var(--space-5) 0;
    padding: var(--space-5);
    background: var(--bg-card);
    border-radius: var(--radius-md);
    border: var(--border-thin) solid var(--grid-gray);
    text-align: center;
  }

  .dialog {
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    color: var(--text);
    padding: var(--space-6);
    max-width: var(--form-max-width);
    width: calc(100% - var(--space-4) * 2);
    box-shadow: var(--shadow-medium);
  }

  .dialog::backdrop {
    background: rgba(16, 52, 111, 0.5);
  }

  .dialog__title {
    font-size: var(--font-size-h2);
    font-weight: 700;
    margin: 0 0 var(--space-5) 0;
    color: var(--navy);
  }

  .dialog__body {
    font-size: var(--font-size-body);
    line-height: var(--line-height-loose);
    margin: 0 0 var(--space-5) 0;
  }

  .dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    margin: 0;
  }

  .dialog__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
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

  .button-cancel,
  .button-delete,
  .button-primary {
    font-size: var(--font-size-body);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-weight: 600;
    min-width: 100px;
  }

  .button-cancel {
    background: transparent;
    color: var(--text);
    border: var(--border-thin) solid var(--grid-gray);
  }

  .button-cancel:hover {
    background: var(--grid-gray);
  }

  .button-delete {
    background: transparent;
    color: var(--text);
    border: var(--border-thin) solid var(--grid-gray);
  }

  .button-delete:hover {
    border-color: var(--red);
    color: var(--red);
  }

  .button-primary {
    background: var(--navy);
    color: var(--text-on-navy);
    border: none;
  }

  .button-primary:hover {
    background: var(--royal);
  }

  .button-cancel:focus-visible,
  .button-delete:focus-visible,
  .button-primary:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>

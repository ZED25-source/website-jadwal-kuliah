<script lang="ts">
  // Komponen utama aplikasi Jadwal Kuliah.
  // Mengelola state global (jadwal, tugas, meta header), menyimpan ke localStorage,
  // dan mengatur seluruh alur UI: form mata kuliah/tugas, dialog konfirmasi, dan ticker waktu WIB.
  import { loadState, saveState } from './lib/storage';
  import { addCourse, updateCourse, deleteCourse, countTasksOf, updateMeta, resetState } from './lib/actions';
  import { addTask, toggleTask, deleteTask, validateTaskForm } from './lib/tasks';
  import { validateMetaForm } from './lib/validation';
  import { groupByDay, totalSks } from './lib/schedule';
  import { todayWib } from './lib/view';
  import { getJakartaParts } from './lib/today';
  import type { Course, Task, AppState } from './lib/types';
  import Header from './components/Header.svelte';
  import Hero from './components/Hero.svelte';
  import WeekOverview from './components/WeekOverview.svelte';
  import DayGroup from './components/DayGroup.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import CourseForm from './components/CourseForm.svelte';
  import StorageNotice from './components/StorageNotice.svelte';
  import BackgroundDecor from './components/BackgroundDecor.svelte';
  import { onMount } from 'svelte';

  // Muat state awal dari localStorage; jika kosong/berkas rusak, gunakan default.
  const loaded = loadState();
  let stateStore = $state(loaded.state);
  const storagePersistent = loaded.persistent;
  let lastSaveOk = $state(true);

  // Dev-only: override waktu saat ini via parameter URL ?now=... (tetap statis, tidak bertick)
  let overrideNow: Date | undefined = undefined;
  if (import.meta.env.DEV) {
    const params = new URLSearchParams(window.location.search);
    const nowParam = params.get('now');
    if (nowParam) {
      const parsed = new Date(nowParam);
      if (!isNaN(parsed.getTime())) {
        overrideNow = parsed;
      }
    }
  }

  // Simpan state ke localStorage dan catat apakah penyimpanan berhasil.
  function persist(nextState: AppState) {
    lastSaveOk = saveState(nextState);
  }

  // State reaktif turunan dari stateStore.
  let appState = $derived(stateStore);

  let meta = $derived(appState.meta);
  let courses = $derived(appState.courses);

  // Tampilan form tambah/edit mata kuliah.
  let showForm = $state(false);
  let editingId = $state<string | null>(null);

  // Dialog konfirmasi hapus mata kuliah.
  let showDeleteDialog = $state(false);
  let deleteTarget = $state<{ id: string; name: string } | null>(null);

  // Dialog konfirmasi reset ke jadwal default.
  let showResetDialog = $state(false);

  // Dialog edit header (judul, program, semester).
  let showHeaderDialog = $state(false);
  let headerValues = $state({ title: '', program: '', semester: '' });
  let headerErrors = $state<Partial<Record<'title' | 'program' | 'semester', string>>>({});

  let deleteDialog: HTMLDialogElement;
  let resetDialog: HTMLDialogElement;
  let headerDialog: HTMLDialogElement;

  // State form tambah tugas.
  let taskFormCourseId = $state<string | null>(null);
  let taskValues = $state({ title: '', due: '', dueTime: '' });
  let taskErrors = $state<Partial<Record<'title' | 'due' | 'dueTime', string>>>({});
  let taskFormTrigger = $state<HTMLButtonElement | null>(null);

  // Dialog konfirmasi hapus tugas.
  let taskDeleteOpen = $state(false);
  let taskDeleteTarget = $state<{ id: string; title: string; courseId: string } | null>(null);
  let taskDeleteTrigger = $state<HTMLButtonElement | null>(null);
  let taskDeleteDialog: HTMLDialogElement;

  // Data turunan: total SKS, pengelompokan per hari, hari ini, dan apakah hari ini kosong.
  let sksTotal = $derived(totalSks(courses));
  let groups = $derived(groupByDay(courses));
  let today = $derived(todayWib());
  let todayDay = $derived(getJakartaParts(new Date()).day);
  let todayEmpty = $derived(courses.length > 0 && !groups.some((g) => g.day === today));

  // Sinkronisasi visibility dialog dengan status state.
  $effect(() => {
    if (showDeleteDialog) deleteDialog?.showModal();
    if (!showDeleteDialog) deleteDialog?.close();
  });
  $effect(() => {
    if (showResetDialog) resetDialog?.showModal();
    if (!showResetDialog) resetDialog?.close();
  });
  $effect(() => {
    if (showHeaderDialog) headerDialog?.showModal();
    if (!showHeaderDialog) headerDialog?.close();
  });
  $effect(() => {
    if (taskDeleteOpen) taskDeleteDialog?.showModal();
    if (!taskDeleteOpen) taskDeleteDialog?.close();
  });

  // Buka form tambah mata kuliah baru.
  function openAddForm() {
    editingId = null;
    showForm = true;
  }

  // Buka form edit mata kuliah yang ada.
  function openEditForm(course: Course) {
    editingId = course.id;
    showForm = true;
  }

  function closeForm() {
    showForm = false;
    editingId = null;
  }

  // Simpan mata kuliah (edit atau tambah baru), lalu persist dan tutup form.
  function onFormSave(values: Omit<Course, 'id'>) {
    if (editingId) {
      stateStore = updateCourse(appState, editingId, values);
    } else {
      stateStore = addCourse(appState, values);
    }
    persist(appState);
    closeForm();
  }

  // Buka dialog konfirmasi hapus mata kuliah.
  function onDelete(course: Course) {
    deleteTarget = { id: course.id, name: course.name };
    showDeleteDialog = true;
  }

  // Hapus mata kuliah (dan tugas terkait) dari state, lalu persist.
  function confirmDelete() {
    if (!deleteTarget) return;
    stateStore = deleteCourse(appState, deleteTarget.id);
    persist(appState);
    showDeleteDialog = false;
    deleteTarget = null;
  }

  // Reset state ke jadwal default, lalu persist.
  function onReset() {
    stateStore = resetState();
    persist(appState);
    showResetDialog = false;
  }

  // Isi form dialog header dengan nilai meta saat ini dan buka dialog.
  function openHeaderDialog() {
    headerValues = { title: meta.title, program: meta.program, semester: meta.semester };
    headerErrors = {};
    showHeaderDialog = true;
  }

  function closeHeaderDialog() {
    showHeaderDialog = false;
  }

  // Validasi dan simpan perubahan header, lalu persist.
  function onHeaderSubmit() {
    const result = validateMetaForm(headerValues);
    if (result.ok) {
      stateStore = updateMeta(appState, result.value);
      persist(appState);
      closeHeaderDialog();
    } else {
      headerErrors = result.errors;
    }
  }

  // Perbarui nilai input header dan hapus error pada field yang diubah.
  function onHeaderInputChange(field: 'title' | 'program' | 'semester', value: string) {
    headerValues = { ...headerValues, [field]: value };
    if (headerErrors[field]) {
      const newErrors = { ...headerErrors };
      delete newErrors[field];
      headerErrors = newErrors;
    }
  }

  // Buka form tambah tugas untuk mata kuliah tertentu.
  function openTaskForm(courseId: string, trigger: HTMLButtonElement) {
    taskFormCourseId = courseId;
    taskFormTrigger = trigger;
    taskValues = { title: '', due: '', dueTime: '' };
    taskErrors = {};
  }

  // Tutup form tugas dan kembalikan fokus ke tombol pemicu.
  function closeTaskForm() {
    taskFormTrigger?.focus();
    taskFormTrigger = null;
    taskFormCourseId = null;
  }

  // Perbarui nilai input form tugas dan hapus error pada field yang diubah.
  function onTaskInputChange(field: 'title' | 'due' | 'dueTime', value: string) {
    taskValues = { ...taskValues, [field]: value };
    if (field === 'due' && value === '') {
      taskValues = { ...taskValues, dueTime: '' };
    }
    if (taskErrors[field]) {
      const newErrors = { ...taskErrors };
      delete newErrors[field];
      taskErrors = newErrors;
    }
  }

  // Simpan tugas baru, lalu persist dan tutup form.
  function onTaskSave() {
    if (!taskFormCourseId) return;
    const result = validateTaskForm(taskValues);
    if (result.ok) {
      stateStore = addTask(appState, taskFormCourseId, result.value);
      persist(appState);
      closeTaskForm();
    } else {
      taskErrors = result.errors;
    }
  }

  // Buka dialog konfirmasi hapus tugas.
  function openTaskDelete(task: Task, trigger: HTMLButtonElement) {
    taskDeleteTarget = { id: task.id, title: task.title, courseId: task.courseId };
    taskDeleteTrigger = trigger;
    taskDeleteOpen = true;
  }

  // Hapus tugas dari state, lalu persist.
  function confirmTaskDelete() {
    if (!taskDeleteTarget) return;
    stateStore = deleteTask(appState, taskDeleteTarget.id);
    persist(appState);
    taskDeleteOpen = false;
    taskDeleteTrigger?.focus();
    taskDeleteTarget = null;
    taskDeleteTrigger = null;
  }

  // Terapkan state hasil impor JSON dan persist.
  function onImportConfirmed(nextState: AppState) {
    stateStore = nextState;
    persist(appState);
  }

  // Tambah tugas dari sidebar langsung ke state, lalu persist.
  function handleSidebarAddTask(courseId: string, value: { title: string; due?: string; dueTime?: string }) {
    stateStore = addTask(appState, courseId, value);
    persist(appState);
  }

  // Sumber waktu tunggal untuk seluruh aplikasi (WIB). Override ?now= tetap statis;
  // selain itu bertick setiap 60 detik.
  let currentTime = $state(overrideNow ?? new Date());

  onMount(() => {
    if (overrideNow) return; // jangan bertick saat waktu di-override
    const interval = window.setInterval(() => {
      currentTime = new Date();
    }, 60000);
    return () => {
      if (interval) clearInterval(interval);
    };
  });
</script>

<div class="app">
  <BackgroundDecor />

  <Header {meta} totalSks={sksTotal} onEditHeader={openHeaderDialog} />

  <div class="page">
    <StorageNotice persistent={storagePersistent} {lastSaveOk} />

    <div class="layout">
      <main>
      {#if courses.length > 0}
        <Hero {appState} {currentTime} />

        <div class="week-overview-wrapper">
          <WeekOverview
            {appState}
            {todayDay}
            onDelete={onDelete}
            onEdit={openEditForm}
            onAddTask={openTaskForm}
            onToggleTask={(id) => {
              stateStore = toggleTask(appState, id);
              persist(appState);
            }}
            onDeleteTask={(taskId, trigger) => {
              const task = appState.tasks.find((t) => t.id === taskId);
              if (task) openTaskDelete(task, trigger);
            }}
            taskFormCourseId={taskFormCourseId}
            {taskValues}
            {taskErrors}
            onTaskInputChange={onTaskInputChange}
            onTaskSave={onTaskSave}
            onTaskClose={closeTaskForm}
          />
        </div>
      {:else}
        <p class="empty">Belum ada jadwal mata kuliah.</p>
      {/if}

      <div class="day-groups-wrapper">
        {#if courses.length > 0}
          {#if todayEmpty}
            <p class="empty">Tidak ada kuliah hari ini</p>
          {/if}
          {#each groups as group}
            <DayGroup
              day={group.day}
              courses={group.courses}
              isToday={group.day === today}
              state={appState}
              onDelete={onDelete}
              onEdit={openEditForm}
              onAddTask={openTaskForm}
              onToggleTask={(id) => {
                stateStore = toggleTask(appState, id);
                persist(appState);
              }}
              onDeleteTask={(taskId, trigger) => {
                const task = appState.tasks.find((t) => t.id === taskId);
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
      </div>
      </main>

      <aside>
        <Sidebar
          {appState}
          onAddCourse={openAddForm}
          onToggleTask={(id) => {
            stateStore = toggleTask(appState, id);
            persist(appState);
          }}
          onDeleteTask={(task, trigger) => openTaskDelete(task, trigger)}
          onAddTask={handleSidebarAddTask}
          {onImportConfirmed}
          {currentTime}
        />
      </aside>
    </div>
  </div>

  {#if showForm}
    <CourseForm
      open={showForm}
      course={editingId ? courses.find((c) => c.id === editingId) ?? undefined : null}
      courses={courses}
      onSave={onFormSave}
      onClose={closeForm}
    />
  {/if}

  <dialog bind:this={deleteDialog} class="dialog">
    {#if deleteTarget}
      <p class="dialog__body">
        Hapus "{deleteTarget.name}"?
        <br />
        {countTasksOf(appState, deleteTarget.id) === 0
          ? 'Tidak ada tugas yang terhapus.'
          : `Tugas yang ikut terhapus: ${countTasksOf(appState, deleteTarget.id)}`}
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
</div>

<style>
  .app {
    position: relative;
    isolation: isolate;
  }

  .page {
    position: relative;
    z-index: 1;
    max-width: 1440px;
    margin-inline: auto;
    padding-inline: var(--space-5);
  }

  @media (min-width: 768px) {
    .page {
      padding-inline: var(--space-7);
    }
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
    align-items: start;
    padding: var(--space-4) 0;
  }

  @media (min-width: 1360px) {
    .layout {
      grid-template-columns: minmax(0, 1fr) 280px;
    }

    aside {
      position: sticky;
      top: var(--space-5);
      max-height: calc(100vh - 2 * var(--space-5));
      overflow-y: auto;
    }
  }

  main,
  aside {
    min-width: 0;
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

  .week-overview-wrapper {
    display: block;
  }

  .day-groups-wrapper {
    display: none;
  }

  @media (max-width: 639px) {
    .week-overview-wrapper {
      display: none;
    }

    .day-groups-wrapper {
      display: block;
    }
  }
</style>



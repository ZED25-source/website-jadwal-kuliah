<script lang="ts">
  import type { AppState } from '../lib/types';
  import { exportState, parseImport } from '../lib/transfer';

  export let state: AppState;
  export let onImportConfirmed: (nextState: AppState) => void = () => {};

  let importError = '';
  let importPreview: {
    courseCount: number;
    taskCount: number;
    droppedCourses: number;
    droppedTasks: number;
    state: AppState;
  } | null = null;
  let importDialogOpen = false;
  let fileInput: HTMLInputElement;
  let importTrigger: HTMLButtonElement | null = null;
  let importDialog: HTMLDialogElement;

  $: if (importDialogOpen) importDialog?.showModal();
  $: if (!importDialogOpen) importDialog?.close();

  function handleExport() {
    const json = exportState(state);
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jadwal-kuliah-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function openImport(trigger: HTMLButtonElement) {
    importTrigger = trigger;
    importError = '';
    importPreview = null;
    fileInput.value = '';
    importDialogOpen = true;
  }

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const result = parseImport(text);
      if (result.ok) {
        importPreview = {
          courseCount: result.courseCount,
          taskCount: result.taskCount,
          droppedCourses: result.droppedCourses,
          droppedTasks: result.droppedTasks,
          state: result.state,
        };
        importError = '';
        importDialogOpen = true;
      } else {
        importError = result.error;
        importPreview = null;
      }
    };
    reader.onerror = () => {
      importError = 'File tidak dapat dibaca.';
      importPreview = null;
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    if (!importPreview) return;
    onImportConfirmed(importPreview.state);
    importDialogOpen = false;
    importPreview = null;
    importDialog?.close();
    importTrigger?.focus();
    importTrigger = null;
    fileInput.value = '';
  }

  function cancelImport() {
    importPreview = null;
    importError = '';
    importDialogOpen = false;
    importDialog?.close();
    importTrigger?.focus();
    importTrigger = null;
    fileInput.value = '';
  }
</script>

<section class="data-tools">
  <button type="button" class="data-tools__button data-tools__button--export" onclick={handleExport}>
    Ekspor JSON
  </button>
  <button type="button" class="data-tools__button data-tools__button--import" onclick={(e) => openImport(e.currentTarget as HTMLButtonElement)}>
    Impor JSON
  </button>
  <input
    type="file"
    bind:this={fileInput}
    accept=".json,application/json"
    onchange={onFileChange}
    class="data-tools__file-input"
    style="display: none;"
    aria-hidden="true"
  />

  {#if importError}
    <p role="alert" class="data-tools__error">{importError}</p>
  {/if}

  <dialog bind:this={importDialog}>
    {#if importPreview}
      <p class="data-tools__dialog__body">
        Yakin ingin mengimpor data ini?<br />
        {importPreview.courseCount} mata kuliah dan {importPreview.taskCount} tugas akan dimuat.<br />
        {importPreview.droppedCourses > 0 || importPreview.droppedTasks > 0
          ? `${importPreview.droppedCourses} mata kuliah dan ${importPreview.droppedTasks} tugas tidak valid akan dibuang.`
          : 'Semua data valid.'}
        <br />
        Data saat ini akan diganti.
      </p>
    {/if}
    <div class="data-tools__dialog__actions">
      <button type="button" class="button-cancel" onclick={cancelImport}>Batal</button>
      <button type="button" class="button-delete" onclick={confirmImport}>Impor</button>
    </div>
  </dialog>
</section>

<style>
  .data-tools {
    margin-top: var(--space-6);
    padding-top: var(--space-3);
    border-top: 1px solid var(--text-muted);
    display: flex;
    gap: var(--space-1);
    flex-wrap: wrap;
  }

  .data-tools__button {
    font-size: var(--font-size-caption);
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--text-muted);
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
  }

  .data-tools__button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .data-tools__button:hover {
    background: var(--bg);
  }

  .data-tools__error {
    font-size: var(--font-size-caption);
    color: var(--accent);
    margin: var(--space-1) 0 0 0;
  }

  .data-tools__dialog__body {
    margin: 0 0 var(--space-2) 0;
    font-size: var(--font-size-body);
    color: var(--text);
  }

  .data-tools__dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin: 0;
  }
</style>

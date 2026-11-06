<script lang="ts">
  import type { Course, Day } from '../lib/types';
  import type { CourseFormValues } from '../lib/validation';
  import { validateCourseForm } from '../lib/validation';
  import { findConflicts, toMinutes } from '../lib/schedule';
  import { DAYS } from '../lib/types';

  export let open = false;
  export let course: Course | null = null;
  export let courses: Course[] = [];
  export let onSave: (values: Omit<Course, 'id'>) => void = () => {};
  export let onClose: () => void = () => {};

  let values: CourseFormValues = {
    day: '', start: '', end: '', code: '', name: '', sks: '', pj: '', pd1: '', room: ''
  };
  let errors: Partial<Record<keyof CourseFormValues, string>> = {};
  let conflictNames: string[] = [];
  let needsFocus = false;
  let hariField: HTMLSelectElement;

  function closeForm() {
    open = false;
    onClose();
  }

  function onInputChange(field: keyof CourseFormValues, value: string) {
    values = { ...values, [field]: value };
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      errors = newErrors;
    }
  }

  function onSubmit() {
    const result = validateCourseForm(values);
    if (result.ok) {
      onSave(result.value);
    } else {
      errors = result.errors;
    }
  }

  $: {
    conflictNames = [];
    if (values.day && values.start && values.end && !errors.day && !errors.start && !errors.end) {
      const dayValid = DAYS.includes(values.day as Day);
      if (dayValid) {
        const startM = toMinutes(values.start);
        const endM = toMinutes(values.end);
        if (endM > startM) {
          const conflicts = findConflicts(
            { id: course?.id ?? '', day: values.day as Day, start: values.start, end: values.end, name: values.name },
            courses
          );
          conflictNames = conflicts.map((c) => c.name);
        }
      }
    }
  }

  $: if (open && needsFocus && hariField) {
    hariField.focus();
    needsFocus = false;
  }
</script>

{#if open}
    <dialog class="form-dialog" open={open}>
    <h2 class="form-dialog__title">{course ? 'Ubah Mata Kuliah' : 'Tambah Mata Kuliah'}</h2>
    <form class="form-dialog__form" onsubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div class="form-field">
        <label class="form-field__label" for="field-hari">
          Hari <span class="form-field__required">(wajib)</span>
        </label>
        <select
          id="field-hari"
          bind:this={hariField}
          bind:value={values.day}
          onchange={(e) => onInputChange('day', (e.target as HTMLSelectElement).value)}
          aria-invalid={!!errors.day}
          aria-describedby={errors.day ? 'error-day' : undefined}
        >
          <option value="">Pilih hari</option>
          {#each DAYS as day}
            <option value={day}>{day}</option>
          {/each}
        </select>
        {#if errors.day}
          <p id="error-day" class="form-field__error">{errors.day}</p>
        {/if}
      </div>

      <div class="form-field">
        <label class="form-field__label" for="field-start">
          Jam Mulai <span class="form-field__required">(wajib)</span>
        </label>
        <input
          id="field-start"
          type="time"
          bind:value={values.start}
          oninput={(e) => onInputChange('start', (e.target as HTMLInputElement).value)}
          aria-invalid={!!errors.start}
          aria-describedby={errors.start ? 'error-start' : undefined}
        />
        {#if errors.start}
          <p id="error-start" class="form-field__error">{errors.start}</p>
        {/if}
      </div>

      <div class="form-field">
        <label class="form-field__label" for="field-end">
          Jam Selesai <span class="form-field__required">(wajib)</span>
        </label>
        <input
          id="field-end"
          type="time"
          bind:value={values.end}
          oninput={(e) => onInputChange('end', (e.target as HTMLInputElement).value)}
          aria-invalid={!!errors.end}
          aria-describedby={errors.end ? 'error-end' : undefined}
        />
        {#if errors.end}
          <p id="error-end" class="form-field__error">{errors.end}</p>
        {/if}
      </div>

      <div class="form-field">
        <label class="form-field__label" for="field-name">
          Nama Mata Kuliah <span class="form-field__required">(wajib)</span>
        </label>
        <input
          id="field-name"
          type="text"
          bind:value={values.name}
          oninput={(e) => onInputChange('name', (e.target as HTMLInputElement).value)}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'error-name' : undefined}
        />
        {#if errors.name}
          <p id="error-name" class="form-field__error">{errors.name}</p>
        {/if}
      </div>

      <div class="form-field">
        <label class="form-field__label" for="field-code">Kode Mata Kuliah</label>
        <input
          id="field-code"
          type="text"
          bind:value={values.code}
          oninput={(e) => onInputChange('code', (e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="form-field">
        <label class="form-field__label" for="field-sks">SKS</label>
        <input
          id="field-sks"
          type="text"
          inputmode="numeric"
          bind:value={values.sks}
          oninput={(e) => onInputChange('sks', (e.target as HTMLInputElement).value)}
          aria-invalid={!!errors.sks}
          aria-describedby={errors.sks ? 'error-sks' : undefined}
        />
        {#if errors.sks}
          <p id="error-sks" class="form-field__error">{errors.sks}</p>
        {/if}
      </div>

      <div class="form-field">
        <label class="form-field__label" for="field-pj">PJ</label>
        <input
          id="field-pj"
          type="text"
          bind:value={values.pj}
          oninput={(e) => onInputChange('pj', (e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="form-field">
        <label class="form-field__label" for="field-pd1">PD 1</label>
        <input
          id="field-pd1"
          type="text"
          bind:value={values.pd1}
          oninput={(e) => onInputChange('pd1', (e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="form-field">
        <label class="form-field__label" for="field-room">Ruang</label>
        <input
          id="field-room"
          type="text"
          bind:value={values.room}
          oninput={(e) => onInputChange('room', (e.target as HTMLInputElement).value)}
        />
      </div>

      {#if conflictNames.length > 0}
        <p role="status" class="form-dialog__conflict">
          Jadwal bentok dengan: {conflictNames.join(', ')}
        </p>
      {/if}

      <div class="form-dialog__actions">
        <button type="button" class="button button--secondary" onclick={closeForm}>Batal</button>
        <button type="submit" class="button button--primary">Simpan</button>
      </div>
    </form>
  </dialog>
{/if}

<style>
  .form-dialog {
    padding: var(--space-4);
    border: 1px solid var(--text-muted);
    border-radius: 4px;
    max-width: 65ch;
    width: 100%;
  }

  .form-dialog__title {
    font-size: var(--font-size-h2);
    line-height: var(--line-height-snug);
    font-weight: 600;
    margin: 0 0 var(--space-3) 0;
    color: var(--text);
  }

  .form-dialog__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
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

  .form-field input,
  .form-field select {
    font-size: var(--font-size-body);
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--text-muted);
    border-radius: 4px;
    background: var(--bg);
    color: var(--text);
    width: 100%;
    box-sizing: border-box;
  }

  .form-field input:focus-visible,
  .form-field select:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .form-field input[aria-invalid="true"],
  .form-field select[aria-invalid="true"] {
    border-color: var(--accent);
  }

  .form-field__error {
    font-size: var(--font-size-caption);
    color: var(--accent);
    margin: 0;
  }

  .form-dialog__conflict {
    font-size: var(--font-size-caption);
    color: var(--text-muted);
    margin: 0;
    padding: var(--space-2);
    border: 1px dashed var(--text-muted);
    border-radius: 4px;
  }

  .form-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-2);
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
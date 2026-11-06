<script lang="ts">
  import type { Course, AppState } from '../lib/types';
  import type { Day } from '../lib/types';
  import { groupByDay } from '../lib/schedule';
  import { tasksOf, openTaskCount } from '../lib/tasks';
  import CourseChip from './CourseChip.svelte';
  import CourseCard from './CourseCard.svelte';

  let {
    appState,
    todayDay,
    onDelete,
    onEdit,
    onAddTask,
    onToggleTask,
    onDeleteTask,
    taskFormCourseId,
    taskValues,
    taskErrors,
    onTaskInputChange,
    onTaskSave,
    onTaskClose
  }: {
    appState: AppState;
    todayDay: Day;
    onDelete: (course: Course) => void;
    onEdit: (course: Course) => void;
    onAddTask: (courseId: string, trigger: HTMLButtonElement) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string, trigger: HTMLButtonElement) => void;
    taskFormCourseId: string | null;
    taskValues: { title: string; due: string; dueTime?: string };
    taskErrors: Partial<Record<'title' | 'due' | 'dueTime', string>>;
    onTaskInputChange: (field: 'title' | 'due' | 'dueTime', value: string) => void;
    onTaskSave: () => void;
    onTaskClose: () => void;
  } = $props();

  let detailDialog: HTMLDialogElement;
  let selectedCourse = $state<Course | null>(null);
  let chipRefs: Map<string, HTMLButtonElement> = new Map();

  const groups = $derived(groupByDay(appState.courses));

  const dayColors: Record<Day, string> = {
    'Senin': 'navy',
    'Selasa': 'teal',
    'Rabu': 'green',
    'Kamis': 'orange',
    'Jumat': 'purple',
    'Sabtu': 'royal',
    'Minggu': 'royal',
  };

  function openDetail(course: Course, chipButton: HTMLButtonElement) {
    selectedCourse = course;
    chipRefs.set(course.id, chipButton);
    detailDialog?.showModal();
  }

  function closeDetail() {
    if (selectedCourse) {
      const chip = chipRefs.get(selectedCourse.id);
      chip?.focus();
    }
    selectedCourse = null;
    detailDialog?.close();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && selectedCourse) {
      closeDetail();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="week-overview" aria-label="Ringkasan mingguan">
  <h2 class="week-overview__title">Ringkasan Mingguan</h2>
  <div class="week-overview__grid">
    {#each groups as group}
      {@const isToday = group.day === todayDay}
      {@const dayColor = dayColors[group.day]}
      <div class="week-overview__day">
        <div class="week-overview__day-badge-slot">
          {#if isToday}
            <span class="week-overview__today-badge">Hari ini</span>
          {/if}
        </div>
        <h3 class="week-overview__day-title week-overview__day-title--{dayColor}">
          {group.day}
        </h3>
        <div class="week-overview__courses">
          {#each group.courses as course}
            {@const openCount = openTaskCount(appState, course.id)}
            <CourseChip
              {course}
              tasks={appState.tasks}
              {openCount}
              onclick={(e) => {
                const target = e.currentTarget;
                openDetail(course, target);
              }}
            />
          {/each}
        </div>
      </div>
    {/each}
  </div>
</section>

<dialog bind:this={detailDialog} class="detail-dialog" onclose={closeDetail}>
  {#if selectedCourse}
    <div class="detail-dialog__content">
      <div class="detail-dialog__header">
        <h3 class="detail-dialog__title">Detail Mata Kuliah</h3>
        <button
          type="button"
          class="detail-dialog__close"
          onclick={closeDetail}
          aria-label="Tutup detail"
        >
          ×
        </button>
      </div>
      <CourseCard
        course={selectedCourse}
        tasks={tasksOf(appState, selectedCourse.id)}
        openCount={openTaskCount(appState, selectedCourse.id)}
        onDelete={() => {
          onDelete(selectedCourse!);
          closeDetail();
        }}
        onEdit={() => {
          onEdit(selectedCourse!);
          closeDetail();
        }}
        onAddTask={onAddTask}
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        isAddingTask={taskFormCourseId === selectedCourse.id}
        {taskValues}
        {taskErrors}
        {onTaskInputChange}
        {onTaskSave}
        {onTaskClose}
        isEven={false}
      />
    </div>
  {/if}
</dialog>

<style>
  .week-overview {
    margin-bottom: var(--space-4);
  }

  .week-overview__title {
    font-size: var(--font-size-lead);
    font-weight: 700;
    color: var(--navy);
    margin: 0 0 var(--space-4) 0;
    line-height: 1.2;
  }

  .week-overview__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-4);
  }

  .week-overview__day {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .week-overview__day-badge-slot {
    min-height: 22px;
    display: flex;
    align-items: center;
  }

  .week-overview__today-badge {
    display: inline-block;
    align-self: flex-start;
    padding: 2px var(--space-2);
    background: var(--yellow);
    color: var(--navy);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-caption);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .week-overview__day-title {
    font-size: var(--font-size-body);
    font-weight: 700;
    margin: 0;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-pill);
    text-align: center;
    line-height: 1.2;
  }

  .week-overview__day-title--navy {
    background: var(--navy);
    color: var(--text-on-navy);
  }

  .week-overview__day-title--royal {
    background: var(--royal);
    color: var(--text-on-navy);
  }

  .week-overview__day-title--teal {
    background: var(--teal);
    color: var(--navy);
  }

  .week-overview__day-title--green {
    background: var(--green);
    color: var(--navy);
  }

  .week-overview__day-title--orange {
    background: var(--orange);
    color: var(--navy);
  }

  .week-overview__day-title--purple {
    background: var(--purple);
    color: var(--text-on-navy);
  }

  .week-overview__courses {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .detail-dialog {
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    color: var(--text);
    padding: 0;
    max-width: 800px;
    width: calc(100% - var(--space-4) * 2);
    max-height: calc(100vh - var(--space-8));
    overflow-y: auto;
    box-shadow: var(--shadow-medium);
  }

  .detail-dialog::backdrop {
    background: rgba(16, 52, 111, 0.5);
  }

  .detail-dialog__content {
    padding: var(--space-5);
  }

  .detail-dialog__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: var(--border-thin) solid var(--grid-gray);
  }

  .detail-dialog__title {
    font-size: var(--font-size-h3);
    font-weight: 700;
    color: var(--navy);
    margin: 0;
  }

  .detail-dialog__close {
    background: transparent;
    border: none;
    font-size: 2rem;
    line-height: 1;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
  }

  .detail-dialog__close:hover {
    color: var(--text);
    background: var(--grid-gray);
  }

  .detail-dialog__close:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (max-width: 639px) {
    .week-overview__title {
      font-size: var(--font-size-body);
    }

    .week-overview__grid {
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--space-3);
    }
  }
</style>

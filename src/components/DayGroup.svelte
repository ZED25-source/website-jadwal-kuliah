<script lang="ts">
  import type { AppState, Course, Day } from '../lib/types';
  import CourseCard from './CourseCard.svelte';
  import { tasksOf, openTaskCount } from '../lib/tasks';
  import Icons from './Icons.svelte';

  export let day: Day;
  export let courses: Course[];
  export let isToday: boolean;
  export let state: AppState;
  export let onDelete: (course: Course) => void = () => {};
  export let onEdit: (course: Course) => void = () => {};
  export let onAddTask: (courseId: string, trigger: HTMLButtonElement) => void = () => {};
  export let onToggleTask: (taskId: string) => void = () => {};
  export let onDeleteTask: (taskId: string, trigger: HTMLButtonElement) => void = () => {};
  export let taskFormCourseId: string | null = null;
  export let taskValues: { title: string; due: string; dueTime?: string } = { title: '', due: '' };
  export let taskErrors: Partial<Record<'title' | 'due' | 'dueTime', string>> = {};
  export let onTaskInputChange: (field: 'title' | 'due' | 'dueTime', value: string) => void = () => {};
  export let onTaskSave: () => void = () => {};
  export let onTaskClose: () => void = () => {};

  const dayColors: Record<Day, string> = {
    'Senin': 'navy',
    'Selasa': 'teal',
    'Rabu': 'green',
    'Kamis': 'orange',
    'Jumat': 'purple',
    'Sabtu': 'royal',
    'Minggu': 'royal',
  };

  type IconName = 'laptop' | 'book' | 'plant' | 'graduation' | 'calendar' | 'calculator' | 'atom' | 'book-open' | 'flask' | 'pushpin' | 'paperclip';

  const dayIcons: Record<Day, IconName> = {
    'Senin': 'book',
    'Selasa': 'calculator',
    'Rabu': 'atom',
    'Kamis': 'book-open',
    'Jumat': 'flask',
    'Sabtu': 'calendar',
    'Minggu': 'calendar',
  };

  $: dayColor = dayColors[day];
</script>

<section class="day-group" aria-current={isToday ? 'date' : undefined} class:day-group--today={isToday}>
  <div class="day-group__header">
    <div class="day-group__pill day-group__pill--{dayColor}">
      <span class="day-group__icon">
        <Icons name={dayIcons[day]} size={18} />
      </span>
      <h2 class="day-group__heading">{day}</h2>
    </div>
    {#if isToday}
      <span class="day-group__today-badge">Hari ini</span>
    {/if}
  </div>
  <div class="day-group__card">
    {#if courses.length > 0}
      <div class="day-group__grid">
        <div class="day-group__grid-header">
          <div class="day-group__col day-group__col--time"><span class="visually-hidden">Waktu</span>Waktu</div>
          <div class="day-group__col day-group__col--course"><span class="visually-hidden">Mata Kuliah</span>Mata Kuliah</div>
          <div class="day-group__col day-group__col--info"><span class="visually-hidden">Informasi</span>Info</div>
        </div>
        {#each courses as course, idx}
          <CourseCard
            {course}
            tasks={tasksOf(state, course.id)}
            openCount={openTaskCount(state, course.id)}
            onDelete={() => onDelete(course)}
            onEdit={() => onEdit(course)}
            onAddTask={onAddTask}
            onToggleTask={onToggleTask}
            onDeleteTask={onDeleteTask}
            isAddingTask={taskFormCourseId === course.id}
            {taskValues}
            {taskErrors}
            onTaskInputChange={onTaskInputChange}
            onTaskSave={onTaskSave}
            onTaskClose={onTaskClose}
            isEven={idx % 2 === 0}
          />
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .day-group {
    margin-bottom: var(--space-7);
  }

  .day-group--today {
    position: relative;
  }

  .day-group--today::before {
    content: '';
    position: absolute;
    left: -8px;
    top: -8px;
    right: -8px;
    bottom: -8px;
    border: var(--border-thick) solid var(--yellow);
    border-radius: var(--radius-lg);
    pointer-events: none;
  }

  .day-group__header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .day-group__pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-5);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-soft);
  }

  .day-group__pill--navy {
    background: var(--navy);
    color: var(--text-on-navy);
  }

  .day-group__pill--royal {
    background: var(--royal);
    color: var(--text-on-navy);
  }

  .day-group__pill--teal {
    background: var(--teal);
    color: var(--navy);
  }

  .day-group__pill--green {
    background: var(--green);
    color: var(--navy);
  }

  .day-group__pill--orange {
    background: var(--orange);
    color: var(--navy);
  }

  .day-group__pill--purple {
    background: var(--purple);
    color: var(--text-on-navy);
  }

  .day-group__icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .day-group__heading {
    font-size: var(--font-size-lead);
    line-height: var(--line-height-tight);
    font-weight: 700;
    margin: 0;
  }

  .day-group__today-badge {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    background: var(--yellow);
    color: var(--navy);
    border-radius: var(--radius-pill);
    font-size: var(--font-size-caption);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .day-group__card {
    background: var(--bg-card);
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-soft);
  }

  .day-group__grid {
    display: flex;
    flex-direction: column;
  }

  .day-group__grid-header {
    display: none;
  }
</style>

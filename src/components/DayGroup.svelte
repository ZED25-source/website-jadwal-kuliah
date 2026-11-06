<script lang="ts">
  import type { AppState, Course, Day } from '../lib/types';
  import CourseCard from './CourseCard.svelte';
  import { tasksOf, openTaskCount } from '../lib/tasks';

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
  export let taskValues: { title: string; due: string } = { title: '', due: '' };
  export let taskErrors: Partial<Record<'title' | 'due', string>> = {};
  export let onTaskInputChange: (field: 'title' | 'due', value: string) => void = () => {};
  export let onTaskSave: () => void = () => {};
  export let onTaskClose: () => void = () => {};
</script>

<section class="day-group" aria-current={isToday ? 'date' : undefined}>
  <h2 class="day-group__heading">
    {day}
    {#if isToday}
      <span class="day-group__today">Hari ini</span>
    {/if}
  </h2>
  <ul class="day-group__list">
    {#each courses as course}
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
      />
    {/each}
  </ul>
</section>

<style>
  .day-group {
    margin-bottom: var(--space-5);
  }

  .day-group__heading {
    font-size: var(--font-size-h2);
    line-height: var(--line-height-snug);
    font-weight: 600;
    margin: 0 0 var(--space-2) 0;
    color: var(--text);
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
  }

  .day-group__today {
    font-size: var(--font-size-caption);
    color: var(--accent);
    font-weight: 600;
  }

  .day-group__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>

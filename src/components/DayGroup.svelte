<script lang="ts">
  import type { Course, Day } from '../lib/types';
  import CourseCard from './CourseCard.svelte';

  export let day: Day;
  export let courses: Course[];
  export let isToday: boolean;
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
      <CourseCard {course} />
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

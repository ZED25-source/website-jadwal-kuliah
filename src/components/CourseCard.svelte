<script lang="ts">
  import type { Course } from '../lib/types';
  import { formatTime } from '../lib/view';

  export let course: Course;
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
    margin: 0;
  }

  .course__meta-item {
    display: inline-block;
  }
</style>

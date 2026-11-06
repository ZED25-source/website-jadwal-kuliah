<script lang="ts">
  import type { AppState } from '../lib/types';
  import { getJakartaParts, getTodayStatus, relativeDayLabel } from '../lib/today';
  import { formatTime } from '../lib/view';
  import { formatDue, sortOpenTasks, getJakartaDateKey } from '../lib/tasks';

  let { appState, currentTime }: { appState: AppState; currentTime: Date } = $props();

  const nowMinutes = $derived(getJakartaParts(currentTime).minutes);
  const jakartaParts = $derived(getJakartaParts(currentTime));
  const todayStatus = $derived(getTodayStatus(appState.courses, currentTime));
  const todayKey = $derived(getJakartaDateKey(currentTime));
  
  const openTasksSorted = $derived(sortOpenTasks(appState.tasks.filter(t => !t.done), todayKey, nowMinutes));
  const firstOpenTask = $derived(openTasksSorted[0] || null);
  
  const coursesCount = $derived(todayStatus.todayCourses.length);
  const allFinished = $derived(!todayStatus.currentId && !todayStatus.nextId && coursesCount > 0);
  
  const statusSummary = $derived(() => {
    if (coursesCount === 0) return 'Tidak ada kuliah hari ini';
    if (allFinished) return 'Semua kuliah hari ini sudah selesai';
    return `Ada ${coursesCount} kuliah hari ini`;
  });

  const openTasksToday = $derived(
    todayStatus.todayCourses.reduce((sum, course) => {
      const openCount = appState.tasks.filter(t => t.courseId === course.id && !t.done).length;
      return sum + openCount;
    }, 0)
  );
</script>

<section class="hero" aria-label="Kuliah hari ini">
  <div class="hero__left">
    <div class="hero__day-container">
      <h2 class="hero__day">{jakartaParts.day}</h2>
      <p class="hero__date">{jakartaParts.dateLabel}</p>
    </div>
    
    <p class="hero__summary">{statusSummary()}</p>
    
    {#if openTasksToday > 0}
      <div class="hero__task-badge hero__task-badge--danger" aria-label="{openTasksToday} tugas belum selesai">
        {openTasksToday} tugas belum selesai
      </div>
    {/if}
    
    {#if firstOpenTask}
      <p class="hero__deadline">
        Tenggat terdekat: <strong>{firstOpenTask.title}</strong>
        {#if firstOpenTask.due}
          · {formatDue(firstOpenTask)}
        {/if}
      </p>
    {/if}
  </div>

  <div class="hero__right">
    {#if coursesCount > 0 && !allFinished}
      <ul class="hero__list">
        {#each todayStatus.todayCourses as course}
          {@const isCurrent = course.id === todayStatus.currentId}
          {@const isNext = course.id === todayStatus.nextId}
          <li class="hero__item" class:hero__item--current={isCurrent} class:hero__item--next={isNext}>
            <div class="hero__time">{formatTime(course.start)}</div>
            <div class="hero__info">
              <div class="hero__name">{course.name}</div>
              {#if course.room}
                <div class="hero__room">{course.room}</div>
              {/if}
            </div>
            {#if isCurrent}
              <span class="hero__badge hero__badge--current">Sedang berlangsung</span>
            {:else if isNext}
              <span class="hero__badge hero__badge--next">Berikutnya</span>
            {/if}
          </li>
        {/each}
      </ul>
    {:else if todayStatus.nextCrossDay?.course}
      {@const nextCourse = todayStatus.nextCrossDay.course}
      {@const dayLabel = relativeDayLabel(jakartaParts.day, todayStatus.nextCrossDay.day)}
      <div class="hero__next-block">
        <h3 class="hero__next-title">Kuliah berikutnya</h3>
        <p class="hero__next-day">{dayLabel}, {todayStatus.nextCrossDay.day}</p>
        <p class="hero__next-time">
          {formatTime(nextCourse.start)} – {formatTime(nextCourse.end)}
        </p>
        <p class="hero__next-name">{nextCourse.name}</p>
        {#if nextCourse.room}
          <p class="hero__next-room">{nextCourse.room}</p>
        {/if}
      </div>
    {/if}
  </div>
</section>

<style>
  .hero {
    background: var(--bg-card);
    border: var(--border-medium) solid var(--navy);
    border-radius: var(--radius-lg);
    padding: calc(var(--space-6) * 0.85);
    margin-bottom: calc(var(--space-4) * 0.85);
    box-shadow: var(--shadow-medium);
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-5) * 0.85);
    --font-size-display: calc(var(--font-size-display) * 0.85);
    --font-size-h1: calc(var(--font-size-h1) * 0.85);
    --font-size-h2: calc(var(--font-size-h2) * 0.85);
    --font-size-h3: calc(var(--font-size-h3) * 0.85);
    --font-size-lead: calc(var(--font-size-lead) * 0.85);
    --font-size-body: calc(var(--font-size-body) * 0.85);
    --font-size-caption: calc(var(--font-size-caption) * 0.85);
  }

  @media (min-width: 768px) {
    .hero {
      flex-direction: row;
      gap: calc(var(--space-7) * 0.85);
      padding: calc(var(--space-7) * 0.85);
    }
  }

  .hero__left {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-4) * 0.85);
    flex: 1;
    min-width: 0;
  }

  .hero__right {
    flex: 1;
    min-width: 0;
  }

  .hero__day-container {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-2) * 0.85);
  }

  .hero__day {
    font-size: var(--font-size-display);
    font-weight: 800;
    color: var(--navy);
    margin: 0;
    line-height: 1.1;
    text-transform: uppercase;
    font-family: var(--font-display);
  }

  .hero__date {
    font-size: var(--font-size-lead);
    font-weight: 600;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.3;
  }

  .hero__summary {
    font-size: var(--font-size-h3);
    font-weight: 700;
    color: var(--navy);
    margin: 0;
    line-height: 1.2;
  }

  .hero__task-badge {
    display: inline-block;
    align-self: flex-start;
    padding: calc(var(--space-2) * 0.85) calc(var(--space-4) * 0.85);
    border-radius: var(--radius-pill);
    font-size: var(--font-size-body);
    font-weight: 700;
  }

  .hero__task-badge--danger {
    background: var(--danger);
    color: var(--on-danger);
  }

  .hero__deadline {
    font-size: var(--font-size-body);
    color: var(--text);
    margin: 0;
    line-height: 1.5;
  }

  .hero__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-3) * 0.85);
  }

  .hero__item {
    display: flex;
    align-items: center;
    gap: calc(var(--space-3) * 0.85);
    padding: calc(var(--space-4) * 0.85);
    background: var(--off-white);
    border-radius: var(--radius-md);
    border: var(--border-thin) solid var(--grid-gray);
  }

  @media (min-width: 768px) {
    .hero__item {
      flex-wrap: nowrap;
    }
  }

  .hero__item--current {
    background: rgba(85, 166, 78, 0.1);
    border-color: var(--green);
    border-width: var(--border-medium);
  }

  .hero__item--next {
    background: rgba(242, 165, 38, 0.1);
    border-color: var(--orange);
    border-width: var(--border-medium);
  }

  .hero__time {
    font-size: var(--font-size-h3);
    font-weight: 700;
    color: var(--royal);
    white-space: nowrap;
    min-width: calc(80px * 0.85);
  }

  .hero__info {
    flex: 1;
    min-width: 0;
  }

  .hero__name {
    font-size: var(--font-size-lead);
    font-weight: 700;
    color: var(--navy);
    overflow-wrap: break-word;
    line-height: 1.3;
  }

  .hero__room {
    font-size: var(--font-size-body);
    color: var(--text-muted);
    margin-top: calc(var(--space-1) * 0.85);
  }

  .hero__badge {
    display: inline-block;
    padding: calc(var(--space-1) * 0.85) calc(var(--space-3) * 0.85);
    border-radius: var(--radius-pill);
    font-size: var(--font-size-caption);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .hero__badge--current {
    background: var(--green);
    color: var(--navy);
  }

  .hero__badge--next {
    background: var(--orange);
    color: var(--navy);
  }

  .hero__next-block {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-2) * 0.85);
    padding: calc(var(--space-5) * 0.85);
    background: var(--light-blue);
    border-radius: var(--radius-md);
    border: var(--border-thin) solid var(--royal);
  }

  .hero__next-title {
    font-size: var(--font-size-body);
    font-weight: 700;
    color: var(--royal);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .hero__next-day {
    font-size: var(--font-size-h2);
    font-weight: 800;
    color: var(--navy);
    margin: 0;
    line-height: 1.1;
  }

  .hero__next-time {
    font-size: var(--font-size-h3);
    font-weight: 700;
    color: var(--royal);
    margin: 0;
    line-height: 1.2;
  }

  .hero__next-name {
    font-size: var(--font-size-lead);
    font-weight: 600;
    color: var(--navy);
    margin: 0;
    line-height: 1.3;
  }

  .hero__next-room {
    font-size: var(--font-size-body);
    color: var(--text-muted);
    margin: 0;
  }

  @media (max-width: 767px) {
    .hero {
      padding: calc(var(--space-5) * 0.85);
    }

    .hero__day {
      font-size: var(--font-size-h1);
    }

    .hero__summary {
      font-size: var(--font-size-lead);
    }

    .hero__time {
      font-size: var(--font-size-lead);
      min-width: auto;
    }

    .hero__name {
      font-size: var(--font-size-body);
    }

    .hero__next-day {
      font-size: var(--font-size-h3);
    }

    .hero__next-time {
      font-size: var(--font-size-lead);
    }
  }
</style>

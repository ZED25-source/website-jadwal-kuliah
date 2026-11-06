<script lang="ts">
  import { loadState } from './lib/storage';
  import { totalSks, groupByDay } from './lib/schedule';
  import { todayWib } from './lib/view';
  import Header from './components/Header.svelte';
  import DayGroup from './components/DayGroup.svelte';
  import Motivation from './components/Motivation.svelte';

  const { state } = loadState();
  const { meta, courses } = state;
  const sksTotal = totalSks(courses);
  const groups = groupByDay(courses);
  const today = todayWib();
  const todayEmpty = courses.length > 0 && !groups.some((g) => g.day === today);
</script>

<main>
  <Header {meta} totalSks={sksTotal} />

  {#if courses.length === 0}
    <p class="empty">Belum ada jadwal mata kuliah.</p>
  {:else}
    {#if todayEmpty}
      <p class="empty">Tidak ada kuliah hari ini</p>
    {/if}
    {#each groups as group}
      <DayGroup day={group.day} courses={group.courses} isToday={group.day === today} />
    {/each}
  {/if}

  <Motivation />
</main>

<style>
  .empty {
    color: var(--text-muted);
    font-size: var(--font-size-body);
    margin-top: var(--space-3);
  }
</style>

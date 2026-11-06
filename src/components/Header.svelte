<script lang="ts">
  import type { AppState } from '../lib/types';

  export let meta: AppState['meta'];
  export let totalSks: number;
</script>

<header class="header">
  <h1 class="header__title">{meta.title}</h1>
  <p class="header__meta">{meta.program} · {meta.semester}</p>
  <p class="header__sks">Total SKS: {totalSks}</p>
</header>

<style>
  .header {
    margin-bottom: var(--space-5);
  }

  .header__title {
    font-size: var(--font-size-h1);
    line-height: var(--line-height-tight);
    font-weight: 600;
    margin: 0 0 var(--space-2) 0;
  }

  .header__meta {
    font-size: var(--font-size-body);
    line-height: var(--line-height-loose);
    color: var(--text-muted);
    margin: 0 0 var(--space-1) 0;
  }

  .header__sks {
    font-size: var(--font-size-body);
    line-height: var(--line-height-loose);
    color: var(--text);
    margin: 0;
    font-weight: 600;
  }
</style>

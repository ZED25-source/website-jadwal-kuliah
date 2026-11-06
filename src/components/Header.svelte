<script lang="ts">
  import type { AppState } from '../lib/types';

  export let meta: AppState['meta'];
  export let totalSks: number;
  export let onEditHeader: () => void = () => {};
</script>

<header class="header">
  <h1 class="header__title">{meta.title}</h1>
  <p class="header__meta">{meta.program} · {meta.semester}</p>
  <p class="header__sks">Total SKS: {totalSks}</p>
  <button class="header__edit" onclick={() => onEditHeader()}>Ubah header</button>
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

  .header__edit {
    font-size: var(--font-size-caption);
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 0.2em;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-top: var(--space-1);
  }

  .header__edit:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .header__edit:hover {
    color: var(--accent-hover);
  }
</style>

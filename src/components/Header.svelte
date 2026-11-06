<script lang="ts">
  import type { AppState } from '../lib/types';

  export let meta: AppState['meta'];
  export let totalSks: number;
  export let onEditHeader: () => void = () => {};
</script>

<header class="header">
  <div class="header__inner">
    <div class="header__title-group">
      <h1 class="header__title">{meta.title}</h1>
      <div class="header__badges">
        <span class="header__badge">{meta.program}</span>
        <span class="header__badge">{meta.semester}</span>
      </div>
    </div>

    <div class="header__sks">
      <span class="header__sks-label">Total SKS</span>
      <span class="header__sks-value" aria-label="Total SKS {totalSks}">{totalSks}</span>
    </div>

    <button class="header__edit" onclick={() => onEditHeader()}>Ubah header</button>
  </div>
</header>

<style>
  .header {
    background: var(--navy);
    color: var(--text-on-navy);
    margin-bottom: var(--space-7);
    padding: var(--space-7) 0;
  }

  .header__inner {
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .header__inner {
      padding-inline: var(--space-7);
    }
  }

  .header__title {
    font-family: var(--font-display);
    font-size: var(--font-size-display);
    font-weight: 800;
    text-transform: uppercase;
    color: var(--text-on-navy);
    line-height: var(--line-height-tight);
    letter-spacing: -0.02em;
    margin: 0;
  }

  .header__badges {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .header__badge {
    display: inline-block;
    padding: var(--space-2) var(--space-5);
    background: var(--bg-card);
    color: var(--navy);
    border-radius: var(--radius-pill);
    font-size: var(--font-size-body);
    font-weight: 600;
    line-height: var(--line-height-tight);
    white-space: nowrap;
  }

  .header__sks {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    align-items: flex-start;
  }

  .header__sks-label {
    font-size: var(--font-size-caption);
    font-weight: 700;
    color: var(--text-on-navy);
    opacity: 0.9;
    white-space: nowrap;
  }

  .header__sks-value {
    font-size: var(--font-size-h1);
    font-weight: 800;
    color: var(--text-on-navy);
    line-height: 1;
    white-space: nowrap;
  }

  .header__edit {
    font-size: var(--font-size-body);
    color: var(--text-on-navy);
    background: transparent;
    border: var(--border-thin) solid var(--text-on-navy);
    border-radius: var(--radius-pill);
    padding: var(--space-2) var(--space-5);
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }

  .header__edit:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .header__edit:hover {
    background: var(--text-on-navy);
    color: var(--navy);
  }
</style>

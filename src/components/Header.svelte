<script lang="ts">
  import type { AppState } from '../lib/types';

  export let meta: AppState['meta'];
  export let totalSks: number;
  export let onEditHeader: () => void = () => {};
</script>

<header class="header">
  <div class="header__inner">
    <div class="header__left">
      <h1 class="header__title">{meta.title}</h1>
      <div class="header__badges">
        <span class="header__badge">{meta.program}</span>
        <span class="header__badge">{meta.semester}</span>
      </div>
    </div>

    <div class="header__right">
      <div class="header__sks">
        <span class="header__sks-label">Total SKS</span>
        <span class="header__sks-value" aria-label="Total SKS {totalSks}">{totalSks}</span>
      </div>

      <button class="header__edit" onclick={() => onEditHeader()}>Ubah header</button>
    </div>
  </div>
</header>

<style>
  .header {
    background: var(--navy);
    color: var(--text-on-navy);
    margin-bottom: 0;
    padding: var(--space-4) 0;
    position: relative;
    z-index: 1;
  }

  .header__inner {
    max-width: 1440px;
    margin-inline: auto;
    padding-inline: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    align-items: flex-start;
  }

  @media (min-width: 768px) {
    .header__inner {
      padding-inline: var(--space-7);
    }
  }

  @media (min-width: 1024px) {
    .header__inner {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .header__left {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }

  @media (min-width: 1024px) {
    .header__left {
      flex-direction: row;
      align-items: center;
      gap: var(--space-2);
    }
  }

  .header__right {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-4);
    width: 100%;
    justify-content: space-between;
  }

  @media (min-width: 1024px) {
    .header__right {
      width: auto;
      justify-content: flex-end;
    }
  }

  .header__title {
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 6vw, 1.75rem);
    font-weight: 800;
    text-transform: uppercase;
    color: var(--text-on-navy);
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin: 0;
  }

  @media (min-width: 1024px) {
    .header__title {
      font-size: clamp(1.5rem, 2.4vw, 2.25rem);
      white-space: nowrap;
    }
  }

  .header__badges {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .header__badge {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    background: var(--bg-card);
    color: var(--navy);
    border-radius: var(--radius-pill);
    font-size: var(--font-size-caption);
    font-weight: 600;
    line-height: 1.15;
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
    font-size: var(--font-size-h2);
    font-weight: 800;
    color: var(--text-on-navy);
    line-height: 1;
    white-space: nowrap;
  }

  .header__edit {
    font-size: var(--font-size-caption);
    color: var(--text-on-navy);
    background: transparent;
    border: var(--border-thin) solid var(--text-on-navy);
    border-radius: var(--radius-pill);
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }

  .header__edit:focus-visible {
    outline: 2px solid var(--text-on-navy);
    outline-offset: 2px;
  }

  .header__edit:hover {
    background: var(--text-on-navy);
    color: var(--navy);
  }
</style>

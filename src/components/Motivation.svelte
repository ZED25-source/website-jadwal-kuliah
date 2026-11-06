<script lang="ts">
  import { MOTIVATION } from '../lib/defaults';
</script>

<section class="motivation">
  <h2 class="motivation__title">Motivasi</h2>
  <ul class="motivation__list">
    {#each MOTIVATION as text}
      <li class="motivation__item">
    {text}
      </li>
    {/each}
  </ul>
</section>

<style>
  .motivation {
    margin-top: var(--space-6);
  }

  .motivation__title {
    font-size: var(--font-size-h3);
    line-height: var(--line-height-snug);
    font-weight: 600;
    margin: 0 0 var(--space-2) 0;
    color: var(--text);
  }

  .motivation__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .motivation__item {
    font-size: var(--font-size-body);
    line-height: var(--line-height-loose);
    color: var(--text);
    margin: 0;
  }
</style>

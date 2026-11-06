<script lang="ts">
  export let persistent: boolean = true;
  export let lastSaveOk: boolean = true;
</script>

{#if !persistent || !lastSaveOk}
  <div role="status" class="storage-notice" aria-live="polite">
    Penyimpanan tidak tersedia. Perubahan tidak akan tersimpan setelah halaman ditutup.
  </div>
{/if}

<style>
  .storage-notice {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--text-muted);
    border-radius: 4px;
    background: var(--bg);
    color: var(--text);
    font-size: var(--font-size-caption);
    margin-bottom: var(--space-3);
  }
</style>

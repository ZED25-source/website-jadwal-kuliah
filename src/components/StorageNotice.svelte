<script lang="ts">
  // Peringatan penyimpanan: ditampilkan saat localStorage tidak tersedia atau gagal menyimpan.
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
    padding: var(--space-4);
    border: var(--border-medium) solid var(--orange);
    border-radius: var(--radius-md);
    background: rgba(242, 165, 38, 0.1);
    color: var(--text);
    font-size: var(--font-size-body);
    font-weight: 600;
    margin-bottom: var(--space-6);
    box-shadow: var(--shadow-soft);
  }
</style>

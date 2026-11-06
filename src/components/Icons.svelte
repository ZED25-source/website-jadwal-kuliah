<script lang="ts">
  export let name: 'laptop' | 'book' | 'plant' | 'graduation' | 'calendar' | 'calculator' | 'atom' | 'book-open' | 'flask' | 'pushpin' | 'paperclip';
  export let size = 24;
</script>

<svg 
  class="icon" 
  width={size} 
  height={size} 
  viewBox="0 0 24 24" 
  fill="none" 
  stroke="currentColor" 
  stroke-width="2" 
  stroke-linecap="round" 
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'laptop'}
    <rect x="2" y="4" width="20" height="12" rx="2" />
    <path d="M2 16h20" />
    <path d="M8 20h8" />
  {:else if name === 'book'}
    <path d="M4 4h16M4 8h16M4 12h16M4 16h16M4 20h16" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  {:else if name === 'plant'}
    <path d="M12 22v-8" />
    <path d="M12 14c-4 0-7-3-7-7 0-4 7-4 7-4s7 0 7 4c0 4-3 7-7 7z" />
    <ellipse cx="12" cy="21" rx="4" ry="1" />
  {:else if name === 'graduation'}
    <path d="M2 7l10-4 10 4-10 4-10-4z" />
    <path d="M6 10v5c0 2 4 4 6 4s6-2 6-4v-5" />
    <path d="M22 7v6" />
  {:else if name === 'calendar'}
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18M8 2v4M16 2v4" />
  {:else if name === 'calculator'}
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" />
  {:else if name === 'atom'}
    <circle cx="12" cy="12" r="10" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  {:else if name === 'book-open'}
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  {:else if name === 'flask'}
    <path d="M9 3h6M9 3v6l-3 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-3-9V3" />
    <path d="M8 12h8" />
  {:else if name === 'pushpin'}
    <path d="M12 2v8M8 6l8 8M16 6l-8 8M12 10l-4 10 4-2 4 2z" />
  {:else if name === 'paperclip'}
    <path d="M21 11.5a8.38 8.38 0 0 1-8.38 8.38H11.5A8.38 8.38 0 0 1 3.12 11.5a8.38 8.38 0 0 1 8.38-8.38h1.12A8.38 8.38 0 0 1 21 11.5z" transform="rotate(-45 12 12)" />
  {/if}
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }
</style>

<script lang="ts">
  // Decorative background component
</script>

<div class="bg-decor" aria-hidden="true">
  <svg class="bg-decor__shape bg-decor__shape--navy-tl" viewBox="0 0 400 400" preserveAspectRatio="xMinYMin slice">
    <path d="M 0,0 Q 200,100 400,0 L 400,200 Q 300,300 0,200 Z" fill="var(--navy)" />
  </svg>
  
  <svg class="bg-decor__shape bg-decor__shape--navy-tr" viewBox="0 0 400 400" preserveAspectRatio="xMaxYMin slice">
    <path d="M 0,0 Q 200,150 400,0 L 400,250 Q 250,200 0,300 Z" fill="var(--royal)" />
  </svg>

  <svg class="bg-decor__dots" viewBox="0 0 100 100" preserveAspectRatio="xMaxYMin meet">
    <circle cx="10" cy="10" r="2" fill="var(--light-blue)" />
    <circle cx="25" cy="8" r="1.5" fill="var(--light-blue)" />
    <circle cx="40" cy="12" r="2" fill="var(--light-blue)" />
    <circle cx="15" cy="25" r="1.5" fill="var(--light-blue)" />
    <circle cx="30" cy="28" r="2" fill="var(--light-blue)" />
    <circle cx="8" cy="40" r="1.5" fill="var(--light-blue)" />
  </svg>

  <svg class="bg-decor__wave" viewBox="0 0 1200 200" preserveAspectRatio="none">
    <path d="M 0,100 Q 300,120 600,100 T 1200,100 L 1200,200 L 0,200 Z" fill="var(--light-blue)" />
  </svg>

  <svg class="bg-decor__monitor" viewBox="0 0 120 100">
    <rect x="10" y="15" width="100" height="65" fill="none" stroke="var(--grid-gray)" stroke-width="2" rx="4" />
    <rect x="20" y="25" width="80" height="45" fill="var(--light-blue)" opacity="0.3" />
    <line x1="45" y1="80" x2="75" y2="80" stroke="var(--grid-gray)" stroke-width="2" />
    <rect x="35" y="80" width="50" height="8" fill="var(--grid-gray)" rx="2" />
  </svg>

  <svg class="bg-decor__lines" viewBox="0 0 400 400">
    <line x1="50" y1="0" x2="50" y2="400" stroke="var(--grid-gray)" stroke-width="1" stroke-dasharray="8,12" opacity="0.4" />
    <line x1="150" y1="0" x2="150" y2="400" stroke="var(--grid-gray)" stroke-width="1" stroke-dasharray="6,10" opacity="0.3" />
    <line x1="0" y1="100" x2="400" y2="100" stroke="var(--grid-gray)" stroke-width="1" stroke-dasharray="10,15" opacity="0.3" />
  </svg>
</div>

<style>
  .bg-decor {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }

  .bg-decor__shape {
    position: absolute;
    width: 40vw;
    height: 40vw;
    max-width: 500px;
    max-height: 500px;
  }

  .bg-decor__shape--navy-tl {
    top: -10%;
    left: -5%;
  }

  .bg-decor__shape--navy-tr {
    top: -8%;
    right: -5%;
  }

  .bg-decor__dots {
    position: absolute;
    top: 15%;
    left: 8%;
    width: 100px;
    height: 100px;
  }

  .bg-decor__wave {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
  }

  .bg-decor__monitor {
    position: absolute;
    top: 25%;
    left: 5%;
    width: 120px;
    height: 100px;
    opacity: 0.5;
  }

  .bg-decor__lines {
    position: absolute;
    top: 35%;
    left: 3%;
    width: 200px;
    height: 200px;
    opacity: 0.6;
  }

  @media (max-width: 1359px) {
    .bg-decor__monitor,
    .bg-decor__dots,
    .bg-decor__lines {
      display: none;
    }
  }

  @media (max-width: 768px) {
    .bg-decor__shape {
      width: 60vw;
      height: 60vw;
    }
  }
</style>

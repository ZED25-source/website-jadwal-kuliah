<script lang="ts">
  import { MOTIVATION } from '../lib/defaults';
  import Icons from './Icons.svelte';
</script>

<section class="motivation">
  <div class="motivation__sticky-notes">
    <div class="motivation__sticky motivation__sticky--1">
      <div class="motivation__pushpin" aria-hidden="true">
        <Icons name="pushpin" size={24} />
      </div>
      <p class="motivation__text">{MOTIVATION[0]}</p>
    </div>

    <div class="motivation__sticky motivation__sticky--2">
      <div class="motivation__pushpin" aria-hidden="true">
        <Icons name="pushpin" size={24} />
      </div>
      <p class="motivation__text">{MOTIVATION[1]}</p>
    </div>
  </div>

  <div class="motivation__banner">
    <div class="motivation__banner-icon" aria-hidden="true">
      <Icons name="graduation" size={32} />
    </div>
    <blockquote class="motivation__quote">
      {MOTIVATION[2]}
    </blockquote>
    <div class="motivation__banner-icon" aria-hidden="true">
      <Icons name="graduation" size={32} />
    </div>
  </div>

  <div class="motivation__clip" aria-hidden="true">
    <Icons name="paperclip" size={48} />
  </div>
</section>

<style>
  .motivation {
    position: relative;
    margin-top: var(--space-8);
    padding-top: var(--space-7);
  }

  .motivation__sticky-notes {
    display: flex;
    gap: var(--space-6);
    margin-bottom: var(--space-7);
    flex-wrap: wrap;
  }

  .motivation__sticky {
    position: relative;
    background: var(--yellow);
    padding: var(--space-5);
    border-radius: var(--radius-sm);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 280px;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .motivation__sticky--1 {
    transform: rotate(-2deg);
  }

  .motivation__sticky--2 {
    transform: rotate(1.5deg);
  }

  .motivation__pushpin {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    color: var(--red);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }

  .motivation__text {
    font-family: var(--font-handwritten);
    font-size: var(--font-size-lead);
    color: var(--navy);
    margin: 0;
    text-align: center;
    line-height: var(--line-height-relaxed);
  }

  .motivation__banner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-5);
    background: var(--navy);
    color: var(--text-on-navy);
    padding: var(--space-6) var(--space-5);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-medium);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }

  .motivation__banner-icon {
    width: 56px;
    height: 56px;
    background: var(--bg-card);
    border-radius: var(--radius-circle);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--purple);
    flex-shrink: 0;
  }

  .motivation__quote {
    font-size: var(--font-size-lead);
    font-weight: 600;
    font-style: italic;
    margin: 0;
    text-align: center;
    max-width: 600px;
    line-height: var(--line-height-relaxed);
  }

  .motivation__clip {
    position: absolute;
    top: 0;
    right: var(--space-6);
    color: var(--grid-gray);
    transform: rotate(45deg);
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    .motivation__sticky-notes {
      justify-content: center;
    }

    .motivation__banner-icon {
      display: none;
    }

    .motivation__clip {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .motivation__sticky {
      max-width: 100%;
    }

    .motivation__banner {
      padding: var(--space-5) var(--space-4);
    }

    .motivation__quote {
      font-size: var(--font-size-body);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .motivation__sticky--1,
    .motivation__sticky--2 {
      transform: none;
    }
  }
</style>

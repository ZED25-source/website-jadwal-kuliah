<script lang="ts">
  // Komponen kalender bulanan: grid 6x7, navigasi bulan, penanda tugas (titik merah/centang hijau),
  // navigasi keyboard, dan panel tenggat untuk tanggal yang dipilih.
  import type { Task, Course } from '../lib/types';
  import { buildMonthGrid, shiftMonth, shiftDateKey, tasksByDate, getDayMark, formatMonthLabel, formatDateLabel } from '../lib/calendar';
  import { getJakartaDateKey, formatDue, dueTimeMinutes } from '../lib/tasks';

  let {
    tasks,
    courses,
    onToggle,
    onDelete,
    currentTime
  }: {
    tasks: Task[];
    courses: Course[];
    onToggle: (taskId: string) => void;
    onDelete: (task: Task, trigger: HTMLButtonElement) => void;
    currentTime: Date;
  } = $props();

  const todayKey = $derived(getJakartaDateKey(currentTime));
  
  // Ekstrak tahun dan bulan dari todayKey.
  const [todayYear, todayMonth] = $derived.by(() => {
    const [y, m] = todayKey.split('-').map(Number);
    return [y, m];
  });
  
  let viewYear = $state(0);
  let viewMonth = $state(0);
  let selectedDateKey = $state<string | null>(null);
  let focusedDateKey = $state<string>('');

  // Inisialisasi state tampilan dari nilai hari ini.
  $effect(() => {
    if (viewYear === 0) viewYear = todayYear;
    if (viewMonth === 0) viewMonth = todayMonth;
    if (selectedDateKey === null) selectedDateKey = todayKey;
    if (focusedDateKey === '') focusedDateKey = todayKey;
  });

  const grid = $derived(buildMonthGrid(viewYear, viewMonth));
  const monthLabel = $derived(formatMonthLabel(viewYear, viewMonth));
  const taskMap = $derived(tasksByDate(tasks));
  
  // Tugas untuk tanggal yang dipilih.
  const selectedTasks = $derived.by(() => {
    if (!selectedDateKey) return [];
    return taskMap.get(selectedDateKey) ?? [];
  });
  
  const selectedDateLabel = $derived(selectedDateKey ? formatDateLabel(selectedDateKey) : '');
  
  const WEEKDAY_ABBR = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
  const WEEKDAY_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  function handlePrevMonth() {
    const [newYear, newMonth] = shiftMonth(viewYear, viewMonth, -1);
    viewYear = newYear;
    viewMonth = newMonth;
    
    // Pindahkan fokus ke hari yang sama di bulan baru jika memungkinkan.
    const [, , fd] = focusedDateKey.split('-').map(Number);
    const daysInNewMonth = new Date(Date.UTC(newYear, newMonth, 0)).getUTCDate();
    const newDay = Math.min(fd, daysInNewMonth);
    focusedDateKey = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
  }

  function handleNextMonth() {
    const [newYear, newMonth] = shiftMonth(viewYear, viewMonth, 1);
    viewYear = newYear;
    viewMonth = newMonth;
    
    // Pindahkan fokus ke hari yang sama di bulan baru jika memungkinkan.
    const [, , fd] = focusedDateKey.split('-').map(Number);
    const daysInNewMonth = new Date(Date.UTC(newYear, newMonth, 0)).getUTCDate();
    const newDay = Math.min(fd, daysInNewMonth);
    focusedDateKey = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
  }

  function handleToday() {
    viewYear = todayYear;
    viewMonth = todayMonth;
    focusedDateKey = todayKey;
    selectedDateKey = todayKey;
  }

  function handleDayClick(dateKey: string) {
    if (selectedDateKey === dateKey) {
      // Batalkan pilihan jika mengklik hari yang sama.
      selectedDateKey = null;
    } else {
      selectedDateKey = dateKey;
    }
    focusedDateKey = dateKey;
  }

  function handleDayKeydown(event: KeyboardEvent, dateKey: string) {
    let handled = false;
    
    switch (event.key) {
      case 'ArrowLeft':
        focusedDateKey = shiftDateKey(dateKey, -1);
        handled = true;
        break;
      case 'ArrowRight':
        focusedDateKey = shiftDateKey(dateKey, 1);
        handled = true;
        break;
      case 'ArrowUp':
        focusedDateKey = shiftDateKey(dateKey, -7);
        handled = true;
        break;
      case 'ArrowDown':
        focusedDateKey = shiftDateKey(dateKey, 7);
        handled = true;
        break;
      case 'PageUp':
        handlePrevMonth();
        handled = true;
        break;
      case 'PageDown':
        handleNextMonth();
        handled = true;
        break;
      case 'Home':
        // Pergi ke hari pertama bulan ini.
        focusedDateKey = `${viewYear}-${String(viewMonth).padStart(2, '0')}-01`;
        handled = true;
        break;
      case 'End': {
        // Pergi ke hari terakhir bulan ini.
        const lastDay = new Date(Date.UTC(viewYear, viewMonth, 0)).getUTCDate();
        focusedDateKey = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        handled = true;
        break;
      }
    }
    
    if (handled) {
      event.preventDefault();
      
      // Jika fokus pindah ke bulan lain, geser tampilan bulan.
      const [fy, fm] = focusedDateKey.split('-').map(Number);
      if (fm !== viewMonth || fy !== viewYear) {
        viewYear = fy;
        viewMonth = fm;
      }
    }
  }

  function getDayAriaLabel(dateKey: string): string {
    const dateLabel = formatDateLabel(dateKey);
    const dayTasks = taskMap.get(dateKey) ?? [];
    
    if (dayTasks.length === 0) {
      return `${dateLabel}, tidak ada tugas`;
    }
    
    const openCount = dayTasks.filter(t => !t.done).length;
    if (openCount > 0) {
      return `${dateLabel}, ${openCount} tugas belum selesai`;
    }
    
    return `${dateLabel}, semua tugas selesai`;
  }

  function getCourse(courseId: string): Course | undefined {
    return courses.find((c) => c.id === courseId);
  }
</script>

<div class="calendar">
  <div class="calendar__header">
    <button
      type="button"
      class="calendar__nav-button"
      onclick={handlePrevMonth}
      aria-label="Bulan sebelumnya"
    >
      ‹
    </button>
    
    <h3 class="calendar__title">{monthLabel}</h3>
    
    <button
      type="button"
      class="calendar__nav-button"
      onclick={handleNextMonth}
      aria-label="Bulan berikutnya"
    >
      ›
    </button>
    
    <button
      type="button"
      class="calendar__today-button"
      onclick={handleToday}
    >
      Hari ini
    </button>
  </div>

  <div class="calendar__grid">
    <div class="calendar__weekdays">
      {#each WEEKDAY_ABBR as day, index}
        <div class="calendar__weekday" class:calendar__weekday--minggu={index === 0}>
          <abbr title={WEEKDAY_FULL[index]}>{day}</abbr>
        </div>
      {/each}
    </div>

    <div class="calendar__days">
      {#each grid as week}
        {#each week as cell, colIndex}
          {#if cell === null}
            <div class="calendar__day calendar__day--empty" aria-hidden="true"></div>
          {:else}
            {@const dayTasks = taskMap.get(cell.dateKey) ?? []}
            {@const mark = getDayMark(dayTasks)}
            {@const isToday = cell.dateKey === todayKey}
            {@const isSelected = cell.dateKey === selectedDateKey}
            {@const isFocused = cell.dateKey === focusedDateKey}
            
            <button
              type="button"
              class="calendar__day calendar__day--active"
              class:calendar__day--today={isToday}
              class:calendar__day--selected={isSelected}
              class:calendar__day--minggu={colIndex === 0}
              aria-label={getDayAriaLabel(cell.dateKey)}
              aria-current={isToday ? 'date' : undefined}
              aria-pressed={isSelected}
              tabindex={isFocused ? 0 : -1}
              onclick={() => handleDayClick(cell.dateKey)}
              onkeydown={(e) => handleDayKeydown(e, cell.dateKey)}
            >
              <span class="calendar__day-number">{cell.day}</span>
              {#if mark === 'open'}
                <span class="calendar__day-mark calendar__day-mark--open" aria-hidden="true"></span>
              {:else if mark === 'done'}
                <span class="calendar__day-mark calendar__day-mark--done" aria-hidden="true">✓</span>
              {/if}
            </button>
          {/if}
        {/each}
      {/each}
    </div>
  </div>

  {#if selectedDateKey}
    <div class="calendar__panel">
      <h4 class="calendar__panel-title">Tenggat {selectedDateLabel}</h4>
      
      {#if selectedTasks.length === 0}
        <p class="calendar__panel-empty">Tidak ada tenggat pada tanggal ini.</p>
      {:else}
        {@const openTasks = selectedTasks.filter(t => !t.done).sort((a, b) => {
          const aTime = dueTimeMinutes(a.dueTime);
          const bTime = dueTimeMinutes(b.dueTime);
          if (aTime !== undefined && bTime === undefined) return -1;
          if (aTime === undefined && bTime !== undefined) return 1;
          if (aTime !== undefined && bTime !== undefined) {
            const c = aTime - bTime;
            if (c !== 0) return c;
          }
          return a.title.localeCompare(b.title);
        })}
        {@const doneTasks = selectedTasks.filter(t => t.done).sort((a, b) => {
          const aTime = dueTimeMinutes(a.dueTime);
          const bTime = dueTimeMinutes(b.dueTime);
          if (aTime !== undefined && bTime === undefined) return -1;
          if (aTime === undefined && bTime !== undefined) return 1;
          if (aTime !== undefined && bTime !== undefined) {
            const c = aTime - bTime;
            if (c !== 0) return c;
          }
          return a.title.localeCompare(b.title);
        })}
        
        <ul class="task-list">
          {#each openTasks as task (task.id)}
            {@const course = getCourse(task.courseId)}
            <li class="task-item">
              <label class="task-item__label">
                <input
                  type="checkbox"
                  class="task-item__checkbox"
                  checked={false}
                  onchange={() => onToggle(task.id)}
                  aria-label="Tandai selesai: {task.title}"
                />
              <div class="task-item__content">
                <div class="task-item__title">{task.title}</div>
                <div class="task-item__meta">
                  {#if course}
                    <div class="task-item__course">{course.name}</div>
                  {/if}
                  {#if task.due}
                    <div class="task-item__due">{formatDue(task)}</div>
                  {/if}
                </div>
              </div>
              </label>
              <button
                type="button"
                class="task-item__delete"
                onclick={(e) => onDelete(task, e.currentTarget)}
                aria-label="Hapus tugas {task.title}"
              >
                ×
              </button>
            </li>
          {/each}
          
          {#each doneTasks as task (task.id)}
            {@const course = getCourse(task.courseId)}
            <li class="task-item task-item--done">
              <label class="task-item__label">
                <input
                  type="checkbox"
                  class="task-item__checkbox"
                  checked={true}
                  onchange={() => onToggle(task.id)}
                  aria-label="Tandai belum selesai: {task.title}"
                />
              <div class="task-item__content">
                <div class="task-item__title">{task.title}</div>
                <div class="task-item__meta">
                  {#if course}
                    <div class="task-item__course">{course.name}</div>
                  {/if}
                  {#if task.due}
                    <div class="task-item__due">{formatDue(task)}</div>
                  {/if}
                </div>
              </div>
              </label>
              <button
                type="button"
                class="task-item__delete"
                onclick={(e) => onDelete(task, e.currentTarget)}
                aria-label="Hapus tugas {task.title}"
              >
                ×
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<style>
  .calendar {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    --font-size-lead: calc(var(--font-size-lead) * 0.85);
    --font-size-body: calc(var(--font-size-body) * 0.85);
  }

  .calendar__header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .calendar__nav-button {
    background: var(--bg-card);
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-sm);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.3rem;
    line-height: 1;
    color: var(--navy);
    padding: 0;
  }

  .calendar__nav-button:hover {
    background: var(--off-white);
    border-color: var(--navy);
  }

  .calendar__nav-button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .calendar__title {
    flex: 1;
    font-size: var(--font-size-lead);
    font-weight: 700;
    color: var(--navy);
    margin: 0;
    text-align: center;
  }

  .calendar__today-button {
    background: var(--off-white);
    border: var(--border-thin) solid var(--grid-gray);
    border-radius: var(--radius-pill);
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-caption);
    font-weight: 600;
    color: var(--navy);
    cursor: pointer;
  }

  .calendar__today-button:hover {
    background: var(--light-blue);
    border-color: var(--royal);
  }

  .calendar__today-button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .calendar__grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .calendar__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .calendar__weekday {
    font-size: var(--font-size-caption);
    font-weight: 700;
    color: var(--text-muted);
    text-align: center;
    padding: var(--space-2);
  }

  .calendar__weekday abbr {
    text-decoration: none;
    cursor: help;
  }

  .calendar__days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .calendar__day {
    position: relative;
    min-width: 28px;
    min-height: 28px;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-1);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-caption);
    border: var(--border-thin) solid transparent;
  }

  .calendar__day--empty {
    background: transparent;
  }

  .calendar__day--active {
    background: var(--bg-card);
    border-color: var(--grid-gray);
    cursor: pointer;
    color: var(--text);
  }

  .calendar__day--active:hover {
    background: var(--off-white);
    border-color: var(--royal);
  }

  .calendar__day--today {
    outline: 2px solid var(--navy);
    outline-offset: -2px;
    font-weight: 700;
  }

  .calendar__weekday--minggu {
    color: var(--red);
  }

  .calendar__day--minggu .calendar__day-number {
    color: var(--red);
  }

  .calendar__day--selected {
    background: var(--light-blue);
    border-color: var(--navy);
    font-weight: 700;
  }

  .calendar__day--active:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .calendar__day-number {
    font-size: var(--font-size-caption);
  }

  .calendar__day-mark {
    position: absolute;
    bottom: 2px;
    font-size: 0.55rem;
    line-height: 1;
  }

  .calendar__day-mark--open {
    width: 5px;
    height: 5px;
    border-radius: var(--radius-circle);
    background: var(--danger);
  }

  .calendar__day-mark--done {
    color: var(--success);
    font-weight: 700;
  }

  .calendar__panel {
    background: var(--off-white);
    border: var(--border-medium) solid var(--navy);
    border-radius: var(--radius-md);
    padding: var(--space-3);
  }

  .calendar__panel-title {
    font-size: var(--font-size-body);
    font-weight: 700;
    color: var(--text);
    margin: 0 0 var(--space-3) 0;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .calendar__panel-empty {
    font-size: var(--font-size-body);
    color: var(--text-muted);
    margin: 0;
    font-style: italic;
  }

  .task-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .task-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--bg-card);
    border: var(--border-medium) solid var(--navy);
    border-radius: var(--radius-md);
  }

  .task-item--done {
    opacity: 0.7;
    border-color: var(--grid-gray);
  }

  .task-item__label {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    flex: 1;
    min-width: 0;
    cursor: pointer;
  }

  .task-item__checkbox {
    margin-top: 2px;
    cursor: pointer;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .task-item__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1;
    min-width: 0;
  }

  .task-item__title {
    font-size: 0.625rem;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    overflow-wrap: break-word;
    hyphens: auto;
    line-height: 1.3;
    letter-spacing: 0.02em;
  }

  .task-item--done .task-item__title {
    text-decoration: line-through;
  }

  .task-item__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .task-item__course {
    font-size: 0.5625rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .task-item__due {
    font-size: 0.5625rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .task-item__delete {
    background: transparent;
    border: none;
    font-size: 1.25rem;
    line-height: 1;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  .task-item__delete:hover {
    color: var(--red);
    background: rgba(220, 38, 38, 0.1);
  }

  .task-item__delete:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  @media (min-width: 360px) {
    .calendar__day {
      min-width: 32px;
      min-height: 32px;
    }
  }

  @media (max-width: 1359px) {
    .calendar {
      max-width: 360px;
      margin: 0 auto;
    }
  }
</style>

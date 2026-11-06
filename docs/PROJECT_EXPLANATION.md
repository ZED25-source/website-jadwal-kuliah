# Penjelasan Kodingan Project Jadwal Kuliah

Dokumen ini menjelaskan secara ringkas bagaimana project Jadwal Kuliah bekerja, struktur kodenya, dan alur fitur utama. Bahasa penjelasan: Indonesia.

## 1. Ringkasan Project

Project ini adalah aplikasi jadwal kuliah berbasis **Svelte 5** (TypeScript) yang berjalan di browser. Fitur utamanya:

- Mengelola jadwal mata kuliah per hari (Senin–Minggu) dengan waktu mulai/selesai, kode, nama, SKS, PJ, PD 1, dan ruang.
- Mengelola tugas per mata kuliah dengan judul, tenggat tanggal, dan waktu (WIB).
- Tampilan "Kuliah Hari Ini" (Hero) yang menampilkan mata kuliah yang sedang berlangsung dan berikutnya.
- Kalender bulanan untuk melihat tenggat tugas per tanggal.
- Simpan data secara otomatis ke `localStorage` (penyimpanan lokal browser).
- Ekspor dan impor data dalam berkas JSON.
- Tampilan responsif: Week Overview (desktop, ≥640px) dan Day Groups (mobile, <640px).

## 2. Arsitektur dan Alur Data

```
App.svelte (state pusat, $state/$derived)
  ├── Header.svelte        (judul, badge program/semester, total SKS)
  ├── Hero.svelte          (kuliah hari ini, status, tugas)
  ├── main > main          (WeekOverview ATAU DayGroup terlayarkan layar)
  │     ├── WeekOverview.svelte (grid hari + chip mata kuliah + dialog detail)
  │     └── DayGroup.swelete    (mobile: grouped by day + CourseCard)
  │           └── CourseCard.svelte (detail mata kuliah + daftar tugas + form tugas inline)
  └── aside > Sidebar.svelte (tombol tambah MK, kalender, daftar tugas, form tambah tugas, motivasi, alat data)
        ├── Calendar.svelte
        ├── TaskPanel.svelte
        │     └── TaskList.svelte
        ├── DataTools.svelte
        └── Motivation.svelte
```

State tunggal (`AppState`) berada di `App.svelte` dan diturunkan (`$derived`) ke komponen turunan. Semua perubahan state langsung disimpan ke `localStorage` melalui fungsi `persist()`.

## 3. Penjelasan File Utama di `src/lib/`

### `types.ts` — Definisi tipe data
- `Day`: hari dalam seminggu (`Senin` … `Minggu`).
- `Course`: mata kuliah (`id`, `day`, `start`, `end`, `code`, `name`, `sks`, `pj`, `pd1`, `room`).
- `Task`: tugas (`id`, `courseId`, `title`, `due`, `dueTime`, `done`, `createdAt`).
- `AppState`: state lengkap aplikasi (`schemaVersion`, `seeded`, `meta`, `courses`, `tasks`).
- `DAYS`: daftar hari, `SCHEMA_VERSION`: versi skema data.

### `defaults.ts` — Data default
- `DEFAULT_META`: judul, program (default `S1`), semester.
- `DEFAULT_COURSES`: daftar mata kuliah contoh awal.
- `MOTIVATION`: kutipan motivasi.
- `createDefaultState()`: membuat state awal aplikasi.

### `validation.ts` — Validasi formulir
- `validateCourseForm(values)`: memvalidasi input mata kuliah (nama wajib, hari valid, jam valid, selesai > mulai, SKS 0–6).
- `validateMetaForm(values)`: memvalidasi judul header (wajib diisi).

### `schedule.ts` — Logika jadwal
- `sortCourses(courses)`: urutkan menurut hari lalu jam mulai.
- `groupByDay(courses)`: kelompokkan mata kuliah per hari.
- `totalSks(courses)`: total SKS.
- `findConflicts(candidate, courses)`: deteksi benturan jadwal waktu yang tumpang tindih.

### `actions.ts` — Mutasi state
- `addCourse`, `updateCourse`, `deleteCourse`: CRUD mata kuliah (hapus juga menghapus tugas terkait).
- `countTasksOf(state, courseId)`: hitung tugas suatu mata kuliah.
- `updateMeta(state, meta)`: ubah meta header.
- `resetState(state)`: kembalikan ke default.

### `storage.ts` — Penyimpanan localStorage
- `STORAGE_KEY = 'jadwal-kuliah:v1'`.
- `validateState(raw)`: memvalidasi struktur data yang dimuat dari localStorage.
- `loadState()`: muat state dari localStorage, fallback ke default jika kosong/rusak.
- `saveState(state)`: simpan state ke localStorage.

### `tasks.ts` — Manajemen tugas
- `getJakartaDateKey(now)`: tanggal hari ini zona WIB (`YYYY-MM-DD`).
- `partitionTasks(tasks)`: pisahkan tugas terbuka dan selesai.
- `sortOpenTasks(tasks, todayKey, nowMinutes)`: urutkan tugas terbuka (terlambat dulu, lalu tenggat).
- `isOverdue(task, todayKey, nowMinutes)`: cek apakah tugas terlambat.
- `formatDateId`, `formatDue`, `formatDueDateTime`: format tanggal Indonesia.
- `addTask`, `toggleTask`, `deleteTask`, `tasksOf`, `openTaskCount`: operasi tugas.
- `validateTaskForm(input)`: validasi formulir tugas.
- `getCourseTaskStatus(tasks, courseId)`: status tugas mata kuliah (`none`/`open`/`done`).

### `today.ts` — Waktu dan hari saat ini (WIB)
- `getJakartaParts(now)`: hari, menit dari tengah hari, dan label tanggal zona Asia/Jakarta.
- `getTodayStatus(courses, now)`: mata kuliah hari ini, yang sedang berlangsung (`currentId`), yang berikutnya (`nextId`), dan kuliah lintas hari (`nextCrossDay`).
- `relativeDayLabel(fromDay, toDay)`: label "Besok" jika 1 hari mendatang, selain itu nama hari.

### `calendar.ts` — Logika kalender
- `buildMonthGrid(year, month)`: grid 6×7 untuk kalender bulanan (Minggu sebagai awal).
- `shiftMonth(year, month, delta)`: geser bulan.
- `shiftDateKey(dateKey, days)`: geser tanggal sejumlah hari.
- `tasksByDate(tasks)`: kelompokkan tugas menurut tanggal tenggat.
- `getDayMark(tasksOnDay)`: tanda hari (`none`/`open`/`done`).
- `formatMonthLabel`, `formatDateLabel`: format label bahasa Indonesia.

### `transfer.ts` — Ekspor/impor JSON
- `exportState(state)`: ubah state menjadi string JSON.
- `parseImport(text)`: parsing dan validasi berkas impor, kembalikan preview dengan jumlah data yang valid/dibuang.

### `view.ts` — Helper tampilan
- `todayWib(now)`: hari saat ini zona WIB.
- `formatTime(time)`: ubah `HH:MM` menjadi `HH.MM`.

### `main.ts` — Titik masuk aplikasi
- Mount komponen `App` ke elemen `#app`.

## 4. Penjelasan Komponen Svelte di `src/components/`

### `App.svelte` — Komponen utama
- Memuat state awal dari `localStorage` via `loadState()`.
- Menyimpan state reaktif dengan `$state` (mutable) dan `$derived` (turunan).
- Mengelola semua dialog: hapus mata kuliah, reset, edit header, hapus tugas.
- Fungsi `persist(nextState)` menyimpan setiap perubahan ke `localStorage`.
- Ticker waktu `currentTime` bertick setiap 60 detik (WIB), bisa di-override via parameter URL `?now=` untuk pengembangan.
- Merender `Header`, `Hero`, `WeekOverview` (desktop), `DayGroup` (mobile), `Sidebar`, dan `CourseForm` dialog.

### `Header.svelte` — Header aplikasi
- Props: `meta` (judul, program, semester), `totalSks`, `onEditHeader`.
- Menampilkan judul besar, badge program & semester, kartu total SKS, dan tombol "Ubah header".

### `Hero.svelte` — Kuliah Hari Ini
- Props: `appState`, `currentTime`.
- Menampilkan tanggal WIB, ringkasan mata kuliah hari ini, badge tugas belum selesai, tenggat terdekat, dan daftar mata kuliah hari ini dengan status "Sedang berlangsung" / "Berikutnya".
- Jika tidak ada kuliah hari ini, menampilkan kuliah berikutnya lintas hari.

### `Sidebar.svelte` — Panel samping
- Props: `appState`, `onAddCourse`, `onAddTask`, `onToggleTask`, `onDeleteTask`, `onImportConfirmed`, `currentTime`.
- Berisi tombol "Tambah mata kuliah", `Calendar`, daftar tugas (`TaskPanel`), form tambah tugas (dalam `<details>`), `Motivation`, dan `DataTools`.

### `Calendar.svelte` — Kalender bulanan
- Props: `tasks`, `courses`, `onToggle`, `onDelete`, `currentTime`.
- Grid 6×7 dengan navigasi bulan (sebelum/berikutnya/hari ini).
- Tandai hari dengan titik merah (tugas belum selesai) atau centang hijau (semua selesai).
- Navigasi keyboard: panah kiri/kanan/atas/bawah, PageUp/PageDown, Home/End.
- Panel tenggat menampilkan tugas untuk tanggal yang dipilih.

### `TaskPanel.svelte` — Daftar tugas di sidebar
- Props: `tasks`, `courses`, `onToggle`, `onDelete`, `currentTime`.
- Menampilkan tugas terbuka (diurutkan: terlambat dulu, lalu tenggat) dan tugas selesai dalam `<details>` yang dapat dicollapse.

### `TaskList.svelte` — Item tunggal tugas
- Props: `tasks`, `onToggle`, `onDelete`.
- Setiap item: checkbox, judul, status "Selesai"/"Terlambat", tanggal tenggat, tombol hapus.

### `CourseCard.svelte` — Kartu detail mata kuliah
- Props banyak: `course`, `tasks`, `openCount`, `onDelete`, `onEdit`, `onAddTask`, `onToggleTask`, `onDeleteTask`, `isAddingTask`, `taskValues`, `taskErrors`, dan handler formulir tugas.
- Menampilkan waktu, nama, kode, meta (SKS/PJ/PD1/ruang), badge tugas, daftar tugas (`TaskList`), form tambah tugas inline, dan tombol aksi (Ubah/Hapus/+Tugas).

### `CourseForm.svelte` — Dialog tambah/ubah mata kuliah
- Props: `open`, `course`, `courses`, `onSave`, `onClose`.
- Formulir lengkap: hari, jam mulai/selesai, nama, kode, SKS, PJ, PD 1, ruang.
- Validasi via `validateCourseForm` dan deteksi benturan jadwal via `findConflicts`.

### `DayGroup.svelte` — Tampilan mobile (per hari)
- Props: `day`, `courses`, `isToday`, `state`, dan handler aksi mata kuliah/tugas.
- Menampilkan pill berwarna per hari, badge "Hari ini", dan daftar `CourseCard`.
- Digunakan pada layar < 640px.

### `WeekOverview.svelte` — Tampilan desktop (grid mingguan)
- Props: `appState`, `todayDay`, dan handler aksi.
- Grid kolom hari dengan `CourseChip` untuk setiap mata kuliah.
- Klik chip membuka dialog detail (`CourseCard`).
- Digunakan pada layar ≥ 640px.

### `DataTools.svelte` — Ekspor/impor data
- Props: `state`, `onImportConfirmed`.
- Tombol "Ekspor JSON" mengunduh state sebagai berkas `.json`.
- Tombol "Impor JSON" membuka dialog pilih berkas, memvalidasi via `parseImport`, dan menampilkan preview sebelum mengonfirmasi.

### `Motivation.svelte` — Catatan motivasi
- Menampilkan dua sticky note dengan kutipan dari `MOTIVATION` dan satu banner kutipan dengan ikon lulusan.

### `StorageNotice.svelte` — Peringatan penyimpanan
- Props: `persistent`, `lastSaveOk`.
- Muncul jika `localStorage` tidak tersedia atau gagal menyimpan.

### `Icons.svelte` — Ikon SVG reusable
- Props: `name` (jenis ikon), `size`.
- Render SVG ikon: laptop, buku, tanaman, lulusan, kalender, kalkulator, atom, buku terbuka, lab, pushpin, kertas clips.

### `BackgroundDecor.svelte` — Hiasan latar belakang
- Bentuk latar, titik, gelombang, ikon monitor, dan garis putus sebagai dekorasi visual.
- Disembunyikan pada layar sempit (< 1360px untuk beberapa elemen).

### `CourseChip.svelte` — Chip mata kuliah untuk WeekOverview
- Props: `course`, `tasks`, `openCount`, `onclick`.
- Menampilkan waktu, nama, ruang, dan badge status tugas (merah = belum selesai, hijau = selesai).

## 5. Bagaimana Project Ini Bekerja (Langkah demi Langkah)

1. **Inisialisasi**: `App.svelte` memanggil `loadState()` saat montir. Jika ada data valid di `localStorage`, dimuat; jika tidak, dibuat state default via `createDefaultState()`.
2. **Render UI**: State diturunkan ke komponen: `meta` ke `Header`, `courses` ke `Hero`/`WeekOverview`/`DayGroup`/`Sidebar`, `tasks` ke `Sidebar`/`Calendar`.
3. **Interaksi pengguna**:
   - Tambah/ubah mata kuliah → `CourseForm` → `onFormSave` → `addCourse`/`updateCourse` → `persist()` → simpan `localStorage`.
   - Hapus mata kuliah → dialog konfirmasi → `deleteCourse` (menghapus juga tugas terkait) → `persist()`.
   - Ubah header → dialog edit header → `validateMetaForm` → `updateMeta` → `persist()`.
   - Tambah tugas → form tugas (sidebar atau CourseCard) → `validateTaskForm` → `addTask` → `persist()`.
   - Selesaikan/hapsus tugas → `toggleTask`/`deleteTask` → `persist()`.
4. **Ticker waktu**: `currentTime` di `App.svelte` update setiap 60 detik, sehingga `Hero` dan `Sidebar` menampilkan jam/hari terkini zona WIB.
5. **Penyimpanan**: Setiap mutasi state memanggil `persist(stateStore)` yang menjalankan `saveState()` ke `localStorage`. Jika gagal, `lastSaveOk` menjadi `false` dan `StorageNotice` muncul.
6. **Ekspor/Impor**: `DataTools` menggunakan `exportState` (JSON) dan `parseImport` (validasi impor). Data impor mengganti state saat ini setelah konfirmasi.

## 6. Alur Fitur Utama

| Fitur | File Utama | Fungsi Kunci |
|-------|-----------|--------------|
| Lihat jadwal hari ini | `App.svelte`, `Hero.svelte`, `today.ts` | `getTodayStatus`, `todayWib` |
| Lihat jadwal per minggu | `WeekOverview.svelte`, `schedule.ts` | `groupByDay`, `sortCourses` |
| Lihat jadwal per hari (mobile) | `DayGroup.svelte`, `CourseCard.svelte` | `tasksOf`, `openTaskCount` |
| Tambah/Edit mata kuliah | `CourseForm.svelte`, `actions.ts` | `validateCourseForm`, `findConflicts`, `addCourse`/`updateCourse` |
| Hapus mata kuliah | `App.svelte`, `actions.ts` | `deleteCourse` |
| Tambah tugas | `Sidebar.svelte`, `CourseCard.svelte`, `tasks.ts` | `validateTaskForm`, `addTask` |
| Selesai/Hapus tugas | `TaskPanel.svelte`, `TaskList.svelte`, `tasks.ts` | `toggleTask`, `deleteTask` |
| Kalender tenggat | `Calendar.svelte`, `calendar.ts` | `buildMonthGrid`, `tasksByDate`, `getDayMark` |
| Simpan/Muat data | `storage.ts`, `App.svelte` | `loadState`, `saveState`, `validateState` |
| Ekspor/Impor JSON | `DataTools.svelte`, `transfer.ts` | `exportState`, `parseImport` |

## 7. Catatan Teknis

- **Svelte 5 runes**: `$state` untuk state reaktif, `$derived` untuk data turunan, `$effect` untuk sinkronisasi dialog, `$props()` untuk props komponen.
- **Zona waktu**: Semua tanggal/waktu menggunakan zona `Asia/Jakarta` (WIB).
- **CSS**: Menggunakan CSS custom properties (tokens) yang didefinisikan di `docs/DESIGN.md` dan `app.css`. Tidak ada hardcode hex di komponen kecuali SVG.
- **Aksesibilitas**: Dialog menggunakan elemen `<dialog>`, tombol dengan `aria-label`, kalender navigasi keyboard, `aria-current="date"` pada hari ini.
- **Responsif**: Breakpoint 640px (WeekOverview vs DayGroup), 768px/1024px/1280px/1360px untuk layout dan dekorasi.
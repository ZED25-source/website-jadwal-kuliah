# SRS — Jadwal Mata Kuliah

Versi: 0.2 (Draft)

## 1. Pendahuluan

### 1.1 Tujuan
Dokumen ini mendefinisikan kebutuhan website Jadwal Mata Kuliah untuk mahasiswa atau penggunaan pribadi.

### 1.2 Lingkup
Website satu halaman untuk melihat, mengisi, dan menghapus jadwal kuliah, serta mengelola tugas per mata kuliah. Tampilan mengikuti `docs/DESIGN.md` (tema minimalist).

### 1.3 Definisi
- **SKS**: satuan kredit semester.
- **PJ**: penanggung jawab mata kuliah (dosen).
- **PD 1**: mengikuti penamaan kolom pada sumber jadwal. Kepanjangan belum dikonfirmasi.
- **Seed**: pengisian data default saat aplikasi pertama kali dibuka.

## 2. Deskripsi Umum

### 2.1 Pengguna dan lingkungan
- **Pengguna**: mahasiswa yang mengelola jadwal sendiri. Satu pengguna per perangkat.
- **Lingkungan**: browser modern di ponsel dan desktop.

### 2.2 Batasan
- Tanpa backend, tanpa login. Semua data disimpan di `localStorage` browser.
- Data tidak tersinkron antar perangkat atau browser.
- Tampilan wajib mengikuti `docs/DESIGN.md`.

### 2.3 Teknologi
| Bagian | Pilihan |
|---|---|
| Build tool | Vite (template `svelte-ts`) |
| Framework | Svelte |
| Bahasa | TypeScript |
| Styling | CSS biasa dengan CSS variables (design token dari `docs/DESIGN.md`) |
| Tes | Vitest |
| Package manager | npm |
| Penyimpanan | `localStorage` (tanpa backend) |

Aturan:
- Gunakan perintah npm: `npm install`, `npm run dev`, `npm run build`, `npm run lint`, `npm test`.
- Jangan memakai yarn, pnpm, atau bun, dan jangan membuat lockfile selain `package-lock.json`.
- Tanpa Tailwind, tanpa library UI, tanpa library state management, tanpa library ikon. Gunakan state bawaan Svelte dan SVG atau teks sederhana.
- Tambahkan dependency baru hanya dengan alasan tertulis.
- Jika repo sudah memakai stack lain, ikuti stack yang ada dan tanyakan dulu sebelum mengubahnya.

### 2.4 Struktur folder yang disarankan
```
docs/            SRS.md, MILESTONES.md, DESIGN.md
src/
  lib/
    types.ts     Course, Task, AppState
    defaults.ts  data default (bagian 6)
    storage.ts   load, save, seed, validasi
    schedule.ts  urut jam, hitung SKS, deteksi bentrok
    *.test.ts    tes Vitest
  components/    komponen Svelte
  App.svelte
```
Struktur ini saran. Boleh disesuaikan dengan konvensi repo, selama logika data tetap terpisah dari komponen tampilan.

## 3. Kebutuhan Fungsional

Prioritas: **Must** (wajib), **Should** (sebaiknya), **Could** (opsional).

### 3.1 Tampilan jadwal
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Menampilkan header: judul, program, semester, dan total SKS yang dihitung otomatis dari jadwal. | Must |
| FR-02 | Menampilkan jadwal dikelompokkan per hari, diurutkan menurut jam mulai. Hari tanpa mata kuliah tidak ditampilkan. | Must |
| FR-03 | Menyorot hari ini (zona waktu WIB). Jika hari ini kosong, tampil pesan "Tidak ada kuliah hari ini". | Should |
| FR-04 | Menampilkan blok Motivasi (lihat bagian 6.2). | Should |
| FR-05 | Judul, program, dan semester pada header dapat diedit. | Should |

### 3.2 Kelola jadwal
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-06 | Menambah mata kuliah lewat form. Wajib: hari, jam mulai, jam selesai, nama. Opsional: kode, SKS, PJ, PD 1, ruang. SKS kosong dihitung 0. | Must |
| FR-07 | Validasi: jam selesai harus setelah jam mulai, nama tidak boleh kosong, SKS bila diisi berupa bilangan bulat 0–6. Pesan error tampil di dekat field. | Must |
| FR-08 | Peringatan (tidak memblokir) bila jadwal baru bentrok dengan jadwal lain pada hari yang sama. Jam selesai yang sama dengan jam mulai berikutnya bukan bentrok. | Should |
| FR-09 | Menghapus mata kuliah dengan konfirmasi. Tugas milik mata kuliah itu ikut terhapus, dan konfirmasi menyebutkan jumlah tugas yang akan hilang. | Must |
| FR-10 | Mengedit mata kuliah yang sudah ada. | Should |
| FR-11 | Reset ke jadwal default dengan konfirmasi. | Should |

### 3.3 Tugas
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-12 | Menambah tugas pada sebuah mata kuliah. Wajib: judul. Opsional: tenggat (tanggal). | Must |
| FR-13 | Tugas tampil di bawah mata kuliahnya pada kelompok hari tersebut. | Must |
| FR-14 | Menandai tugas selesai dan membatalkan tanda selesai (toggle). Tugas selesai tampil berbeda (mis. dicoret, warna muted) dan diurutkan setelah tugas belum selesai. | Must |
| FR-15 | Menghapus tugas, dengan konfirmasi singkat atau opsi undo beberapa detik. | Must |
| FR-16 | Menampilkan jumlah tugas belum selesai per mata kuliah. | Could |

### 3.4 Penyimpanan
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-17 | Setiap perubahan disimpan otomatis ke `localStorage`. Data tetap ada setelah halaman di-refresh. | Must |
| FR-18 | Jadwal default (bagian 6) dimuat hanya saat pertama kali dibuka, ditandai flag `seeded`. Jika pengguna menghapus semua mata kuliah, data default tidak dimuat ulang. | Must |
| FR-19 | Ekspor dan impor data sebagai file JSON. | Could |

## 4. Kebutuhan Non-Fungsional

- **NFR-01 Tampilan**: minimalist sesuai `docs/DESIGN.md`. Hanya memakai design token, tanpa warna atau ukuran yang ditulis langsung di komponen.
- **NFR-02 Responsif**: berfungsi dari lebar 360px. Di layar kecil, jadwal tampil sebagai daftar per hari, bukan tabel lebar yang bisa di-scroll horizontal.
- **NFR-03 Aksesibilitas**: kontras WCAG AA, bisa dioperasikan dengan keyboard, fokus terlihat jelas, form punya label, tombol hapus punya nama yang jelas bagi screen reader.
- **NFR-04 Performa**: tanpa layout shift, halaman interaktif cepat di ponsel biasa. Hindari dependency berat.
- **NFR-05 Ketahanan data**: akses `localStorage` dibungkus try/catch. Bila gagal (mis. mode privat), aplikasi tetap jalan di memori dan memberi tahu pengguna bahwa data tidak akan tersimpan. Data yang rusak atau tidak valid tidak boleh membuat aplikasi crash.
- **NFR-06 Versi skema**: data memuat `schemaVersion` agar perubahan struktur di masa depan bisa dimigrasi.
- **NFR-07 Privasi**: tidak ada data yang dikirim ke server mana pun. Tanpa analytics atau font dari CDN.
- **NFR-08 Reproduksibilitas**: `package-lock.json` ikut di-commit. `npm install` dan `npm run build` harus berhasil di mesin bersih tanpa langkah tambahan.
- **NFR-09 Kualitas kode**: `npm run lint`, `npm run build`, dan `npm test` lolos tanpa error. Logika data (urut jam, hitung SKS, deteksi bentrok, validasi, seed) punya tes Vitest.

## 5. Model Data

```ts
type Day = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';

interface Course {
  id: string;
  day: Day;
  start: string;       // "HH:mm" 24 jam, mis. "07:30". Ditampilkan sebagai "07.30".
  end: string;
  code?: string;
  name: string;
  sks?: number;
  pj?: string;
  pd1?: string;        // kosong untuk tanda "–"
  room?: string;
}

interface Task {
  id: string;
  courseId: string;
  title: string;
  due?: string;        // "YYYY-MM-DD"
  done: boolean;
  createdAt: string;   // ISO
}

interface AppState {
  schemaVersion: number;
  seeded: boolean;
  meta: { title: string; program: string; semester: string };
  courses: Course[];
  tasks: Task[];
}
```

## 6. Data Default

### 6.1 Jadwal
- Judul: JADWAL KULIAH TEKNIK INFORMATIKA, SEMESTER 1 KELAS B
- Program: W/TI
- Semester: Ganjil 2026/2027
- Total: 20 SKS (harus sama dengan hasil hitung otomatis)

| Hari | Jam | Kode | Mata Kuliah | SKS | PJ | PD 1 | Ruang |
|---|---|---|---|---|---|---|---|
| Senin | 07.30–09.10 | INF625107 | Teknik Digital B | 2 | Mona A.M. Batubara | Rizkima Akbar Setiawan | Mektan 3.1 |
| Selasa | 07.30–09.10 | UNI625109 | Bahasa Indonesia B | 2 | Eka Sofia Ayu | Setiyo Putri | H5 |
| Selasa | 10.50–12.30 | INF625101 | Pengenalan Pemrograman B | 2 | Yessi Mulyani | Nurrahma | H17 |
| Rabu | 10.00–12.30 | INF625102 | Algoritma Pemrograman B | 3 | Wahyu Eko S. | Titin Yulianti | H20 |
| Rabu | 15.30–17.10 | INF625105 | Logika B | 2 | Sumadi | Nurrahma | H17 |
| Kamis | 07.30–09.10 | INF625103 | Kalkulus B | 2 | Zulmiftah | Nurrahma | Mektan 3.2 |
| Kamis | 10.00–12.30 | INF625106 | Probabilitas dan Statistik B | 3 | Resty Annisa | Rio Ariestia Pradipta | H20 |
| Jumat | 07.30–09.10 | UNI625107 | Pancasila B | 2 | Dayu Rika Perdana | Deny Budiyanto | H5 |
| Sabtu | 07.00–09.50 | INF625104 | Praktikum Pengenalan Pemrograman B | 1 | Yessi Mulyani | Bambang Sundari | Lab Komputer |
| Sabtu | 09.50–12.40 | INF625108 | Praktikum Teknik Digital B | 1 | Mona A.M. Batubara | – | Lab Digital |

Catatan: transkripsi mengikuti tulisan pada gambar sumber. Nama dosen dan kode mata kuliah dipertahankan sebagaimana terbaca. Tanda "–" disimpan sebagai `pd1` kosong.

### 6.2 Motivasi
- Semangat Kuliah!
- Belajar hari ini, sukses nanti!
- "Disiplin hari ini adalah investasi terbaik untuk masa depanmu."

## 7. Di Luar Lingkup (versi ini)

- Akun pengguna, login, dan sinkronisasi antar perangkat.
- Notifikasi atau pengingat tugas.
- Banyak semester atau banyak jadwal sekaligus.
- Integrasi kalender eksternal.
- Backend, database, atau server apa pun.

## 8. Asumsi dan Pertanyaan Terbuka

1. Kepanjangan "PD 1" belum dikonfirmasi. Label dipakai apa adanya.
2. Tugas diasumsikan terikat ke mata kuliah (mingguan), bukan ke tanggal pertemuan tertentu. Bila ingin tugas per pertemuan, model `Task` perlu field tanggal pertemuan.
3. Karena data hanya di satu browser, membersihkan data situs akan menghapus jadwal. Ekspor JSON (FR-19) adalah mitigasinya.

## 9. Riwayat Revisi

| Versi | Perubahan |
|---|---|
| 0.1 | Draf awal. |
| 0.2 | Menambah bagian Teknologi (Vite + Svelte + TypeScript, npm, Vitest), struktur folder, NFR-08 dan NFR-09, serta penegasan tanpa backend di luar lingkup. |
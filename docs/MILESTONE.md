# Milestones — Jadwal Mata Kuliah

Versi: 0.2
Referensi: `docs/SRS.md` (v0.2), `docs/DESIGN.md`.
Stack: Vite + Svelte + TypeScript, CSS variables, Vitest, npm.

Kerjakan berurutan. Jangan mulai milestone berikutnya sebelum kriteria selesai milestone sebelumnya terpenuhi.

## Definition of Done (berlaku untuk semua milestone)

- `npm run lint`, `npm run build`, dan `npm test` lolos tanpa error.
- Tidak ada warna, ukuran font, atau spasi yang ditulis langsung di komponen. Semua lewat token dari `docs/DESIGN.md`.
- Tidak ada dependency baru tanpa alasan tertulis. Hanya npm yang dipakai, lockfile satu-satunya adalah `package-lock.json`.
- Tidak ada fitur di luar milestone yang sedang dikerjakan.
- Perubahan pada `package.json` atau `package-lock.json` ikut di-commit.

## M0 — Persiapan

**Tujuan**: fondasi proyek siap dan bisa dijalankan.

- Periksa apakah repo sudah berisi proyek. Jika sudah, ikuti stack yang ada dan tanyakan dulu sebelum mengubahnya.
- Jika belum, inisialisasi dengan `npm create vite@latest` (template `svelte-ts`), lalu `npm install`.
- Pastikan skrip `dev`, `build`, `lint`, dan `test` ada di `package.json`. Tambahkan Vitest bila belum ada.
- Pastikan `docs/DESIGN.md` dan file rules agent sudah ada.
- Siapkan design token (warna, tipografi, spasi) sebagai CSS variables global sesuai DESIGN.md.
- Buat kerangka folder sesuai SRS 2.4 (boleh disesuaikan dengan konvensi repo).

**Selesai bila**: `npm run dev` menampilkan halaman kosong dengan font dan warna dasar sesuai DESIGN.md, dan `npm run build` serta `npm test` berjalan (tes boleh masih kosong).

## M1 — Data dan Penyimpanan

**Tujuan**: model data dan persistensi berjalan sebelum ada UI.
**Mencakup**: FR-17, FR-18, NFR-05, NFR-06, NFR-09.

- `src/lib/types.ts`: tipe `Course`, `Task`, `AppState` sesuai SRS bagian 5.
- `src/lib/defaults.ts`: data default (SRS 6.1) dan teks motivasi (SRS 6.2), terpisah dari logika.
- `src/lib/storage.ts`: load, save, seed sekali (flag `seeded`), validasi data yang dibaca, try/catch untuk `localStorage`, dan `schemaVersion`.
- `src/lib/schedule.ts`: urut berdasarkan jam, hitung total SKS, deteksi bentrok jam.
- Tes Vitest untuk `schedule.ts` dan `storage.ts`.

**Selesai bila**:
- Pertama kali dibuka, data default termuat. Refresh tidak menggandakannya.
- Total SKS hasil hitung = 20.
- Data `localStorage` yang rusak tidak membuat aplikasi crash.
- Tes Vitest mencakup: urut jam, hitung SKS, deteksi bentrok (termasuk kasus jam selesai = jam mulai berikutnya yang bukan bentrok), seed sekali, dan data rusak.

## M2 — Tampilan Jadwal

**Tujuan**: jadwal tampil rapi dan minimalist.
**Mencakup**: FR-01 sampai FR-04, NFR-01, NFR-02.

- Header (judul, program, semester, total SKS).
- Jadwal dikelompokkan per hari, urut jam, tampil semua kolom (kode, nama, SKS, PJ, PD 1, ruang).
- Sorot hari ini (WIB), pesan bila hari ini kosong.
- Blok Motivasi.
- Layout responsif: daftar per hari di ponsel, bukan tabel lebar.

**Selesai bila**: seluruh 10 mata kuliah default tampil benar di lebar 360px dan 1280px tanpa scroll horizontal, hari ini tersorot, dan tampilan sesuai DESIGN.md.

## M3 — Tambah dan Hapus Jadwal

**Tujuan**: pengguna bisa mengisi jadwal sendiri.
**Mencakup**: FR-06 sampai FR-09, plus FR-05, FR-10, FR-11 (Should).

- Form tambah mata kuliah dengan validasi dan pesan error per field.
- Peringatan bentrok (tidak memblokir).
- Hapus dengan konfirmasi; konfirmasi menyebut jumlah tugas yang ikut terhapus.
- Should: edit mata kuliah, edit header, reset ke default dengan konfirmasi.
- Tambahkan tes Vitest untuk validasi form.

**Selesai bila**:
- Tambah mata kuliah baru langsung muncul di hari yang benar dan bertahan setelah refresh.
- Jam selesai ≤ jam mulai ditolak dengan pesan jelas.
- Hapus semua mata kuliah menghasilkan halaman kosong yang rapi, dan refresh tidak memunculkan data default lagi.
- Reset ke default mengembalikan 10 mata kuliah awal.

## M4 — Tugas

**Tujuan**: pengguna bisa mengelola tugas per mata kuliah.
**Mencakup**: FR-12 sampai FR-15, plus FR-16 (Could).

- Tambah tugas dari dalam kartu mata kuliah (judul wajib, tenggat opsional).
- Tugas tampil di bawah mata kuliahnya.
- Toggle selesai dan batal selesai, tugas selesai diurutkan di bawah.
- Hapus tugas dengan konfirmasi singkat atau undo.
- Tambahkan tes Vitest untuk urutan tugas dan penghapusan berantai (hapus mata kuliah menghapus tugasnya).

**Selesai bila**:
- Tugas bertahan setelah refresh.
- Menghapus mata kuliah ikut menghapus tugasnya, tanpa meninggalkan tugas yatim di data.
- Tugas selesai dan belum selesai terlihat jelas berbeda tanpa bergantung pada warna saja.

## M5 — Poles dan Rilis

**Tujuan**: kualitas akhir.
**Mencakup**: NFR-02 sampai NFR-04, NFR-07, NFR-08, FR-19 (Could).

- Audit aksesibilitas: kontras AA, navigasi keyboard, label form, fokus terlihat.
- Keadaan kosong, pesan error, dan pesan saat penyimpanan tidak tersedia.
- Cek `prefers-reduced-motion`.
- Cek tidak ada request jaringan ke pihak ketiga (tanpa font CDN dan analytics).
- Verifikasi reproduksibilitas: pada salinan bersih repo, `npm install` lalu `npm run build` berhasil tanpa langkah tambahan.
- Could: ekspor dan impor JSON.
- Review akhir terhadap `docs/DESIGN.md`, catat penyimpangan bila ada.
- Opsional: deploy ke hosting statis (GitHub Pages, Netlify, atau Cloudflare Pages).

**Selesai bila**: seluruh kebutuhan Must di SRS terpenuhi, semua kriteria Definition of Done lolos, build di mesin bersih berhasil, dan daftar penyimpangan terhadap DESIGN.md (bila ada) sudah dicatat.

## Riwayat Revisi

| Versi | Perubahan |
|---|---|
| 0.1 | Draf awal. |
| 0.2 | Menyesuaikan dengan SRS v0.2: stack Vite + Svelte + TypeScript, npm, Vitest, struktur file di M1, dan cek build bersih di M5. |

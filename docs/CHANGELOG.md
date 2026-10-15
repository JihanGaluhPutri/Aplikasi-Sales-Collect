# Changelog

Perubahan penting SalesCollect. Format mengikuti
[Keep a Changelog](https://keepachangelog.com/id/1.1.0/);
tanggal berdasarkan sejarah commit git yang sebenarnya.

Semua versi belum memiliki tag Git rilis — penomoran versi mengikuti
`version` di `app.json` (mulai `1.0.0`).

## [Unreleased]

### Added

- Folder `docs/` sebagai pusat dokumentasi project: arsitektur, database &
  state, API & keamanan, use case, deployment, panduan pengguna, pengujian,
  dan changelog ini.
- `SalesCollect-Product-Backlog.md` dipindahkan ke
  `docs/PRODUCT_BACKLOG.md`.

### Changed

- `README.md` disusun ulang menjadi ringkasan non-teknis (latar belakang,
  tujuan, fitur, role, cara menjalankan) dengan tautan ke dokumentasi di
  `docs/`.

## [1.0.0] - 2026-10-10

Rilis pertama — aplikasi pencatatan piutang berbasis penjualan
(React Native + Expo + Supabase). Dari commit `026ae02` sampai `0dec771`.

### Added

- **Autentikasi**: register, login, lupa/reset password (Supabase Auth),
  session tersimpan di perangkat, onboarding sekali tampil, logout, dan
  pesan "Sesi Anda berakhir" saat session habis.
- **Dua role**: Admin (menu dashboard, customers, sales, invoices,
  monitoring, reports, profile) dan Sales (menu dashboard, my invoices,
  profile) — route guard per role.
- **Customer CRUD** (admin): nama wajib; hapus ditolak bila customer masih
  punya invoice; detail menampilkan invoice terkait.
- **Sales CRUD** (admin): data sales + opsi menautkan akun login; status
  aktif/nonaktif; detail berisi invoice yang ditugaskan.
- **Invoice**: pembuatan (status awal `belum_ditagih`), pencarian, filter
  status, edit, hapus, dan penugasan/alih sales.
- **Penagihan (sales)**: pembaruan status linear
  `belum_ditagih → sudah_ditagih → dibayar`; unggah bukti pembayaran wajib
  sebelum status `dibayar` (upload → RPC atomic, gagal upload = status
  tidak berubah); riwayat status otomatis.
- **Dashboard**: ringkasan collection (admin) dan ringkasan tagihan milik
  sendiri (sales) via fungsi SQL agregasi.
- **Monitoring** (admin): cari + filter status seluruh invoice.
- **Reports** (admin): laporan per rentang tanggal — ringkasan & rincian
  per sales — plus export **Excel (.xlsx)** via share sheet.
- **Bukti bayar**: bucket storage privat `payment-proofs` (5 MB, tipe
  gambar), akses via signed URL, policies berbasis kepemilikan invoice.
- **Keamanan database**: RLS aktif di seluruh tabel; helper otorisasi
  `is_admin` / `can_access_invoice` / `can_access_customer`; trigger
  profile otomatis saat register (role default `sales`); constraint unik &
  check; index untuk filter/search.
- **Quality tooling**: `npm run typecheck` dan `npm run lint`
  (typecheck & lint lulus pada 2026-10-15).
- Build konfigurasi Expo (`app.json`, scheme `salescollect`) + EAS
  profiles (`development`, `preview`, `production`) dan `.env.example`.

### Changed

- `0dec771` — `docs: perindah README - fitur unggulan, TOC, diagram
  Mermaid, section collapsible`.
- `4507e65` — `fix: README - hapus code fence yang membungkus konten
  sehingga badge tidak tampil`.

### Removed

- `34e1e2e` — `chore: hapus SalesCollect-Technical-Backlog.md dan file
  internal dari repo` (file internal tidak lagi masuk repository; backlog
  teknis tetap lokal dan di-`.gitignore`).

### Notes

- Tiga commit `22f63a0`, `ff36fe0`, `5952103` (`Update README.md`)
  berasal dari kontributor lain di repository kelas (`Jiweng Suka
  Menolong`) — perubahan README saja, tanpa dampak kode.
- Pengujian otomatis (unit/E2E) belum tersedia; lihat `docs/TESTING.md`.
- Aplikasi belum dipublikasikan ke toko aplikasi (tidak ada bukti build
 /store submission di repository).

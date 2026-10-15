# Pengujian dan Quality Check

Dokumen ini mencatat **apa yang benar-benar sudah diuji** dan menyediakan
checklist pengujian fitur. Jika tidak ada bukti hasil, fitur ditandai
**belum diuji** — tidak ada klaim pengujian yang tidak dilakukan.

## 1. Status Pengujian Terkini

| Jenis | Perintah | Hasil | Tanggal |
| --- | --- | --- | --- |
| Type check | `npm run typecheck` (tsc --noEmit) | ✅ **Lulus** (exit 0) | 2026-10-15 |
| Lint | `npm run lint` (expo lint / ESLint) | ✅ **Lulus** (exit 0) | 2026-10-15 |
| Unit test | – | ⛔ **Tidak ada** file test (`*.test.*` / `*.spec.*`) atau test runner terpasang | – |
| Integration / E2E | – | ⛔ **Tidak ada** harness (Detox, Maestro, dll.) | – |
| Uji manual fitur | – | ⚠️ **Belum terdokumentasi** — checklist di bagian 3 | – |

Konfigurasi test yang ada di project saat ini: **tidak ada**. `package.json`
hanya menyediakan script `start`, `android`, `ios`, `web`, `lint`,
`typecheck`.

## 2. Jalur Pengujian Manual

Pengujian dijalankan di lingkungan development (lihat
`docs/DEPLOYMENT_AND_OPERATIONS.md` bagian 4):

```bash
npm install
cp .env.example .env     # isi EXPO_PUBLIC_SUPABASE_URL & _ANON_KEY
npm run typecheck
npm run lint
npm start                # lalu uji di Expo Go / dev client
```

Syarat uji fungsional: database Supabase sudah dimigrasikan
(`001`–`014`) dan minimal ada 1 akun admin + 1 akun sales.

## 3. Checklist Pengujian Fitur

Centang hanya setelah benar-benar diuji di perangkat/emulator.

### 3.1 Autentikasi (Belum diuji)

- [ ] Register valid (nama, email, konfirmasi password) → masuk sebagai sales
- [ ] Register invalid (email salah, password tidak cocok, kolom kosong) → pesan error jelas
- [ ] Login valid (admin & sales) → redirect sesuai role
- [ ] Login invalid (password salah, akun tidak ada) → pesan error akurat (tidak bocor info akun)
- [ ] Lupa password → email terkirim → link membuka reset-password
- [ ] Reset password → password lama tidak berlaku, password baru bisa login
- [ ] Akses route tanpa session → dialihkan ke Login
- [ ] Sales membuka `/admin/*` → dialihkan ke `/sales`; admin kebalikannya
- [ ] Sesi habis → pesan "Sesi Anda berakhir" → ke Login
- [ ] Onboarding tampil sekali saja (hapus app / `sc_onboarding_seen` untuk mengulang)

### 3.2 Admin — Customer (Belum diuji)

- [ ] Tambah customer valid → muncul di daftar
- [ ] Validasi: nama wajib diisi (empty state error)
- [ ] Edit customer → perubahan tersimpan & tampil di list
- [ ] Detail menampilkan invoice terkait
- [ ] Hapus customer **tanpa** invoice → berhasil
- [ ] Hapus customer **dengan** invoice → ditolak ("masih memiliki N invoice")

### 3.3 Admin — Sales (Belum diuji)

- [ ] Tambah sales (+ opsi tautkan akun) → muncul di daftar
- [ ] Sales baru tersedia di selector saat membuat invoice
- [ ] Detail sales menampilkan invoice yang ditugaskan
- [ ] Toggle aktif/nonaktif → sales nonaktif tak bisa dipilih assignment baru
- [ ] Sales nonaktif tetap tampil di riwayat/laporan

### 3.4 Admin — Invoice (Belum diuji)

- [ ] Tambah invoice → status awal `belum_ditagih`
- [ ] Validasi: nominal ≥ 0, `due_date >= invoice_date`, nomor unik
- [ ] Nomor invoice duplikat → ditolak (constraint DB)
- [ ] Cari invoice (nomor & nama customer)
- [ ] Filter status (semua/chip status), digabung dengan pencarian
- [ ] Edit invoice → perubahan tersimpan
- [ ] Alihkan sales → invoice pindah ke sales baru
- [ ] Hapus invoice → hilang beserta riwayatnya
- [ ] Sales **tidak** bisa membuat/mengedit/menghapus invoice (uji: role sales)

### 3.5 Sales — Penagihan (Belum diuji)

- [ ] My Invoices hanya menampilkan invoice milik sendiri
- [ ] Dashboard sales hanya menghitung invoice milik sendiri
- [ ] `belum_ditagih → sudah_ditagih` → berhasil + riwayat tercatat
- [ ] `sudah_ditagih → dibayar` tanpa bukti → ditolak
- [ ] `sudah_ditagih → dibayar` dengan foto → upload sukses → status + path tersimpan
- [ ] Transisi mundur / melompat / status sama → ditolak
- [ ] Upload bukti gagal (koneksi mati) → status tidak berubah
- [ ] Bukti bayar tampil di detail (milik sendiri) + admin bisa melihat
- [ ] Sales tidak bisa melihat invoice sales lain (uji langsung + RLS)

### 3.6 Laporan & Monitoring (Belum diuji)

- [ ] Monitoring: cari + filter status
- [ ] Reports: ringkasan periode sesuai filter tanggal
- [ ] Reports: rincian per sales + "Belum ditugaskan" untuk `sales_id` NULL
- [ ] Export menghasilkan file `.xlsx` terbuka & angka sesuai layar
- [ ] Admin melihat seluruh data; sales tidak punya akses menu laporan

### 3.7 Profil & Logout (Belum diuji)

- [ ] Ubah nama profil → tersimpan (setelah buka ulang aplikasi)
- [ ] Logout → session terhapus → diarahkan ke Login
- [ ] Role tidak bisa diubah dari layar profil

### 3.8 Non-fungsional (Belum diuji)

- [ ] Tanpa koneksi internet → pesan "Koneksi bermasalah", tidak crash
- [ ] Timeout request (15 detik) → pemulihan bisa dicoba ulang
- [ ] Data sensitif: tidak ada password/secret di log; `.env` tidak ter-commit (`git status`)
- [ ] Format uang/tanggal Indonesia tampil benar (`utils/currency.ts`, `utils/date.ts`)
- [ ] Aplikasi di layar kecil / perangkat nyata (bukan hanya emulator)

## 4. Cara Menandai Hasil

Saat fitur diuji, catat di bagian 1 (tanggal + hasil) dan centang item di
bagian 3. Jika unit test ditambahkan kemudian, daftarkan perintahnya di
bagian 1 beserta hasil `npm test` (atau sejenisnya).

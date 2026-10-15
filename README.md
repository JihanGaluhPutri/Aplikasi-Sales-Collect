<div align="center">

# 📱 SalesCollect

**Aplikasi mobile untuk mencatat dan memantau piutang berdasarkan penjualan**

![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

</div>

---

## 📖 Latar Belakang

Usaha yang penjualannya banyak dijalankan beberapa sales sering mengalami
masalah piutang yang **sulit dipantau**: siapa berhutang, berapa besar,
kapan jatuh tempo, dan apakah sudah dibayar — informasi tersebar di buku
catatan, chat, dan ingatan orang. Akibatnya tagihan terlambat ditagih,
piutang tidak tertagih, dan pemilik usaha tidak punya gambaran utuh.

## 🎯 Tujuan dan Manfaat

**Tujuan SalesCollect:** menyediakan satu aplikasi tempat seluruh
penagihan dicatat, ditugaskan, dan dipantau secara terpusat.

**Manfaat:**

- **Pemilik usaha (Admin)** tahu posisi piutang kapan saja, lengkap dengan
  laporan per periode dan per sales yang bisa diunduh ke Excel.
- **Sales** jelas menerima daftar tagihan miliknya dan mencatat perkembangan
  penagihan sampai benar-benar dibayar, lengkap dengan bukti bayar.
- **Data aman dan tidak tumpang tindih** — sales hanya melihat tagihan yang
  menjadi tanggung jawabnya.
- **Riwayat lengkap** — setiap perubahan status penagihan tercatat beserta
  waktu dan pelakunya.

## ✨ Fitur

| Fitur | Keterangan |
| :--- | :--- |
| 🔐 **Masuk & daftar akun** | Login, register, lupa/reset password lewat email |
| 👥 **Dua jenis pengguna** | **Admin** (kelola data & laporan) dan **Sales** (penagihan) |
| 🧾 **Kelola invoice** | Buat, ubah, hapus, cari, dan filter status tagihan |
| 📌 **Penugasan sales** | Admin menugaskan/mengalihkan invoice ke sales tertentu |
| 🔄 **Status penagihan** | Urutan tetap: *Belum Ditagih → Sudah Ditagih → Dibayar*, dengan riwayat otomatis |
| 🧾 **Bukti bayar** | Sales mengunggah foto bukti sebelum tagihan ditandai Dibayar |
| 📊 **Dashboard** | Ringkasan piutang: jumlah invoice, pembagian status, total nominal |
| 📈 **Monitoring** | Pantau seluruh tagihan dengan pencarian dan filter status |
| 📑 **Laporan + Excel** | Laporan per tanggal dan per sales, bisa diunduh ke file Excel |
| 👤 **Profil** | Lihat/mengubah nama, ganti password via email, logout |

## 👤 Jenis Pengguna

**Admin** — mengelola customer, data sales, dan invoice; memantau semua
penagihan di Dashboard dan Monitoring; membaca laporan dan mengunduh Excel.

**Sales** — melihat dashboard dan daftar tagihan milik sendiri; memperbarui
status penagihan; mengunggah bukti bayar; mengelola profil.

> Panduan pemakaian lengkap per peran ada di
> [docs/USER_GUIDE.md](./docs/USER_GUIDE.md).

## 🔄 Alur Singkat Pemakaian

```text
Admin:  Tambah Customer & Sales  →  Buat Invoice  →  Tugaskan ke Sales
                    ↓                                    ↓
        Pantau (Dashboard/Monitoring)          Sales menagih pelanggan
                    ↓                                    ↓
        Laporan  →  Unduh Excel           Belum Ditagih → Sudah Ditagih
                                                        → Dibayar (+ bukti)
```

## 🛠️ Teknologi

Aplikasi dibangun dengan:

- **React Native + Expo + TypeScript** — aplikasi mobile lintas platform
- **Expo Router** — struktur layar & navigasi
- **Supabase (PostgreSQL, Auth, Storage)** — data, login, dan penyimpanan
  bukti bayar

## 🚀 Menjalankan Project

**1. Install dependencies**

```bash
npm install
```

**2. Siapkan environment**

```bash
cp .env.example .env
```

Isi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` dari
Supabase Dashboard → Project Settings → API.

**3. Jalankan aplikasi**

```bash
npm start
```

Perintah lain: `npm run android`, `npm run ios`, `npm run web`,
`npm run typecheck`, `npm run lint`.

> Detail instalasi, konfigurasi backend, dan build rilis ada di
> [docs/DEPLOYMENT_AND_OPERATIONS.md](./docs/DEPLOYMENT_AND_OPERATIONS.md).

## 📁 Struktur Folder

```text
SalesCollect/
├── app/                  # Layar aplikasi (per role: auth, admin, sales)
├── components/           # Komponen UI yang dipakai bersama
├── hooks/                # Logika bersama (sesi, data, proteksi layar)
├── services/             # Akses data (satu-satunya pintu ke database)
├── lib/                  # Konfigurasi Supabase
├── constants/            # Warna, jarak, dan tipografi
├── types/ & utils/       # Tipe data & fungsi bantu
├── supabase/migrations/  # Skema database
├── docs/                 # Dokumentasi project
└── package.json
```

## 📚 Dokumentasi

| Dokumen | Isi |
| :--- | :--- |
| [docs/PRODUCT_BACKLOG.md](./docs/PRODUCT_BACKLOG.md) | **Apa** yang dibangun dan **mengapa** — tujuan, lingkup, fitur |
| [docs/USER_GUIDE.md](./docs/USER_GUIDE.md) | Panduan pemakaian untuk Admin & Sales |
| [docs/USE_CASE_AND_FLOWS.md](./docs/USE_CASE_AND_FLOWS.md) | Daftar use case & alur pengguna |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Struktur aplikasi & alur kerja |
| [docs/DATABASE_AND_STATE.md](./docs/DATABASE_AND_STATE.md) | Skema database & pengelolaan state |
| [docs/API_AND_SECURITY.md](./docs/API_AND_SECURITY.md) | Integrasi backend & model hak akses |
| [docs/DEPLOYMENT_AND_OPERATIONS.md](./docs/DEPLOYMENT_AND_OPERATIONS.md) | Instalasi, build, dan troubleshooting |
| [docs/TESTING.md](./docs/TESTING.md) | Status pengujian & checklist |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Riwayat perubahan |

## 👩‍💻 Pengembang

**jihangaluh** — [github.com/JihanGaluhPutri](https://github.com/JihanGaluhPutri)

Repository:

- Kelas: [UNUGHA-Informatika-26/SalesCollect](https://github.com/UNUGHA-Informatika-26/SalesCollect)
- Utama: [JihanGaluhPutri/Aplikasi-Sales-Collect](https://github.com/JihanGaluhPutri/Aplikasi-Sales-Collect)

---

<div align="center">

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE).
Bebas dikembangkan, dimodifikasi, dan disesuaikan untuk kebutuhan
manajemen penagihan internal maupun operasional lainnya.

</div>

<div align="center">

# 📱 SalesCollect

**Aplikasi mobile untuk manajemen penagihan invoice sales (Invoice Collection Management System).**

![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

</div>

---

📋 **Dokumen acuan pengembangan:**

- [`SalesCollect-Product-Backlog.md`](./SalesCollect-Product-Backlog.md) — **apa** yang dibangun dan **mengapa**

---

## 🛠️ Technology Stack

| Layer | Teknologi |
| --- | --- |
| **Frontend** | React Native, Expo, TypeScript, Expo Router |
| **Backend** | Supabase (Auth, PostgreSQL, RLS, Storage opsional) |
| **Database** | PostgreSQL dengan Row Level Security |

### 📐 Arsitektur Sistem

```text
React Native
   ↓
Expo Router → Application Services (services/)
   ↓
Supabase Client (lib/supabase.ts)
   ↓
Supabase
 ├── Auth
 ├── PostgreSQL
 ├── RLS
 └── Storage (future/optional)

```

> ℹ️ Tidak ada backend Express/Node.js terpisah.

---

## 🚀 Menjalankan Project

**1. Install dependencies**

```bash
npm install

```

**2. Siapkan environment**

```bash
cp .env.example .env

```

> Isi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` dari **Supabase Dashboard → Project Settings → API**.

**3. Jalankan aplikasi**

```bash
npx expo start

```

**4. Pengecekan kualitas**

```bash
npm run typecheck   # npx tsc --noEmit
npm run lint        # npx expo lint

```

---

## 📁 Struktur Folder

```text
SalesCollect/
├── app/                  # Route & screen (Expo Router)
│   ├── (auth)/           # login, register, forgot-password, reset-password
│   └── (app)/            # protected area
│       ├── profile.tsx   # profil user (semua role)
│       ├── admin/        # menu, dashboard, monitoring, reports, customers/, sales/, invoices/
│       └── sales/        # menu, dashboard, invoices/ (my invoices + detail + update status)
├── components/           # Reusable UI components (form, selector, badge, dst.)
├── constants/            # Design system (warna, spacing, typography)
├── hooks/                # Custom React hooks
├── lib/                  # Konfigurasi library (Supabase client)
├── services/             # Data access / service layer
├── supabase/migrations/ # Database migration SQL
├── types/                # TypeScript types
├── utils/                # Helper (error handling, dst.)
├── assets/               # Gambar/font
├── .env.example          # Template environment variable
└── package.json

```

📌 **Aturan pemakaian:**

* Query database hanya lewat `services/`, bukan dari screen.
* Warna dan spacing selalu dari `constants/theme.ts`.
* Screen menggunakan component reusable (`Button`, `Input`, `Card`, `Badge`, `Loading`, `EmptyState`, `ErrorState`).
* Pesan error user diambil dari `utils/error.ts` (`getUserMessage`).

---

## 🔒 Environment & Keamanan

`.env` **tidak** masuk ke Git (lihat `.gitignore`).

**Variabel yang dipakai:**

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

```

⛔ **Larangan yang dipatuhi:**

* Tidak ada service-role key di aplikasi mobile.
* Tidak ada password yang disimpan sendiri di database aplikasi.
* Tidak ada custom authentication/JWT — password ditangani Supabase Auth.
* Tidak ada secret yang di-hardcode di source code.

### 🧪 Development vs Production

MVP ini memakai **satu project Supabase** untuk development dan production; environment ditentukan oleh isi `.env` saat build (nilai `EXPO_PUBLIC_*` dibundle ke dalam binary), bukan oleh flag terpisah. Untuk produksi yang benar-benar terpisah:

1. Buat project Supabase production baru (akun Supabase pemilik).
2. Jalankan semua file `supabase/migrations/` berurutan (reproducible).
3. Salin `.env.example` → `.env` berisi URL + anon key project production.
4. Build ulang — nilai lama tidak boleh terbawa ke binary produksi.

Build profile EAS ada di `eas.json`: `development`, `preview`, `production` (masing-masing menandai `EXPO_PUBLIC_ENVIRONMENT`). Jangan pernah menaruh service-role key di `.env` aplikasi.

* `gradlew.bat` gagal menemukan `gradle-wrapper.jar` dari path non-ASCII (proyek di OneDrive/`ドキュメント`) — build native dijalankan dari salinan path ASCII, atau langsung via `java -cp gradle/wrapper/gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain`.
* `GRADLE_USER_HOME` user-level menunjuk ke instalasi scoop (`...\scoop\apps\gradle\current\.gradle`) dan merusak kompilasi Gradle Kotlin DSL (`Unresolved reference 'plugins'`) — build harus meng-override `GRADLE_USER_HOME` ke direktori bersih.
* NDK/membutuhkan path proyek pendek (batas path panjang Windows) — gunakan root pendek seperti `C:\sc\SalesCollect` untuk build native.

---

## 🔑 Konfigurasi Supabase Auth

Alur lupa/reset password mengirim link email dengan redirect `Linking.createURL('reset-password')` (lihat `services/authService.ts`):

* **Development (Expo Go / dev client):** `exp://<host>:<port>/--/reset-password`
* **Production (scheme `salescollect` di `app.json`):** `salescollect://reset-password`

> ⚠️ Daftarkan URL tersebut di **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs** sebelum memakai fitur "Lupa Password".

Register/login murni email + password (Supabase Auth). Sesi disimpan oleh Supabase Auth client di device (AsyncStorage) — aplikasi tidak pernah menyimpan password atau membuat JWT sendiri. Setelah register, trigger `handle_new_user()` (migration 010) membuat row `profiles` dengan role `sales` (role dinaikkan manual oleh admin).

---

## 🗄️ Database

Migration berada di `supabase/migrations/` dan berurutan sesuai dependency:

| File | Isi |
| --- | --- |
| `001_enums.sql` | Enum `user_role`, `invoice_status` |
| `002_profiles.sql` | Tabel `profiles` + trigger `updated_at` |
| `003_sales.sql` | Tabel `sales` |
| `004_customers.sql` | Tabel `customers` |
| `005_invoices.sql` | Tabel `invoices` |
| `006_invoice_status_history.sql` | Tabel `invoice_status_history` |
| `007_indexes.sql` | Index untuk filter/search/ownership |
| `008_constraints.sql` | Unique, check, dan constraint lainnya |
| `009_rls_policies.sql` | Helper function, RLS, dan policies |
| `010_profile_trigger.sql` | Trigger `handle_new_user()` → profile otomatis (role `sales`) |
| `011_status_update_rpc.sql` | RPC `update_invoice_status()` (transisi linear + history) |
| `012_dashboard_report_functions.sql` | RPC agregasi `dashboard_summary()`, `collection_report_summary()`, `collection_report_by_sales()` |

### ⚡ Cara menerapkan migration

**Opsi A — Supabase SQL Editor**

Buka SQL Editor Supabase, jalankan file migration **berurutan** dari `001` sampai `012`.

**Opsi B — Supabase CLI**

```bash
supabase init          # sekali saja, menghasilkan supabase/config.toml
supabase link --project-ref <project-ref>
supabase db push

```

> ⚠️ Migration harus selalu ditambahkan sebagai file SQL — jangan mengubah schema hanya lewat SQL editor tanpa mencatatnya di `supabase/migrations`.

### 📊 Ringkasan schema

```text
auth.users
   │
   └── profiles (id, name, role, created_at, updated_at)
         │
         └── sales (id, user_id, name, phone, is_active, ...)
               │
               └── invoices (id, invoice_number, customer_id, sales_id,
                             amount, invoice_date, due_date, status, notes)
                     │
                     ├── customers (id, name, owner_name, phone, address)
                     │
                     └── invoice_status_history (id, invoice_id, old_status,
                                                 new_status, changed_by, changed_at)

```

---

## 🛡️ Model Keamanan (RLS)

| Actor | `profiles` | `sales` | `customers` | `invoices` | `invoice_status_history` |
| --- | --- | --- | --- | --- | --- |
| **Admin** | baca/tulis semua | baca/tulis semua | baca/tulis semua | baca/tulis/hapus | baca |
| **Sales** | baca/tulis profil sendiri | baca record sendiri | baca customer invoice miliknya | baca + update invoice miliknya | baca history invoice miliknya |
| **Sales A vs Sales B** | terpisah | terpisah | terpisah | **terisolasi** | terisolasi |
| **Tanpa login (anon)** | tidak ada privilege | tidak ada | tidak ada | tidak ada | tidak ada |

Kepemilikan invoice ditegakkan di database:

```sql
invoices.sales_id = sales.id
WHERE sales.user_id = auth.uid()

```

Frontend menyembunyikan menu hanyalah lapisan UX.
Security sebenarnya: **Supabase RLS + database constraints**.

### 🔄 Perubahan status invoice

Update status (sales, screen `sales/invoices/[id]`) hanya lewat RPC `update_invoice_status(invoice_id, new_status)` (migration 011):

* Transisi linear: `belum_ditagih → sudah_ditagih → dibayar`. Mundur, lompat, dan status sama ditolak dengan pesan error.
* Setiap perubahan menulis `invoice_status_history` (changed_by = pelaku).
* Row history **tidak bisa** di-INSERT/UPDATE/DELETE langsung oleh klien (baik sales maupun admin) — hanya via fungsi SECURITY DEFINER.

### 📈 Dashboard & report (agregasi database)

Angka dashboard dan collection report dihitung **di database**, bukan diunduh seluruhnya ke device. Tiga fungsi SQL (migration 012), semuanya `SECURITY INVOKER` sehingga hasilnya otomatis ter-scope oleh RLS:

* `dashboard_summary()` — total invoice, belum/sudah ditagih, dibayar, total nominal. Sales hanya melihat invoice miliknya; admin semua.
* `collection_report_summary(p_start, p_end)` — ringkasan periode (filter `invoice_date`).
* `collection_report_by_sales(p_start, p_end)` — rincian per sales (diurutkan nama, **tanpa ranking/skor performa**).

Execute hanya untuk role `authenticated` — anon ditolak. Aplikasi menolak rentang tanggal yang salah (mulai > akhir) di client sebelum query dijalankan.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE). Bebas dikembangkan, dimodifikasi, dan disesuaikan untuk kebutuhan manajemen penagihan internal maupun operasional lainnya.

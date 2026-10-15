# API dan Keamanan

Dokumen ini menjelaskan integrasi backend, autentikasi, hak akses, dan
praktik keamanan yang **benar-benar diterapkan** di SalesCollect, berdasarkan
source code (`lib/supabase.ts`, `services/`, `hooks/useAuth.tsx`) dan
migration SQL (009–014).

> Dokumen ini tidak pernah memuat password, token, API key, atau
> service-role key. Semua kredensial hanya hidup di `.env` (tidak masuk Git).

## 1. Integrasi Backend

SalesCollect tidak memiliki server backend sendiri. Seluruh integrasi
lewat **Supabase JS client** (`@supabase/supabase-js`) yang dikonfigurasi
di `lib/supabase.ts`:

| Modul Supabase | Dipakai untuk | Contoh di kode |
| --- | --- | --- |
| **Auth** | Register, login, logout, reset password, session | `services/authService.ts`, `hooks/useAuth.tsx` |
| **PostgREST** (query) | CRUD tabel via `.select()/.insert()/.update()/.delete()` | semua file `services/*` |
| **PostgreSQL RPC** | Operasi atomik & agregasi | `update_invoice_status()`, `dashboard_summary()`, `collection_report_summary()`, `collection_report_by_sales()` |
| **Storage** | Upload/unduh bukti pembayaran | `services/paymentProofService.ts` |

Konfigurasi client:

- URL dan anon key dibaca dari `EXPO_PUBLIC_SUPABASE_URL` dan
  `EXPO_PUBLIC_SUPABASE_ANON_KEY` (env var publik, di-bundle saat build).
- Client gagal langsung (`throw`) jika env var belum diisi — tidak ada
  fallback hardcode.
- Request timeout 15 detik (`AbortController`) → dipetakan ke pesan
  "Koneksi bermasalah" oleh `utils/error.ts`.
- Tidak ada `service-role key` di aplikasi (aturan eksplisit di komentar
  kode dan `.env.example`).

## 2. Autentikasi

Alur: **email + password via Supabase Auth** (TIDAK ada custom JWT,
TIDAK ada penyimpanan password di tabel aplikasi).

| Fitur | Implementasi | File |
| --- | --- | --- |
| Register | `supabase.auth.signUp` dengan `data: { name }` | `authService.register` |
| Login | `supabase.auth.signInWithPassword` + validasi form | `authService.login` |
| Logout | `supabase.auth.signOut` → bersihkan session | `authService.logout` |
| Lupa password | `resetPasswordForEmail` dengan `redirectTo = Linking.createURL('reset-password')` | `authService.sendPasswordReset` |
| Reset password | Mode `PASSWORD_RECOVERY` → `updateUser({ password })` | `authService.updatePassword`, `app/(auth)/reset-password.tsx` |
| Session | Disimpan di AsyncStorage, auto refresh token | `lib/supabase.ts`, `hooks/useAuth.tsx` |

Detail alur:

- **Redirect URL reset password** harus didaftarkan di Supabase Dashboard →
  Authentication → URL Configuration → Redirect URLs:
  - Development: `exp://<host>:<port>/--/reset-password`
  - Production (scheme `salescollect` di `app.json`): `salescollect://reset-password`
- **Profile otomatis**: trigger `handle_new_user()` (migration 010) membuat
  baris `profiles` saat user baru terdaftar, dengan role **selalu `sales`**
  dan nama dari metadata register (fallback: bagian sebelum `@` pada email).
  Register publik tidak pernah bisa menentukan role admin sendiri.
- **Session expired**: jika session hilang tanpa logout, `useRouteGuard`
  menampilkan toast "Sesi Anda berakhir" lalu mengarahkan ke `/login`.
- Aplikasi tidak pernah menyimpan password di luar Supabase Auth dan tidak
  pernah membuat/menandatangani JWT sendiri.

### Konfigurasi environment

| Variabel | Nilai | Status |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | URL project Supabase | Ditempatkan di `.env` lokal (tidak di-commit) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon/publishable key | Ditempatkan di `.env` lokal (tidak di-commit) |

`.env` masuk `.gitignore`; `.env.example` hanya berisi placeholder.
Service-role key **tidak pernah** diletakkan di aplikasi mobile.

## 3. Hak Akses Berdasarkan Role

### 3.1 Ringkasan peran

| | Admin | Sales | Anon (tanpa login) |
| --- | --- | --- | --- |
| `profiles` | baca/tulis semua | baca/tulis profil sendiri, tidak bisa menaikkan role sendiri | tidak ada |
| `sales` | baca/tulis semua | baca record sendiri | tidak ada |
| `customers` | baca/tulis/hapus semua | baca customer yang punya invoice miliknya | tidak ada |
| `invoices` | baca/tulis/hapus semua, assign sales | **hanya** baca + update invoice miliknya; TIDAK bisa insert/hapus | tidak ada |
| `invoice_status_history` | baca semua | baca history invoice miliknya | tidak ada |
| Storage `payment-proofs` | baca semua, hapus* | upload/update/delete di invoice miliknya, baca miliknya | tidak ada |

*Policies storage: SELECT untuk sales pemilik atau admin; INSERT/UPDATE/DELETE hanya sales pemilik invoice.

Kebijakan lengkap ada di `supabase/migrations/009_rls_policies.sql`
(tabel + policies) dan `013_payment_proof.sql` (storage).

### 3.2 Proteksi UI vs proteksi sebenarnya

- Route guard (`useRouteGuard`) dan penyembunyian menu hanyalah **lapisan UX**.
- Sumber kebenaran: **Supabase RLS + constraints database**. User yang
  memaksa akses langsung (misal lewat REST API Supabase) tetap ditolak
  database — sales A tidak pernah menerima baris milik sales B.

### 3.3 Helper otorisasi (migration 009)

Fungsi `SECURITY DEFINER` agar pemeriksaan role/ownership tidak terkena
RLS-nya sendiri (mencegah infinite recursion):

| Fungsi | Kegunaan |
| --- | --- |
| `is_admin()` | True jika user yang login ber-role admin |
| `can_access_invoice(uuid)` | True jika admin ATAU sales pemilik invoice |
| `can_access_customer(uuid)` | True jika admin ATAU customer punya invoice milik user |

## 4. Kebijakan RLS (Sudah Diterapkan)

Semua tabel aplikasi mengaktifkan RLS (`alter table ... enable row level
security`), dan **tidak ada policy untuk role `anon`** — request tanpa
login tidak mendapat privilege apa pun.

Poin kebijakan penting:

1. **Pembatasan berbasis role** — operasi tulis customer/sales/invoice
   (insert/update/delete) hanya admin. Sales tidak memiliki policy
   INSERT/DELETE invoices sama sekali.
2. **Ownership** — sales hanya membaca/mengupdate invoice yang `sales_id`
   terhubung ke record sales milik login user. `WITH CHECK` pada update
   mencegah invoice dipindahkan ke sales lain oleh sales yang bersangkutan.
3. **Self-service profile dengan batas** — user bisa membuat/mengubah
   profile sendiri **hanya dengan role `sales`**; menaikkan role ke `admin`
   hanya bisa dilakukan oleh admin (provisioning terkontrol).
4. **History immutable** — `invoice_status_history` tidak punya policy
   INSERT/UPDATE/DELETE untuk klien; hanya ditulis fungsi database.
5. **RPC status atomik** — `update_invoice_status` adalah
   `SECURITY DEFINER` dengan pemeriksaan eksplisit `can_access_invoice()`,
   transisi linear saja, dan `changed_by` selalu `auth.uid()` (tidak bisa
   dipalsukan). Revoke execute dari `anon`.
6. **Agregasi aman** — fungsi dashboard/report `SECURITY INVOKER` sehingga
   RLS tetap berlaku pada hasilnya; revoke dari `anon`, grant ke
   `authenticated`.
7. **Storage bucket private** — `payment-proofs` tidak pernah publik;
   akses diverifikasi ke tabel `invoices`+`sales` di dalam policy; file
   dibatasi 5 MB dan tipe gambar tertentu; URL ditampilkan via signed URL.
8. **Grant minimal** — role `anon` tidak diberi privilege SELECT/INSERT/
   UPDATE/DELETE pada tabel aplikasi.

## 5. Validasi Akses Data di Aplikasi

Lapisan aplikasi (belum menggantikan RLS, melengkapi UX):

- Query list invoice sales memakai `getMyInvoices()` yang memfilter
  `sales_id` milik user **dan** dibatasi RLS di sisi database.
- `invoiceService.updateInvoiceStatus` memvalidasi transisi status dan
  kewajiban bukti bayar di client sebelum memanggil RPC.
- Form divalidasi di client (`utils/validation.ts`): field wajib, panjang
  maksimum, email valid, konfirmasi password sama.
- `services/authService` dan screen memetakan error Supabase ke pesan
  manusiawi via `getUserMessage` (`utils/error.ts`).

## 6. Penanganan Informasi Sensitif

**Sudah diterapkan:**

- `.env` tidak masuk Git (`.gitignore`); `.env.example` hanya placeholder.
- Tidak ada secret yang di-hardcode di source code.
- Tidak ada service-role key di aplikasi mobile.
- Tidak ada password yang disimpan di tabel aplikasi (hanya Supabase Auth).
- Password tidak pernah muncul di log/`console` aplikasi.
- Bukti bayar di bucket private + signed URL (bukan URL publik permanen).
- Pesan error user tidak menampilkan detail teknis/internal database
  (diolah `utils/error.ts`).

**Belum dikerjakan (rekomendasi, bukan klaim):**

- Environment development dan production masih memakai **satu project
  Supabase** yang sama (lihat `docs/DEPLOYMENT_AND_OPERATIONS.md` —
  langkah pemisahan sudah didokumentasikan, belum dijalankan).
- Belum ada rotasi/monitoring khusus di sisi Supabase (mis. pemberitahuan
  otomatis ke admin) — di luar cakupan aplikasi mobile.
- Belum ada fitur rate limiting tambahan di sisi aplikasi di luar timeout
  request 15 detik.
- Belum ada audit log perubahan data selain `invoice_status_history`
  (riwayat perubahan status invoice).

## 7. Aturan yang Dipatuhi di Kode

Eksplisit tertulis dan ditegakkan di source/migration:

1. Tidak ada service-role key di aplikasi mobile.
2. Tidak ada password yang disimpan sendiri di database aplikasi.
3. Tidak ada custom authentication/JWT — password ditangani Supabase Auth.
4. Tidak ada secret yang di-hardcode di source code.
5. Query database hanya lewat `services/` (konsistensi + audit tunggal).
6. Migration selalu ditambahkan sebagai file SQL berurutan — bukan
   perubahan schema sembarangan lewat SQL editor.

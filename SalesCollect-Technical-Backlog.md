# SalesCollect — Technical Backlog

Technical Backlog ini menjadi acuan teknis pengembangan aplikasi SalesCollect.

- **Product Backlog** menjelaskan **apa** yang harus dibuat dan **mengapa**.
- **Technical Backlog** menjelaskan **bagaimana** sistem tersebut dibangun.

Dokumen ini merupakan gabungan **Part 1 + Part 2 + Part 3**, mencakup **TB-01 sampai TB-97**: dari inisialisasi project, database dan RLS, Auth, CRUD, assignment, collection, dashboard, report, testing, sampai deployment.

---

# PART 1 — Foundation + Database + Security

## 1. Aturan Pengembangan

Dokumen ini digunakan sebagai sumber acuan untuk developer dan AI coding assistant seperti OpenCode.

### 1.1 Aturan untuk OpenCode

Sebelum mengerjakan task:

1. Baca PRODUCT_BACKLOG.md.
2. Baca TECHNICAL_BACKLOG.md.
3. Pahami struktur project yang sudah ada.
4. Kerjakan satu TB dalam satu waktu.
5. Jangan mengerjakan TB lain yang belum diminta.
6. Jangan membuat fitur tambahan di luar scope task tanpa persetujuan.
7. Jangan menghapus fitur yang sudah selesai tanpa alasan teknis yang jelas.
8. Setelah selesai, jelaskan:
   - file yang dibuat;
   - file yang diubah;
   - fungsi yang ditambahkan;
   - dependency yang ditambahkan;
   - cara menjalankan;
   - cara melakukan testing.
9. Pastikan tidak ada error TypeScript.
10. Jangan menyimpan secret atau credential di source code.
11. Jangan menggunakan Supabase service-role key di aplikasi mobile.
12. Authentication harus menggunakan Supabase Auth.
13. Password tidak boleh disimpan sendiri di database aplikasi.
14. Security data harus menggunakan Supabase RLS.
15. Jangan hanya mengandalkan pengecekan role di frontend.
16. Gunakan TypeScript secara konsisten.
17. Gunakan komponen reusable daripada membuat UI yang sama berulang-ulang.
18. Ikuti design system SalesCollect.

## 2. Product Overview

### 2.1 Nama
SalesCollect

### 2.2 Tujuan
SalesCollect adalah aplikasi mobile untuk membantu perusahaan distributor mengelola proses penagihan invoice oleh sales lapangan.

### 2.3 Masalah
Proses manual menggunakan catatan, Excel, atau WhatsApp menyebabkan:
- status invoice sulit dipantau;
- pembagian invoice ke sales tidak terpusat;
- admin sulit mengetahui progress collection;
- informasi customer tersebar;
- rekap penagihan membutuhkan waktu.

### 2.4 Workflow Utama

```
Admin membuat invoice
        ↓
Admin memilih Sales
        ↓
Invoice diberikan kepada Sales
        ↓
Sales melihat invoice
        ↓
Sales mengunjungi customer
        ↓
Sales melakukan penagihan
        ↓
Sales mengubah status
        ↓
Admin memonitor status
```

## 3. Technology Stack

### 3.1 Frontend
- React Native
- Expo
- TypeScript
- Expo Router

### 3.2 Backend
Gunakan Supabase sebagai backend, untuk:
- Authentication
- PostgreSQL database
- Row Level Security
- Storage jika dibutuhkan pada fase berikutnya

### 3.3 Backend Architecture

Tidak perlu membuat Node.js/Express backend untuk MVP.

```
React Native
     ↓
Expo Router
     ↓
Application Services
     ↓
Supabase Client
     ↓
Supabase
 ├── Auth
 ├── PostgreSQL
 ├── RLS
 └── Storage (optional)
```

## 4. TB-01 — Project Initialization

**Tujuan:** Membuat project React Native menggunakan Expo dan TypeScript.

**Task:** Buat project dengan Expo, React Native, TypeScript, Expo Router.

**Target Structure**
```
SalesCollect/
├── app/
├── assets/
├── components/
├── constants/
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
├── PRODUCT_BACKLOG.md
├── TECHNICAL_BACKLOG.md
├── README.md
├── package.json
└── tsconfig.json
```

**Acceptance Criteria**
- Project dapat dijalankan.
- Expo berhasil start.
- TypeScript aktif.
- Expo Router aktif.
- Tidak ada error build awal.
- Project dapat dibuka di Expo Go atau environment development yang digunakan.

**Output:** Project SalesCollect dasar siap dikembangkan.

## 5. TB-02 — Project Folder Architecture

**Tujuan:** Membuat struktur folder agar project mudah dikembangkan.

- **app/** — Berisi route dan screen.
- **components/** — Berisi reusable UI components.
- **constants/** — Berisi constant seperti warna, spacing, dan konfigurasi UI.
- **hooks/** — Berisi custom React hooks.
- **lib/** — Berisi konfigurasi library utama seperti Supabase.
- **services/** — Berisi logic komunikasi dengan database/API.
- **types/** — Berisi TypeScript types.
- **utils/** — Berisi helper functions.

**Acceptance Criteria:** Folder utama tersedia dan digunakan sesuai tanggung jawabnya.

## 6. TB-03 — Expo Router Navigation

**Tujuan:** Membuat sistem navigation berdasarkan role.

**Target Structure**
```
app/
├── _layout.tsx
├── index.tsx
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
│
└── (app)/
    ├── _layout.tsx
    │
    ├── admin/
    │   ├── _layout.tsx
    │   ├── dashboard.tsx
    │   ├── customers/
    │   ├── sales/
    │   └── invoices/
    │
    └── sales/
        ├── _layout.tsx
        ├── dashboard.tsx
        └── invoices/
```

**Navigation Flow**
```
App
 ↓
Check session
 ↓
No session
 ↓
Login
Session exists
 ↓
Get profile
 ↓
Check role
 ├── admin → Admin Dashboard
 └── sales → Sales Dashboard
```

**Acceptance Criteria**
- User tanpa session tidak dapat mengakses area aplikasi.
- User dengan session diarahkan berdasarkan role.
- Admin tidak diarahkan ke area Sales.
- Sales tidak diarahkan ke area Admin.

## 7. TB-04 — Design System

**Tujuan:** Membuat standar UI agar tampilan konsisten.

**Color Palette**
```
primary: '#2563EB'
primaryDark: '#1D4ED8'
background: '#F8FAFC'
card: '#FFFFFF'
text: '#0F172A'
textSecondary: '#64748B'
border: '#E2E8F0'
success: '#16A34A'
warning: '#F59E0B'
danger: '#DC2626'
```

**Component Dasar**
```
components/
├── Button.tsx
├── Input.tsx
├── Card.tsx
├── Badge.tsx
├── Loading.tsx
├── EmptyState.tsx
└── ErrorState.tsx
```

- **Button** — support: primary, secondary, danger, disabled, loading
- **Input** — support: label, placeholder, value, error, secure text, keyboard type
- **Badge** — digunakan untuk status invoice (Belum Ditagih, Sudah Ditagih, Dibayar)

**Acceptance Criteria**
- Komponen reusable.
- Tidak membuat styling yang sama berulang kali.
- Warna menggunakan design system.
- UI konsisten.

## 8. TB-05 — Environment Configuration

**Tujuan:** Memisahkan configuration dan secret dari source code.

**Environment Variables (minimal)**
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

**Rules** — Jangan menyimpan `SUPABASE_SERVICE_ROLE_KEY`, password, database password, private secret di source code aplikasi.

**.gitignore** — Pastikan environment file yang berisi secret tidak masuk Git.

**Acceptance Criteria**
- Supabase URL tidak hardcoded di banyak file.
- Supabase public/anon key dikonfigurasi melalui environment.
- Service-role key tidak pernah digunakan di aplikasi mobile.

## 9. TB-06 — Supabase Client

**Tujuan:** Menghubungkan aplikasi dengan Supabase.

**File:** `lib/supabase.ts`

**Requirement** — Gunakan Supabase JavaScript client. Client harus: membaca environment variable; memiliki session persistence; dapat digunakan oleh services; tidak mengekspos service-role key.

**Acceptance Criteria**
- Supabase client berhasil dibuat.
- App dapat melakukan koneksi.
- Tidak ada credential hardcoded.
- Session dapat dipertahankan.

## 10. TB-07 — Database Enum

**Tujuan:** Membuat enum untuk role dan status invoice.

- **User Role:** `admin`, `sales`
- **Invoice Status:** `belum_ditagih`, `sudah_ditagih`, `dibayar`

Gunakan PostgreSQL enum atau database constraint yang konsisten.

**Acceptance Criteria**
- Status tidak bisa berisi nilai random.
- Role hanya bisa admin atau sales.
- Frontend menggunakan nilai yang sama dengan database.

## 11. TB-08 — Database Table: profiles

**Tujuan:** Menyimpan informasi profile user yang terhubung dengan Supabase Auth.

**Fields:** id, name, role, created_at, updated_at

**Schema**
```
id          uuid
name        text
role        user_role
created_at  timestamptz
updated_at  timestamptz
```

**Relationship:** `auth.users.id` → `profiles.id`

**Important** — Jangan menyimpan password, password_hash, refresh_token, service_role_key di profiles. Password dikelola oleh Supabase Auth.

**Acceptance Criteria**
- Setiap user memiliki profile.
- Profile terhubung dengan Auth user.
- Role tersedia.
- Password tidak disimpan di table profile.

## 12. TB-09 — Database Table: sales

**Tujuan:** Menyimpan data sales.

**Fields:** id, user_id, name, phone, is_active, created_at, updated_at

**Schema**
```
id          uuid
user_id     uuid nullable
name        text
phone       text nullable
is_active   boolean
created_at  timestamptz
updated_at  timestamptz
```

**Relationship:** profiles → sales → invoices. `user_id` menghubungkan record sales dengan account user jika sales memiliki account login.

**Important** — Untuk MVP, desain harus memungkinkan admin memiliki account, sales memiliki account, dan sales record dapat dihubungkan dengan user account.

**Acceptance Criteria**
- Sales dapat diidentifikasi secara unik.
- Sales memiliki status aktif/nonaktif.
- Sales dapat dikaitkan dengan user account.
- Data sales dapat digunakan untuk assignment invoice.

## 13. TB-10 — Database Table: customers

**Tujuan:** Menyimpan data customer.

**Fields:** id, name, owner_name, phone, address, created_at, updated_at

**Schema**
```
id          uuid
name        text
owner_name  text
phone       text
address     text
created_at  timestamptz
updated_at  timestamptz
```

**Acceptance Criteria**
- Customer memiliki ID unik.
- Nama customer wajib.
- Informasi customer dapat digunakan invoice.
- Customer dapat memiliki banyak invoice.

**Relationship:** customers → invoices (one customer dapat memiliki many invoices).

## 14. TB-11 — Database Table: invoices

**Tujuan:** Menyimpan seluruh data invoice.

**Fields:** id, invoice_number, customer_id, sales_id, amount, invoice_date, due_date, status, notes, created_at, updated_at

**Schema**
```
id              uuid
invoice_number  text
customer_id     uuid
sales_id        uuid nullable
amount          numeric
invoice_date    date
due_date        date
status          invoice_status
notes           text nullable
created_at      timestamptz
updated_at      timestamptz
```

**Relationships:** customers → invoices ← sales

**Rules**
- Invoice Number harus unik.
- Amount harus >= 0.
- Status default: `belum_ditagih`.
- Invoice harus memiliki customer.
- Untuk invoice yang sudah ditugaskan, sales_id harus mengarah ke sales yang valid.

**Acceptance Criteria**
- Invoice dapat dibuat.
- Invoice terhubung ke customer.
- Invoice dapat diassign ke sales.
- Status memiliki default belum_ditagih.
- Invoice number tidak duplicate.
- Amount tidak boleh negatif.

## 15. TB-12 — Database Table: invoice_status_history

**Tujuan:** Mencatat perubahan status invoice.

**Fields:** id, invoice_id, old_status, new_status, changed_by, changed_at

**Schema**
```
id           uuid
invoice_id   uuid
old_status   invoice_status nullable
new_status   invoice_status
changed_by   uuid
changed_at   timestamptz
```

**Relationship:** invoices → invoice_status_history (one invoice dapat memiliki banyak history).

**Contoh**
```
Invoice INV-001
Belum Ditagih → Sudah Ditagih → Dibayar

History:
old_status          new_status
--------------------------------
belum_ditagih       sudah_ditagih
sudah_ditagih       dibayar
```

**Acceptance Criteria** — Setiap perubahan status menghasilkan history yang dapat dilacak, minimal menyimpan: status sebelumnya, status baru, siapa yang mengubah, waktu perubahan.

## 16. TB-13 — Database Relationships

```
auth.users
   │
   └── profiles
          │
          └── sales
                 │
                 └── invoices
                        │
                        ├── customers
                        │
                        └── invoice_status_history
```

**Relationship Rules**
- Profile: `profiles.id → auth.users.id`
- Sales: `sales.user_id → profiles.id`
- Invoice Customer: `invoices.customer_id → customers.id`
- Invoice Sales: `invoices.sales_id → sales.id`
- Status History: `invoice_status_history.invoice_id → invoices.id`
- Changed By: `invoice_status_history.changed_by → profiles.id`

## 17. TB-14 — Database Indexing

**Tujuan:** Mempersiapkan database untuk query yang sering digunakan.

Minimal pertimbangkan index pada:
```
invoices.invoice_number
invoices.customer_id
invoices.sales_id
invoices.status
invoices.due_date
invoice_status_history.invoice_id
sales.user_id
```

**Acceptance Criteria:** Query utama tidak melakukan pencarian full table secara tidak perlu.

## 18. TB-15 — Database Constraints

Gunakan database constraint untuk menjaga integritas data:
- **Invoice Number** — Unique.
- **Amount** — Tidak boleh negatif.
- **Role** — Hanya `admin`, `sales`.
- **Status** — Hanya `belum_ditagih`, `sudah_ditagih`, `dibayar`.
- **Foreign Key** — Gunakan pada relationship penting.

**Acceptance Criteria:** Database tetap menolak data invalid meskipun request datang bukan dari UI aplikasi.

## 19. TB-16 — Row Level Security Foundation

**Tujuan:** Mengamankan database. RLS wajib aktif pada table yang berisi data aplikasi, minimal: profiles, sales, customers, invoices, invoice_status_history.

**Prinsip:** Frontend bukan security boundary.

```
Sales A
   ↓
Request invoice Sales B
   ↓
Database harus menolak
```

Bukan hanya "Frontend menyembunyikan invoice Sales B".

**Acceptance Criteria**
- RLS aktif.
- User tanpa authorization tidak dapat membaca data terlarang.
- Sales tidak dapat melihat invoice sales lain.
- Admin dapat mengakses data sesuai scope admin.

## 20. TB-17 — Role-Based RLS

**Admin** dapat melakukan operasi sesuai kebutuhan:
- customers: SELECT, INSERT, UPDATE, DELETE
- sales: SELECT, INSERT, UPDATE, DELETE
- invoices: SELECT, INSERT, UPDATE, DELETE
- invoice_status_history: SELECT

**Sales** hanya dapat:
- invoices: SELECT own invoices, UPDATE allowed fields/status on own invoices
- customers: SELECT customers related to own invoices
- invoice_status_history: SELECT history for own invoices

**Sales tidak boleh:** DELETE invoice, INSERT invoice, UPDATE invoice milik sales lain, MANAGE sales.

**Acceptance Criteria:** Authorization harus tetap aman meskipun request dilakukan langsung ke Supabase.

## 21. TB-18 — Sales Ownership Rule

**Tujuan:** Menentukan invoice mana yang boleh diakses oleh Sales.

```
current authenticated user
        ↓
profiles
        ↓
sales.user_id
        ↓
invoices.sales_id
```

Query authorization secara konsep:
```
invoice.sales_id = sales.id
WHERE sales.user_id = auth.uid()
```

**Acceptance Criteria:** Sales hanya dapat membaca invoice yang sales_id-nya terhubung dengan account tersebut.

## 22. TB-19 — Supabase SQL Migration

**Tujuan:** Semua perubahan database harus terdokumentasi. Gunakan migration SQL bila workflow Supabase CLI/project mendukung.

```
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_indexes.sql
    └── 003_rls_policies.sql
```

**Rules:** Jangan membuat database secara manual tanpa mendokumentasikan schema final.

**Acceptance Criteria:** Database dapat direkonstruksi dari migration yang tersedia.

## 23. TB-20 — TypeScript Database Types

**Tujuan:** Menyediakan type yang konsisten antara database dan frontend.

```
types/
├── database.ts
├── auth.ts
├── customer.ts
├── sales.ts
└── invoice.ts
```

Minimal type:
```ts
type UserRole = 'admin' | 'sales';
type InvoiceStatus =
  | 'belum_ditagih'
  | 'sudah_ditagih'
  | 'dibayar';
```

**Acceptance Criteria**
- Tidak menggunakan `any` secara sembarangan.
- Status invoice typed.
- Role typed.
- Model database memiliki TypeScript type.

## 24. TB-21 — Service Layer

**Tujuan:** Memisahkan logic database dari UI.

```
services/
├── authService.ts
├── profileService.ts
├── customerService.ts
├── salesService.ts
├── invoiceService.ts
├── dashboardService.ts
└── reportService.ts
```

Contoh: `Screen → Service → Supabase` (bukan `Screen → semua query database`).

**Acceptance Criteria**
- Database logic berada di service.
- Screen fokus pada UI dan interaction.
- Service dapat digunakan kembali.

## 25. TB-22 — Error Handling Foundation

**Tujuan:** Menyediakan standar error handling.

Jenis error: Validation, Authentication, Authorization, Database, Network, Unknown.

**User Message** — Jangan menampilkan error teknis mentah jika tidak diperlukan. Contoh: "Database error code XYZ..." lebih baik menjadi "Data gagal disimpan. Silakan coba lagi." Untuk debugging, error teknis tetap dapat dicatat secara aman.

**Acceptance Criteria**
- Error tidak menyebabkan app crash.
- User mendapatkan pesan yang jelas.
- Error dapat ditangani di service/screen.

## 26. TB-23 — Loading State Foundation

**Tujuan:** Memberikan feedback saat proses berlangsung (loading, button loading, skeleton/loading indicator jika diperlukan).

```
Button disabled → Request berjalan → Loading → Success / Error → Button aktif kembali
```

**Acceptance Criteria**
- Tidak ada duplicate submit karena user menekan tombol berkali-kali.
- Loading terlihat jelas.
- Loading berhenti setelah request selesai.

## 27. TB-24 — Empty State Foundation

**Tujuan:** Menangani kondisi tidak ada data (mis. "Belum ada invoice", "Belum ada customer", "Belum ada sales"). Empty state harus menjelaskan kondisi dan tindakan yang dapat dilakukan.

Contoh: "Belum ada customer. Tambahkan customer untuk mulai membuat invoice."

**Acceptance Criteria**
- List kosong tidak terlihat seperti error.
- CTA tersedia jika user memang memiliki permission untuk membuat data.

## 28. TB-25 — Success Feedback Foundation

**Tujuan:** Memberikan feedback setelah operasi berhasil (mis. "Customer berhasil ditambahkan.", "Invoice berhasil dibuat.", "Invoice berhasil diassign.", "Status berhasil diperbarui."). Gunakan toast/snackbar/dialog sesuai kebutuhan.

**Acceptance Criteria:** User mengetahui ketika action berhasil.

## 29. TB-26 — Development Quality Check

Setiap TB yang selesai harus melewati:
- **TypeScript** — No TypeScript errors
- **Lint** — No critical lint errors (jika linting digunakan)
- **Build** — Project harus dapat dijalankan
- **Runtime** — Tidak ada error kritis saat screen dibuka
- **Security** — Tidak ada secret yang masuk source code
- **Git** — Perubahan harus mudah dipahami melalui commit/diff

## 30. Definition of Done — Foundation

TB-01 sampai TB-26 dianggap selesai apabila:
- Expo project berjalan.
- TypeScript aktif.
- Expo Router aktif.
- Struktur folder tersedia.
- Design system tersedia.
- Supabase client terhubung.
- Environment configuration tersedia.
- Database schema selesai.
- Relationships benar.
- Constraints tersedia.
- Index penting tersedia.
- RLS aktif.
- Role-based access dirancang dan diterapkan.
- TypeScript types tersedia.
- Service layer tersedia.
- Loading state tersedia.
- Empty state tersedia.
- Error handling tersedia.
- Success feedback tersedia.
- Tidak ada major TypeScript/runtime error.

## 31. Urutan Implementasi Foundation

```
TB-01 → TB-02 → TB-03 → TB-04 → TB-05 → TB-06 → TB-07 → TB-08 → TB-09 → TB-10
→ TB-11 → TB-12 → TB-13 → TB-14 → TB-15 → TB-16 → TB-17 → TB-18 → TB-19 → TB-20
→ TB-21 → TB-22 → TB-23 → TB-24 → TB-25 → TB-26
```

Setelah foundation selesai, lanjut ke:
```
AUTHENTICATION → CUSTOMER → SALES → INVOICE → ASSIGNMENT → COLLECTION
→ DASHBOARD → REPORTING → TESTING → DEPLOYMENT
```

## 32. Prompt untuk OpenCode (Part 1)

```
Baca PRODUCT_BACKLOG.md dan TECHNICAL_BACKLOG.md.

Project ini adalah aplikasi React Native Expo TypeScript bernama SalesCollect.

Untuk sekarang kerjakan TB-01 saja.

Jangan mengerjakan TB-02 atau task lainnya.

Setelah selesai:
1. jelaskan file yang dibuat/diubah;
2. jelaskan dependency yang ditambahkan;
3. jelaskan cara menjalankan project;
4. lakukan pengecekan TypeScript;
5. laporkan error jika ada.

Jangan membuat fitur di luar TB-01.
```

---

# PART 2 — Authentication → Profile/Role → Customer → Sales → Invoice

*Catatan: Part 2 melanjutkan Part 1. Nomor TB diteruskan agar seluruh Technical Backlog menjadi satu dokumen utuh.*

## 33. TB-27 — Authentication Architecture

**Tujuan:** Membangun authentication menggunakan Supabase Auth. Authentication tidak boleh dibuat secara custom.

**Authentication Provider:** Supabase Auth

**Support MVP:** Register, Login, Logout, Session persistence, Forgot password, Reset password

**Authentication Flow**
```
Register
   ↓
Supabase Auth
   ↓
User dibuat di auth.users
   ↓
Profile dibuat
   ↓
Login
   ↓
Session
   ↓
Ambil profile
   ↓
Cek role
   ↓
Admin / Sales
```

**Rules:** Jangan membuat custom JWT, custom password hashing, password table, custom authentication backend.

## 34. TB-28 — Auth Service

**File:** `services/authService.ts`

**Functions (minimal):** `register()`, `login()`, `logout()`, `getCurrentSession()`, `getCurrentUser()`, `sendPasswordReset()`, `updatePassword()`

**Register**
- Input: name, email, password, confirmPassword
- Validation: email valid, password tidak kosong, confirm password sama
- Setelah Supabase Auth berhasil: `auth.users → profiles`

**Acceptance Criteria**
- User dapat register.
- Duplicate email ditolak.
- Password tidak disimpan manual.
- Session terbentuk setelah login jika flow Supabase mengizinkan.
- Error ditangani.

## 35. TB-29 — Auth Session Provider

**Tujuan:** Membuat satu sumber state untuk authentication.

**Requirement:** App harus dapat mengetahui `isLoading`, `session`, `user`, `profile`, `role`.

```
AuthProvider → Supabase session → Current user → Profile → Role
```

**Behavior**
```
App start
   ↓
Checking session
   ↓
Loading
   ↓
No session → Login
   ↓
Has session → Load profile
   ↓
Admin → Admin area
Sales → Sales area
```

**Acceptance Criteria**
- Session tidak hilang hanya karena app dibuka ulang.
- Loading state ditampilkan ketika session sedang diperiksa.
- User diarahkan berdasarkan session dan role.

## 36. TB-30 — Register Screen

**Route:** `(auth)/register`

**UI:** Nama, Email, Password, Konfirmasi Password. Button: Daftar. Link: "Sudah punya akun? Login"

**Validation**
- Nama: Required.
- Email: Required dan valid.
- Password: Required (minimal rule sesuai konfigurasi Supabase).
- Confirm Password: Harus sama dengan password.

**Flow**
```
Submit → Validate → Supabase Auth signUp → Create/ensure profile → Success
```

**Acceptance Criteria**
- Semua field tampil.
- Validation bekerja.
- User dapat membuat account.
- Duplicate email ditangani.
- Loading state tersedia.
- Success/error feedback tersedia.

## 37. TB-31 — Login Screen

**Route:** `(auth)/login`

**UI:** Email, Password, Login, Forgot Password, Register

**Flow**
```
Input → Validate → Supabase signInWithPassword → Session → Load profile
→ Check role → Admin / Sales
```

**Acceptance Criteria**
- Email/password dapat digunakan.
- Credential salah menghasilkan error.
- Session berhasil dibuat.
- User diarahkan ke dashboard sesuai role.
- Loading state tersedia.

## 38. TB-32 — Logout

**Flow**
```
Profile/Menu → Logout → Supabase signOut() → Session cleared → Login
```

**Acceptance Criteria**
- Session dihapus.
- User tidak dapat kembali ke protected screen tanpa login.
- User diarahkan ke Login.

## 39. TB-33 — Forgot Password

**Route:** `(auth)/forgot-password`

**UI:** Email, "Kirim Link Reset Password"

**Flow**
```
Email → Supabase resetPasswordForEmail → Email reset → User membuka link → Reset Password
```

**Acceptance Criteria**
- Email dapat dimasukkan.
- Request reset dikirim menggunakan Supabase.
- User mendapatkan feedback.
- Tidak membocorkan informasi sensitif tentang keberadaan account secara tidak perlu.

## 40. TB-34 — Reset Password

**Route:** `(auth)/reset-password`

**UI:** Password Baru, Konfirmasi Password, Simpan Password

**Validation:** Password required, Confirm password required, Password harus sama

**Acceptance Criteria**
- User dapat mengganti password.
- Password tidak disimpan di database aplikasi.
- Success feedback tersedia.
- User dapat login menggunakan password baru.

## 41. TB-35 — Profile Service

**File:** `services/profileService.ts`

**Functions (minimal):** `getProfile()`, `createProfile()`, `updateProfile()`, `getCurrentRole()`

**Rules:** Profile selalu berdasarkan authenticated user. Jangan menerima user_id sembarangan dari UI untuk menentukan profile aktif. Gunakan identity dari session/authentication.

**Acceptance Criteria**
- Current user dapat mengambil profile.
- Role dapat diketahui.
- Profile tidak dapat diakses user lain tanpa authorization.

## 42. TB-36 — Profile Creation

**Tujuan:** Memastikan user yang register memiliki profile.

**Data:** profiles: id, name, role, created_at, updated_at

**Role Default:** Untuk security, jangan membiarkan user bebas memilih `admin` ketika register. Untuk MVP: role ditentukan oleh admin, dibuat default `sales` bila semua self-register adalah sales, atau ditentukan melalui provisioning flow. Jangan menerima role admin langsung dari input public register.

**Acceptance Criteria**
- User tidak dapat menjadikan dirinya admin hanya dengan mengubah request.
- Role ditentukan secara aman.
- Admin account dapat diprovision secara terkontrol.

## 43. TB-37 — Role Guard

**Tujuan:** Melindungi screen berdasarkan role.

**Helper (konsep):** `requireAuth()`, `requireAdmin()`, `requireSales()`

- **Admin Route:** `/admin/*` — hanya `role = admin`
- **Sales Route:** `/sales/*` — hanya `role = sales`

**Important:** Route guard hanya lapisan UX. Security sebenarnya tetap berasal dari Supabase RLS.

**Acceptance Criteria**
- Sales tidak dapat membuka admin screen.
- Admin dapat membuka admin screen.
- Unauthorized route diarahkan kembali ke area yang sesuai.

## 44. TB-38 — Customer Service

**File:** `services/customerService.ts`

**Functions (minimal):** `getCustomers()`, `getCustomerById()`, `createCustomer()`, `updateCustomer()`, `deleteCustomer()`, `searchCustomers()`

`getCustomers` support: pagination, search, sorting jika dibutuhkan. Untuk MVP, pagination dapat ditambahkan setelah fungsi dasar stabil.

## 45. TB-39 — Customer List Screen

**Route:** `admin/customers`

**UI:** Header "Customers" + tombol tambah. List: Nama Customer, Pemilik, Nomor Telepon. Action: Tap → Customer Detail.

**Empty State:** "Belum ada customer. Tambahkan customer untuk memulai."

**Acceptance Criteria**
- Admin dapat melihat customer.
- Customer tampil dalam list.
- Customer dapat dibuka.
- Empty state tersedia.
- Loading state tersedia.
- Error state tersedia.

## 46. TB-40 — Add Customer

**Route:** `admin/customers/create`

**Fields:** Nama Customer*, Nama Pemilik, Nomor Telepon, Alamat

**Validation:** Nama Customer required; Phone valid format jika diisi; Address & Owner optional.

**Flow**
```
Form → Validation → customerService.createCustomer() → Supabase INSERT → Success → Customer List
```

**Acceptance Criteria**
- Admin dapat membuat customer.
- Field wajib divalidasi.
- Data masuk database.
- Success feedback tampil.
- Error ditangani.

## 47. TB-41 — Customer Detail

**Route:** `admin/customers/[id]`

**Display:** Nama Customer, Nama Pemilik, Nomor Telepon, Alamat

**Related Invoice:** tampilkan invoice terkait jika tersedia (Invoice Number, Amount, Due Date, Status).

**Acceptance Criteria**
- Detail customer tampil.
- Related invoice dapat ditampilkan.
- ID customer yang tidak valid ditangani.
- User tidak mendapatkan data customer yang tidak diizinkan.

## 48. TB-42 — Edit Customer

**Route:** `admin/customers/edit` atau `admin/customers/[id]/edit`

**Flow**
```
Load customer → Display current data → Edit → Validate → Update → Success → Detail
```

**Acceptance Criteria**
- Admin dapat mengubah customer.
- Data terbaru tersimpan.
- UI menampilkan data terbaru.
- Error ditangani.

## 49. TB-43 — Delete Customer

**Tujuan:** Menghapus customer yang memang tidak digunakan.

**Important:** Customer yang sudah memiliki invoice sebaiknya tidak dapat dihapus secara sembarangan jika foreign key akan menyebabkan data rusak. Pilihan: restrict delete atau archive/soft delete bila kebutuhan produk berkembang. Untuk MVP, jangan menghapus customer yang masih direferensikan invoice.

**Flow**
```
Delete → Confirmation → Check related invoice → Delete jika aman → Success
```

**Acceptance Criteria**
- Hanya Admin.
- Ada confirmation.
- Customer yang masih digunakan invoice tidak menyebabkan orphan data.
- Error ditampilkan dengan jelas.

## 50. TB-44 — Sales Service

**File:** `services/salesService.ts`

**Functions (minimal):** `getSales()`, `getSalesById()`, `createSales()`, `updateSales()`, `setSalesActive()`, `getSalesInvoices()`

**Acceptance Criteria:** Service dapat digunakan oleh Admin untuk mengelola data sales.

## 51. TB-45 — Sales List Screen

**Route:** `admin/sales`

**UI:** List — Nama Sales, Nomor Telepon, Status (Aktif/Tidak Aktif). Action: Tap → Sales Detail.

**Acceptance Criteria**
- Admin dapat melihat sales.
- Status aktif terlihat.
- Sales dapat dibuka ke detail.
- Loading/error/empty state tersedia.

## 52. TB-46 — Add Sales

**Route:** `admin/sales/create`

**Fields:** Nama Sales*, Nomor Telepon

Jika sales account dibuat pada flow yang sama, gunakan flow provisioning/authentication yang aman.

**Important:** Jangan membuat `sales.password`. Password tetap milik Supabase Auth.

**Acceptance Criteria**
- Admin dapat menambahkan sales.
- Sales dapat tersedia untuk assignment invoice.
- Account relationship dapat dibuat jika diperlukan.
- Tidak ada password disimpan di table sales.

## 53. TB-47 — Sales Detail

**Route:** `admin/sales/[id]`

**Display:** Nama Sales, Phone, Status

**Assigned Invoice Summary:** Total Invoice, Belum Ditagih, Sudah Ditagih, Dibayar

**Invoice List:** Invoice Number, Customer, Amount, Status, Due Date

**Acceptance Criteria**
- Admin dapat melihat detail sales.
- Invoice yang ditugaskan tampil.
- Status invoice dapat dilihat.

## 54. TB-48 — Sales Active/Inactive

**Tujuan:** Admin dapat menonaktifkan sales tanpa harus menghapus historical data.

**Field:** `is_active`

**Behavior:** Sales inactive: tidak boleh dipilih untuk assignment invoice baru; historical invoice tetap ada; data invoice lama tidak hilang.

**Acceptance Criteria**
- Admin dapat mengubah active status.
- Sales inactive tidak muncul sebagai pilihan assignment baru.
- Historical invoice tetap aman.

## 55. TB-49 — Invoice Service

**File:** `services/invoiceService.ts`

**Functions (minimal):** `getInvoices()`, `getInvoiceById()`, `createInvoice()`, `updateInvoice()`, `deleteInvoice()`, `assignInvoice()`, `updateInvoiceStatus()`, `getMyInvoices()`, `getInvoiceHistory()`

**Rules:** Service harus mengikuti authorization database. Jangan menganggap `sales_id` dari frontend = user ownership sebagai bukti authorization. Database RLS tetap menjadi protection layer.

## 56. TB-50 — Invoice List Admin

**Route:** `admin/invoices`

**Display:** Invoice Number, Customer, Sales, Amount, Due Date, Status

**Status Badge:** Belum Ditagih, Sudah Ditagih, Dibayar

**Actions:** Tap → Invoice Detail, Add Invoice, Search, Filter

**Acceptance Criteria**
- Admin dapat melihat seluruh invoice sesuai RLS.
- Informasi utama tampil.
- Status jelas.
- Loading state.
- Empty state.
- Error state.

## 57. TB-51 — Invoice Search

**Tujuan:** Mencari invoice secara cepat.

**Search Field:** `invoice_number`, `customer.name`

**Acceptance Criteria**
- Search bekerja.
- Hasil berubah sesuai query.
- Empty search result memiliki empty state.
- Search tidak mengubah authorization.

## 58. TB-52 — Invoice Filter

**Filter Status:** Semua, Belum Ditagih, Sudah Ditagih, Dibayar

**Optional Filter** (setelah MVP): Sales, Due Date, Period, Customer

**Acceptance Criteria**
- Filter status bekerja.
- Filter dapat dikombinasikan dengan search jika arsitektur memungkinkan.
- Data tetap mengikuti RLS.

## 59. TB-53 — Add Invoice

**Route:** `admin/invoices/create`

**Fields:** Invoice Number*, Customer*, Amount*, Invoice Date*, Due Date*, Sales, Notes

**Validation**
- Invoice Number: Required dan unique.
- Customer: Required.
- Amount: Required, harus >= 0.
- Invoice Date: Required.
- Due Date: Required; minimal `due_date >= invoice_date` jika aturan bisnis menggunakan constraint tersebut.
- Sales: Dapat nullable jika invoice belum ditugaskan.
- Notes: Optional.

**Default Status:** `belum_ditagih`

**Flow**
```
Form → Validation → Create invoice → Status = belum_ditagih → Success → Invoice Detail/List
```

**Acceptance Criteria**
- Admin dapat membuat invoice.
- Invoice number unique.
- Customer valid.
- Amount valid.
- Status default benar.
- Sales dapat dipilih.
- Data tersimpan.
- Success feedback tersedia.

## 60. TB-54 — Invoice Detail

**Route:** `admin/invoices/[id]`

**Display:** Invoice Number, Customer, Sales, Amount, Invoice Date, Due Date, Status, Notes, Created At, Updated At

**Actions Admin:** Edit, Delete, Assign/Reassign Sales

**Actions Sales:** Update Collection Status, View Customer, View History

Action harus muncul berdasarkan role.

**Acceptance Criteria**
- Detail invoice tampil.
- Role menentukan action.
- Data tidak bocor antar sales.
- Invoice invalid/404 ditangani.

## 61. TB-55 — Edit Invoice

**Route:** `admin/invoices/[id]/edit`

**Editable Fields:** Invoice Number, Customer, Amount, Invoice Date, Due Date, Sales, Notes

Status collection sebaiknya diubah melalui flow status khusus, bukan form edit biasa, agar history lebih terkontrol.

**Acceptance Criteria**
- Admin dapat edit invoice.
- Validation tetap berjalan.
- Invoice number tetap unique.
- Data tersimpan.
- Sales melihat data terbaru.

## 62. TB-56 — Delete Invoice

**Role:** Admin only

**Flow**
```
Delete → Confirmation Dialog → Delete → Success → Return to list
```

**History Consideration:** Jika invoice memiliki history, pilih kebijakan database yang konsisten (`ON DELETE CASCADE` untuk history yang hanya bergantung pada invoice, atau kebijakan lain yang diputuskan pada schema). Jangan sampai history menjadi orphan record.

**Acceptance Criteria**
- Sales tidak dapat delete.
- Admin harus confirmation.
- Invoice tidak muncul lagi setelah berhasil dihapus.
- Related history ditangani dengan benar.

## 63. TB-57 — Invoice Assignment

**Tujuan:** Menghubungkan invoice dengan sales.

**Field:** `invoices.sales_id`

**Flow**
```
Admin membuka invoice → Assign Sales → Pilih Sales Aktif → Save → sales_id tersimpan
```

**Reassignment:** Admin dapat memindahkan dari Sales A → Sales B.

**Rules:** Hanya sales aktif yang dapat menerima assignment baru.

**Acceptance Criteria**
- Admin dapat assign invoice.
- Sales aktif muncul.
- Sales inactive tidak dapat dipilih untuk assignment baru.
- sales_id tersimpan.
- Sales terkait dapat melihat invoice.
- Sales lain tidak dapat melihat invoice.

## 64. TB-58 — Invoice Assignment UI

**Component:** `SalesSelector` (reusable)

**Display:** "Pilih Sales" — Nama Sales, Status Aktif

**States:** Loading, Loaded, Empty, Error

**Empty State:** "Belum ada sales aktif. Tambahkan sales terlebih dahulu."

**Acceptance Criteria**
- Selector dapat mengambil sales aktif.
- Tidak menampilkan sales inactive untuk assignment baru.
- Loading/error/empty tersedia.

## 65. TB-59 — My Invoice Screen

**Role:** Sales only

**Route:** `sales/invoices`

**Display:** Invoice Number, Customer, Amount, Due Date, Status

**Query:** Hanya invoice yang `invoice.sales_id = current sales.id`

**Important:** Filter ownership tidak boleh hanya dilakukan di frontend. RLS harus memastikan query tidak bisa mengambil invoice sales lain.

**Acceptance Criteria**
- Sales hanya melihat invoice miliknya.
- Sales tidak dapat mengakses invoice sales lain melalui ID langsung.
- List memiliki loading/empty/error state.

## 66. TB-60 — Sales Invoice Detail

**Route:** `sales/invoices/[id]`

**Display:** Invoice Number, Customer, Customer Phone, Customer Address, Amount, Invoice Date, Due Date, Status, Notes

**Actions:** Update Status, View History

**Security:** Jika invoice bukan milik sales → 404/unauthorized. Jangan menampilkan detail invoice tersebut.

## 67. TB-61 — Collection Status Update Foundation

**Status Flow**
```
Belum Ditagih → Sudah Ditagih → Dibayar
```
Database value: `belum_ditagih`, `sudah_ditagih`, `dibayar`

**Rules:** MVP menggunakan flow linear. Jangan membuat status random seperti `belum_ditagih → dibayar` tanpa keputusan bisnis yang jelas.

**Acceptance Criteria**
- Status dapat berubah sesuai flow.
- Status invalid ditolak.
- Hanya authorized sales/admin sesuai aturan yang dapat mengubah.

## 68. TB-62 — Collection Status Update UI

**UI:** Gunakan action seperti "Update Status" atau button sesuai status berikutnya.

**Confirmation:** Untuk perubahan penting dapat menggunakan confirmation, mis. "Tandai invoice sebagai Dibayar?"

**Acceptance Criteria**
- Button mengikuti status saat ini.
- Status berikutnya jelas.
- Tidak ada action status yang tidak valid.
- Loading mencegah duplicate update.

## 69. TB-63 — Status Update Service

**Function:** `updateInvoiceStatus(invoiceId, newStatus)`

**Process**
```
Get current invoice → Check authorization → Validate status transition
→ Update invoice → Create history → Return result
```

**Important:** Untuk menjaga konsistensi antara `invoices.status` dan `invoice_status_history`, idealnya perubahan status dilakukan melalui transaction/database function/RPC yang atomic bila implementasi Supabase memungkinkan.

**Acceptance Criteria:** Jika update gagal, `invoice.status` dan `history` tidak boleh berada pada kondisi setengah berhasil.

## 70. TB-64 — Invoice Status History

**Service:** `getInvoiceHistory(invoiceId)`

**Data (minimal):** old_status, new_status, changed_by, changed_at

**Acceptance Criteria**
- History tampil sesuai invoice.
- Actor/perubahan dapat diketahui.
- Timestamp tersedia.
- Sales hanya dapat melihat history invoice miliknya.
- Admin dapat melihat history invoice sesuai permission.

## 71. TB-65 — Customer Relation on Invoice

**Tujuan:** Invoice harus dapat menampilkan informasi customer dengan aman.

**Query:** Invoice `customer_id` relasi ke `customers`

**Display (minimal):** Customer Name, Phone, Address

**Acceptance Criteria**
- Customer terkait invoice dapat ditampilkan.
- Jika customer sudah tidak tersedia, aplikasi menangani kondisi tersebut.
- Sales hanya dapat mengakses customer yang berkaitan dengan invoice yang memang boleh diaksesnya.

## 72. TB-66 — Invoice Date & Due Date Handling

**Tujuan:** Menstandarkan tanggal invoice.

**Format Database:** `date` untuk `invoice_date`, `due_date`

**Frontend:** Format tanggal untuk user, mis. "25 Sep 2026" atau format Indonesia yang konsisten.

**Important:** Jangan mencampur timezone secara tidak perlu untuk field yang hanya merepresentasikan tanggal bisnis.

**Acceptance Criteria**
- Date tersimpan konsisten.
- Display konsisten.
- Tidak terjadi perubahan tanggal karena timezone.

## 73. TB-67 — Currency Formatting

**Tujuan:** Menampilkan amount dengan format Rupiah.

Contoh: Database `1500000` → UI `Rp1.500.000`

**Utility:** `utils/currency.ts` — function `formatCurrency()`

**Rules:** Database tetap menyimpan angka numeric. Jangan menyimpan `"Rp1.500.000"` sebagai amount database.

**Acceptance Criteria**
- Amount database berupa numeric.
- UI menggunakan format Rupiah.
- Tidak terjadi kesalahan perhitungan karena string currency.

## 74. TB-68 — Invoice Status Badge

**Component:** `components/Badge.tsx`

**Mapping:** `belum_ditagih` → "Belum Ditagih", `sudah_ditagih` → "Sudah Ditagih", `dibayar` → "Dibayar"

**Color:** Warning → Belum Ditagih; Primary/Info → Sudah Ditagih; Success → Dibayar. Jangan hardcode style status di banyak screen.

**Acceptance Criteria**
- Semua screen menggunakan status badge yang sama.
- Label status konsisten.
- Status database tidak langsung ditampilkan sebagai snake_case kepada user.

## 75. TB-69 — Role-Based UI

**Admin:** Dashboard, Customers, Sales, Invoices, Reports, Profile, Logout

**Sales:** Dashboard, My Invoices, Profile, Logout

**Important:** Menyembunyikan menu bukan security. Security tetap: RLS + Route Guard.

**Acceptance Criteria**
- Navigation sesuai role.
- Tidak ada menu yang tidak relevan.
- Direct route access tetap dilindungi.

## 76. TB-70 — Authentication & Core Feature Integration Test

**Test Account:** Admin Account, Sales A Account, Sales B Account

**Scenario 1 — Admin**
```
Login Admin → Dashboard → Create Customer → Create Sales → Create Invoice
→ Assign Invoice to Sales A
```
Expected: Success

**Scenario 2 — Sales A**
```
Login Sales A → My Invoice
```
Expected: Melihat invoice Sales A

**Scenario 3 — Sales B**
```
Login Sales B → My Invoice
```
Expected: Tidak melihat invoice Sales A

**Scenario 4 — Sales A**
```
Open invoice Sales A → Update: Belum Ditagih → Sudah Ditagih
```
Expected: Success

**Scenario 5 — Admin**
```
Open invoice
```
Expected: Status = Sudah Ditagih

**Scenario 6 — Sales B**
```
Coba mengakses ID invoice Sales A secara langsung
```
Expected: Unauthorized / Not Found

## 77. TB-71 — Core Feature Definition of Done

Authentication + Customer + Sales + Invoice dianggap selesai jika:

**Authentication**
- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Forgot password
- [ ] Reset password
- [ ] Session persistence
- [ ] Role detection

**Role**
- [ ] Admin route guard
- [ ] Sales route guard
- [ ] RLS
- [ ] Sales ownership

**Customer**
- [ ] Customer list
- [ ] Add customer
- [ ] Customer detail
- [ ] Edit customer
- [ ] Delete/restrict delete
- [ ] Validation
- [ ] Loading
- [ ] Empty state
- [ ] Error state

**Sales**
- [ ] Sales list
- [ ] Add sales
- [ ] Sales detail
- [ ] Active/inactive
- [ ] Assignment-ready

**Invoice**
- [ ] Invoice list
- [ ] Search
- [ ] Filter
- [ ] Add invoice
- [ ] Detail
- [ ] Edit
- [ ] Delete
- [ ] Assign sales
- [ ] My invoice
- [ ] Status update
- [ ] Status history

**Quality**
- [ ] TypeScript clean
- [ ] No major runtime errors
- [ ] No secrets in source code
- [ ] RLS tested
- [ ] Admin tested
- [ ] Sales A tested
- [ ] Sales B tested

## 78. Development Order — Part 2

```
TB-27 Authentication Architecture
   ↓
TB-28 Auth Service
   ↓
TB-29 Auth Session Provider
   ↓
TB-30 Register
   ↓
TB-31 Login
   ↓
TB-32 Logout
   ↓
TB-33 Forgot Password
   ↓
TB-34 Reset Password
   ↓
TB-35 Profile Service
   ↓
TB-36 Profile Creation
   ↓
TB-37 Role Guard
   ↓
TB-38 Customer Service
   ↓
TB-39 Customer List
   ↓
TB-40 Add Customer
   ↓
TB-41 Customer Detail
   ↓
TB-42 Edit Customer
   ↓
TB-43 Delete Customer
   ↓
TB-44 Sales Service
   ↓
TB-45 Sales List
   ↓
TB-46 Add Sales
   ↓
TB-47 Sales Detail
   ↓
TB-48 Sales Active/Inactive
   ↓
TB-49 Invoice Service
   ↓
TB-50 Invoice List
   ↓
TB-51 Invoice Search
   ↓
TB-52 Invoice Filter
   ↓
TB-53 Add Invoice
   ↓
TB-54 Invoice Detail
   ↓
TB-55 Edit Invoice
   ↓
TB-56 Delete Invoice
   ↓
TB-57 Invoice Assignment
   ↓
TB-58 Assignment UI
   ↓
TB-59 My Invoice
   ↓
TB-60 Sales Invoice Detail
   ↓
TB-61 Status Update Foundation
   ↓
TB-62 Status Update UI
   ↓
TB-63 Status Update Service
   ↓
TB-64 Status History
   ↓
TB-65 Customer Relation
   ↓
TB-66 Date Handling
   ↓
TB-67 Currency Formatting
   ↓
TB-68 Status Badge
   ↓
TB-69 Role-Based UI
   ↓
TB-70 Integration Test
   ↓
TB-71 Definition of Done
```

## 79. Prompt OpenCode — Start Part 2

```
Baca PRODUCT_BACKLOG.md dan TECHNICAL_BACKLOG.md.

Foundation project dan database sudah dikerjakan sesuai backlog.

Sekarang kerjakan TB-27 — Authentication Architecture saja.

Jangan mengerjakan TB-28 atau task setelahnya.

Gunakan Supabase Auth sebagai authentication.

Jangan membuat custom JWT, custom password storage, atau authentication backend.

Setelah selesai:
1. tampilkan file yang dibuat/diubah;
2. jelaskan arsitektur authentication;
3. jelaskan dependency yang ditambahkan jika ada;
4. jalankan TypeScript check;
5. periksa kemungkinan runtime error;
6. jelaskan cara testing TB-27.

Jangan mengerjakan task lain di luar TB-27.
```

## 80. Prompt Setelah Setiap TB

```
TB sebelumnya sudah selesai.

Baca kembali PRODUCT_BACKLOG.md dan TECHNICAL_BACKLOG.md.

Sekarang kerjakan TB-[NOMOR] — [NAMA TASK] saja.

Jangan mengerjakan task berikutnya.

Pertahankan fitur yang sudah selesai.

Pastikan:
- TypeScript tidak error;
- tidak ada credential/secret yang hardcoded;
- loading state ditangani;
- error state ditangani;
- success feedback tersedia jika relevan;
- authorization sesuai role;
- RLS tidak dilewati;
- UI mengikuti design system.

Setelah selesai, berikan:
1. daftar file dibuat;
2. daftar file diubah;
3. penjelasan implementasi;
4. dependency yang ditambahkan;
5. hasil TypeScript check;
6. cara testing;
7. masalah yang masih ditemukan.
```

## 81. Important Security Rules

**Rule 1** — Jangan percaya data role dari frontend.
Salah: `const role = route.params.role;` sebagai dasar authorization.
Benar: `authenticated user → profile → database authorization`

**Rule 2** — Jangan percaya `sales_id` dari frontend. Sales tidak boleh menentukan sendiri `sales_id = sales lain` untuk mendapatkan akses. RLS harus memvalidasi ownership.

**Rule 3** — Jangan simpan password. Tidak boleh: `users.password`, `sales.password`, `profiles.password`

**Rule 4** — Jangan gunakan service-role key di mobile.

**Rule 5** — Frontend authorization bukan security utama. Gunakan Supabase RLS.

**Rule 6** — Semua perubahan status harus dapat ditelusuri. Gunakan `invoice_status_history`.

**Rule 7** — Jangan menghapus historical data secara sembarangan. Contoh: Sales inactive tidak berarti `DELETE sales` karena invoice historical masih membutuhkan referensi.

## 82. Expected Architecture Setelah Part 2

```
SalesCollect
│
├── app/
│   ├── (auth)/
│   │   ├── login
│   │   ├── register
│   │   ├── forgot-password
│   │   └── reset-password
│   │
│   └── (app)/
│       ├── admin/
│       │   ├── dashboard
│       │   ├── customers
│       │   ├── sales
│       │   └── invoices
│       │
│       └── sales/
│           ├── dashboard
│           └── invoices
│
├── components/
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Badge
│   ├── Loading
│   ├── EmptyState
│   └── ErrorState
│
├── services/
│   ├── authService
│   ├── profileService
│   ├── customerService
│   ├── salesService
│   └── invoiceService
│
├── hooks/
│   └── authentication/session hooks
│
├── lib/
│   └── supabase
│
├── types/
│   ├── auth
│   ├── database
│   ├── customer
│   ├── sales
│   └── invoice
│
└── utils/
    └── formatting/helpers
```

**Database**
```
auth.users
     │
     ▼
profiles
     │
     ▼
sales
     │
     ▼
invoices ◄──── customers
     │
     ▼
invoice_status_history
```

## 83. Milestone Part 2

Part 2 dinyatakan selesai jika aplikasi sudah memiliki alur:

```
REGISTER → LOGIN → ROLE DETECTION → ADMIN / SALES
```

**Admin**
```
Admin Login
   ↓
Customer (Create, View, Edit, Manage)
   ↓
Sales (Create, View, Active/Inactive)
   ↓
Invoice (Create, View, Edit, Delete, Assign Sales)
```

**Sales**
```
Sales Login → My Invoice → Invoice Detail → Update Status → Status History
```

**Security**
```
Sales A → Own Invoice ✓ Allowed
Sales A → Sales B Invoice ✗ Blocked by RLS
```

---

# PART 3 — Dashboard, Monitoring, Reporting, QA & Deployment

*Melanjutkan TB-71 dari Part 2.*

**Scope Part 3**
```
Dashboard → Monitoring → Reporting → UX Hardening → Security Testing
→ Integration Testing → Performance → Production Configuration → Final QA → Deployment
```

## 84. TB-72 — Admin Dashboard

**Tujuan:** Menyediakan ringkasan kondisi invoice sehingga Admin dapat mengetahui kondisi collection tanpa membuka satu per satu invoice.

**Route:** `app/(app)/admin/dashboard.tsx`

**Dashboard Cards (minimal):** Total Invoice, Belum Ditagih, Sudah Ditagih, Dibayar, Total Nominal

Contoh:
```
┌──────────────────────────┐
│ Total Invoice            │
│ 125                      │
└──────────────────────────┘
┌──────────────────────────┐
│ Belum Ditagih            │
│ 45                       │
└──────────────────────────┘
┌──────────────────────────┐
│ Sudah Ditagih            │
│ 50                       │
└──────────────────────────┘
┌──────────────────────────┐
│ Dibayar                  │
│ 30                       │
└──────────────────────────┘
┌──────────────────────────┐
│ Total Nominal            │
│ Rp250.000.000            │
└──────────────────────────┘
```

**Acceptance Criteria**
- Dashboard hanya dapat diakses Admin.
- Angka berasal dari database.
- Angka tidak hardcoded.
- Loading state tersedia.
- Error state tersedia.
- Data dapat diperbarui setelah perubahan invoice.

## 85. TB-73 — Dashboard Query Service

**File:** `services/dashboardService.ts`

**Functions (minimal):** `getAdminDashboardSummary()`, `getSalesDashboardSummary()`

**Admin Summary — return shape:**
```ts
{
  totalInvoices: number;
  belumDitagih: number;
  sudahDitagih: number;
  dibayar: number;
  totalAmount: number;
}
```

**Rules:** Gunakan aggregate/query yang efisien. Jangan download semua invoice lalu hitung semuanya di device jika data sudah cukup besar. Lebih baik database melakukan aggregation.

**Acceptance Criteria**
- Query menghasilkan angka yang benar.
- Query mengikuti RLS.
- Tidak mengambil data lebih banyak dari kebutuhan.

## 86. TB-74 — Sales Dashboard

**Tujuan:** Memberikan Sales ringkasan invoice miliknya.

**Route:** `app/(app)/sales/dashboard.tsx`

**Cards:** Total Invoice Saya, Belum Ditagih, Sudah Ditagih, Dibayar

**Important:** Semua angka hanya berasal dari invoice Sales yang sedang login.
```
Current User → Sales → Own invoices → Aggregate
```

**Acceptance Criteria**
- Sales hanya melihat data miliknya.
- Dashboard Sales tidak menampilkan data Sales lain.
- RLS tetap membatasi data.
- Angka sesuai My Invoice.

## 87. TB-75 — Dashboard Card Component

**Component:** `components/DashboardCard.tsx`

**Props (minimal):** title, value, description?, icon?, variant?, loading?

**Variants:** default, success, warning, info

**Rules:** Dashboard Admin dan Sales harus menggunakan component yang sama bila layout dan behavior sama.

**Acceptance Criteria**
- Tidak ada duplikasi card UI.
- Component reusable.
- Responsive terhadap ukuran device.

## 88. TB-76 — Dashboard Loading & Error

**Loading:** Saat data sedang diambil — Dashboard → Loading → Data. Jangan menampilkan "Total Invoice: 0" seolah-olah benar jika sebenarnya data masih loading.

**Error:** Jika gagal — "Data dashboard gagal dimuat. [Coba Lagi]"

**Acceptance Criteria**
- Loading dibedakan dari empty/zero data.
- Error memiliki retry.
- Retry tidak membuat duplicate request.

## 89. TB-77 — Collection Monitoring

**Tujuan:** Admin dapat memonitor kondisi collection secara lebih detail.

**Route:** dapat menggunakan `admin/invoices` atau screen monitoring terpisah jika dibutuhkan.

**Information (minimal):** Invoice, Customer, Sales, Amount, Due Date, Status

**Monitoring Use Case:** Admin dapat mengetahui invoice mana belum ditagih, mana sudah ditagih, mana sudah dibayar, dan sales mana menangani invoice tertentu.

**Important:** Monitoring berdasarkan fakta data invoice. Jangan membuat scoring atau ranking performa sales dalam MVP.

**Acceptance Criteria**
- Admin dapat memfilter invoice.
- Admin dapat mencari invoice.
- Status terlihat.
- Sales assignment terlihat.
- Data sesuai database.

## 90. TB-78 — Collection Report

**Tujuan:** Membuat laporan collection berdasarkan periode.

**Route:** `admin/reports`

**Filter (minimal):** Tanggal Mulai, Tanggal Akhir

**Summary:** Total Invoice, Total Nominal, Belum Ditagih, Sudah Ditagih, Dibayar

Contoh:
```
Periode: 1 Sep 2026 - 30 Sep 2026
Total Invoice     100
Total Nominal     Rp200.000.000
Belum Ditagih     30
Sudah Ditagih     40
Dibayar           30
```

**Acceptance Criteria**
- Admin dapat memilih periode.
- Report menggunakan periode yang dipilih.
- Summary benar.
- Empty result ditangani.
- Loading/error tersedia.

## 91. TB-79 — Report by Sales

**Tujuan:** Menampilkan distribusi invoice berdasarkan Sales.

Contoh:
```
Sales       Total   Belum   Ditagih   Dibayar
------------------------------------------------
Andi          20      8        7         5
Budi          30      10       12        8
Citra         15      3        7         5
```

**Important:** Report ini merupakan informasi faktual berdasarkan invoice. Jangan menambahkan Top Sales, Best Sales, Worst Sales, Performance Score, Ranking untuk MVP.

**Acceptance Criteria**
- Admin dapat melihat data berdasarkan Sales.
- Jumlah invoice sesuai database.
- Status dapat dihitung.
- Filter periode dapat digunakan.

## 92. TB-80 — Report Period Filter

**Component:** `components/DateRangeFilter.tsx`

**Input:** Start Date, End Date

**Validation:** Start Date <= End Date. Jika invalid: "Tanggal mulai tidak boleh setelah tanggal akhir."

**Acceptance Criteria**
- Date picker berjalan.
- Invalid range ditolak.
- Report berubah sesuai periode.

## 93. TB-81 — Report Query Optimization

**Tujuan:** Memastikan report tidak mengambil data berlebihan.

**Rules:** Jangan fetch seluruh invoice lalu hitung semua di React Native untuk dataset besar. Gunakan SQL aggregation, database views, RPC, atau aggregate query sesuai kebutuhan dan keamanan Supabase.

**Acceptance Criteria**
- Query hanya mengambil data yang diperlukan.
- Tidak ada data sensitif yang dikirim ke device tanpa kebutuhan.
- RLS tetap berlaku.

## 94. TB-82 — Report Empty State

**Kondisi:** Jika periode tidak memiliki invoice — "Belum ada data collection untuk periode yang dipilih."

**CTA (jika relevan):** "Ubah Periode"

**Acceptance Criteria**
- Empty result tidak dianggap error.
- User mengetahui kenapa report kosong.
- User dapat mengubah periode.

## 95. TB-83 — Report Export Preparation

**Scope:** Export bukan prioritas MVP. Namun architecture harus memungkinkan penambahan PDF, Excel, CSV di fase berikutnya.

**Rules:** Jangan memasukkan library export besar jika belum dibutuhkan. Buat service interface jika diperlukan: `services/reportExportService.ts`

**Future**
```
Report → Generate file → Share/download
```

**Acceptance Criteria** — Untuk MVP: report sudah memiliki struktur data yang mudah diexport; tidak perlu implementasi PDF/Excel jika belum masuk MVP.

## 96. TB-84 — Application UX Hardening

**Tujuan:** Merapikan pengalaman penggunaan setelah semua fitur utama selesai.

Periksa seluruh screen: Login, Register, Forgot Password, Dashboard, Customer, Sales, Invoice, Assignment, Collection, Report, Profile.

**Checklist** — Setiap screen harus memiliki:
- loading;
- empty state jika relevan;
- error state;
- success feedback jika relevan;
- keyboard handling;
- button disabled saat submit;
- safe area;
- scrolling yang benar;
- back navigation;
- confirmation untuk destructive action.

## 97. TB-85 — Global Error Handling

**Tujuan:** Menangani error yang tidak tertangani.

**Cases:** Network error, Database error, Auth error, Session expired, Unexpected error

**Behavior (session expired)**
```
Session expired → Clear local session → Login
```

**Unexpected Error:** "Terjadi kesalahan. Silakan coba lagi." Jangan tampilkan stack trace kepada user.

## 98. TB-86 — Network Handling

**Tujuan:** Menangani kondisi koneksi internet buruk.

**Cases:** Offline, Slow connection, Request timeout, Request failed

**UI:** Jika request gagal karena network — "Koneksi bermasalah. Periksa internet Anda. [Coba Lagi]"

**Important:** MVP tidak wajib memiliki offline database. Offline mode adalah fitur future.

## 99. TB-87 — Confirmation Dialog

**Tujuan:** Mencegah tindakan destructive yang tidak sengaja.

Minimal digunakan pada: Delete Invoice, Delete Customer, Logout jika diperlukan.

Contoh: "Hapus Invoice? Invoice INV-001 akan dihapus. [Batal] [Hapus]"

**Acceptance Criteria**
- Delete tidak langsung dilakukan tanpa confirmation.
- Tombol destructive jelas.
- Setelah cancel tidak ada perubahan.

## 100. TB-88 — Form Validation Hardening

Periksa seluruh form:
- **Register:** Name, Email, Password, Confirm Password
- **Customer:** Name, Owner, Phone, Address
- **Sales:** Name, Phone
- **Invoice:** Invoice Number, Customer, Amount, Invoice Date, Due Date, Sales, Notes

**Rules:** Validation harus jelas, dekat dengan field, konsisten, tidak hanya mengandalkan frontend. Database tetap memiliki constraint untuk data penting.

## 101. TB-89 — Permission Testing

**Test Matrix**

| Action | Admin | Sales |
|---|---|---|
| Login | ✓ | ✓ |
| View Dashboard | ✓ | ✓ |
| View All Invoice | ✓ | ✗ |
| View Own Invoice | ✓ | ✓ |
| Create Invoice | ✓ | ✗ |
| Edit Invoice | ✓ | ✗ |
| Delete Invoice | ✓ | ✗ |
| Assign Invoice | ✓ | ✗ |
| Update Own Status | ✓* | ✓ |
| Manage Customer | ✓ | ✗ |
| Manage Sales | ✓ | ✗ |
| View Report | ✓ | ✗ |

\* Admin dapat diberikan kemampuan sesuai policy aplikasi, terutama untuk monitoring/administration.

**Acceptance Criteria:** Tidak ada privilege escalation melalui UI maupun direct database request.

## 102. TB-90 — RLS Security Testing

- **Test 1 — Sales A** — Request invoice Sales A → Expected: ALLOWED
- **Test 2 — Sales A** — Request invoice Sales B → Expected: DENIED
- **Test 3 — Sales A** — Attempt create invoice → Expected: DENIED
- **Test 4 — Sales A** — Attempt delete invoice → Expected: DENIED
- **Test 5 — Sales A** — Attempt update invoice Sales B → Expected: DENIED
- **Test 6 — Admin** — Request invoice → Expected: ALLOWED
- **Test 7 — Unauthenticated** — Request protected table → Expected: DENIED

**Acceptance Criteria:** RLS benar-benar diuji melalui database/API request, bukan hanya melalui UI.

## 103. TB-91 — End-to-End Testing

**Scenario A — Full Admin Flow**
```
Login Admin → Create Customer → Create Sales → Create Invoice
→ Assign Invoice → View Dashboard → View Report
```
Expected: Semua berhasil.

**Scenario B — Full Sales Flow**
```
Login Sales → Dashboard → My Invoice → Open Invoice
→ View Customer → Update Status → View History
```
Expected: Semua berhasil.

**Scenario C — Multi-Sales Isolation**
```
Admin → Create invoice A → Assign Sales A
Admin → Create invoice B → Assign Sales B

Login Sales A: Invoice A → visible, Invoice B → hidden
Login Sales B: Invoice A → hidden, Invoice B → visible
```

## 104. TB-92 — Performance Check

**Target — Periksa:** screen loading; list rendering; database query; dashboard query; report query; image/resource usage jika ada.

**Rules — Hindari:** nested query berlebihan, unnecessary re-render, fetch data berulang, large dataset tanpa pagination.

**Invoice List:** Jika jumlah data mulai besar, gunakan pagination atau infinite scrolling.

**Acceptance Criteria**
- App tetap responsive.
- Tidak ada query yang jelas-jelas mengambil data berlebihan.
- List tidak memuat seluruh database tanpa alasan.

## 105. TB-93 — Production Environment

**Tujuan:** Memisahkan environment development dan production bila diperlukan (minimal: Development, Production).

**Rules:** Production credential tidak boleh ditaruh sembarangan. Pastikan `.env` tidak masuk repository jika berisi secret.

**Acceptance Criteria**
- Environment dapat dibedakan.
- Credential tidak hardcoded.
- Production tidak menggunakan database testing secara tidak sengaja.

## 106. TB-94 — Build Configuration

**Tujuan:** Menyiapkan build aplikasi mobile.

**Periksa:** `app.json` / `app.config.ts` — minimal: name, slug, version, orientation, icon, splash, package/bundle identifier.

**Android:** siapkan Android package identifier.

**iOS:** siapkan iOS bundle identifier (jika deployment iOS diperlukan).

**Acceptance Criteria**
- App memiliki identity yang konsisten.
- Version tersedia.
- Build configuration valid.

## 107. TB-95 — Deployment Preparation

**Tujuan:** Menyiapkan aplikasi untuk build/deployment. Gunakan Expo/EAS jika sesuai kebutuhan project.

**Checklist:** Project build, Environment, App icon, Splash, Version, Android identifier, iOS identifier, Production Supabase

**Important — Sebelum production:** test authentication; test RLS; test database; test critical flows; pastikan production database bukan database development.

## 108. TB-96 — Final QA

**Authentication**
- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Forgot password
- [ ] Reset password
- [ ] Session persistence

**Customer**
- [ ] List
- [ ] Create
- [ ] Detail
- [ ] Edit
- [ ] Delete/restriction

**Sales**
- [ ] List
- [ ] Create
- [ ] Detail
- [ ] Active/inactive

**Invoice**
- [ ] List
- [ ] Search
- [ ] Filter
- [ ] Create
- [ ] Detail
- [ ] Edit
- [ ] Delete
- [ ] Assign

**Collection**
- [ ] My Invoice
- [ ] Update status
- [ ] Status history
- [ ] Ownership

**Dashboard**
- [ ] Admin dashboard
- [ ] Sales dashboard
- [ ] Summary numbers

**Report**
- [ ] Collection report
- [ ] Period filter
- [ ] Report by Sales
- [ ] Empty state

**Security**
- [ ] RLS
- [ ] Role guard
- [ ] Sales isolation
- [ ] No service-role key in mobile
- [ ] No password storage

**UX**
- [ ] Loading
- [ ] Error
- [ ] Empty
- [ ] Success
- [ ] Confirmation
- [ ] Form validation

## 109. TB-97 — Final Definition of Done

SalesCollect MVP dinyatakan selesai apabila seluruh kondisi berikut terpenuhi.

**Product**
- [ ] Authentication berjalan.
- [ ] Admin dapat mengelola customer.
- [ ] Admin dapat mengelola sales.
- [ ] Admin dapat membuat invoice.
- [ ] Admin dapat assign invoice.
- [ ] Sales dapat melihat invoice miliknya.
- [ ] Sales dapat melihat customer terkait.
- [ ] Sales dapat update collection status.
- [ ] Status history tersedia.
- [ ] Admin dashboard tersedia.
- [ ] Sales dashboard tersedia.
- [ ] Collection report tersedia.
- [ ] Report by Sales tersedia.

**Database**
- [ ] Schema final tersedia.
- [ ] Foreign keys benar.
- [ ] Constraints tersedia.
- [ ] Index penting tersedia.
- [ ] Migration terdokumentasi.

**Security**
- [ ] Supabase Auth digunakan.
- [ ] Password tidak disimpan manual.
- [ ] RLS aktif.
- [ ] Role authorization aktif.
- [ ] Sales ownership aman.
- [ ] Sales tidak dapat melihat invoice sales lain.
- [ ] Service-role key tidak berada di mobile app.

**Code Quality**
- [ ] TypeScript tidak memiliki error.
- [ ] Tidak ada critical lint error.
- [ ] Tidak ada major runtime error.
- [ ] Service layer digunakan.
- [ ] Reusable components digunakan.
- [ ] Tidak ada duplicate logic yang tidak perlu.

**UX**
- [ ] Loading state.
- [ ] Empty state.
- [ ] Error state.
- [ ] Success feedback.
- [ ] Confirmation dialog.
- [ ] Form validation.
- [ ] Navigation berjalan.

**Testing**
- [ ] Admin tested.
- [ ] Sales A tested.
- [ ] Sales B tested.
- [ ] Unauthorized access tested.
- [ ] RLS tested.
- [ ] Main end-to-end flow tested.

**Deployment**
- [ ] Production configuration siap.
- [ ] App metadata siap.
- [ ] Build configuration siap.
- [ ] Production Supabase sudah diverifikasi.
- [ ] Final build berhasil.

## 110. FINAL DEVELOPMENT ROADMAP

Setelah Part 1, Part 2, dan Part 3 digabung, urutan development:

```
PHASE 1 — FOUNDATION
├── TB-01 Project Initialization
├── TB-02 Folder Architecture
├── TB-03 Navigation
├── TB-04 Design System
├── TB-05 Environment
├── TB-06 Supabase
├── TB-07 Database Enum
├── TB-08 Profiles
├── TB-09 Sales
├── TB-10 Customers
├── TB-11 Invoices
├── TB-12 Status History
├── TB-13 Relationships
├── TB-14 Index
├── TB-15 Constraints
├── TB-16 RLS Foundation
├── TB-17 Role RLS
├── TB-18 Ownership
├── TB-19 Migration
├── TB-20 Types
├── TB-21 Services
├── TB-22 Error Handling
├── TB-23 Loading
├── TB-24 Empty State
├── TB-25 Success Feedback
└── TB-26 Quality Check
        ↓
PHASE 2 — CORE FEATURES
├── TB-27 Authentication Architecture
├── TB-28 Auth Service
├── TB-29 Session Provider
├── TB-30 Register
├── TB-31 Login
├── TB-32 Logout
├── TB-33 Forgot Password
├── TB-34 Reset Password
├── TB-35 Profile Service
├── TB-36 Profile Creation
├── TB-37 Role Guard
├── TB-38 Customer Service
├── TB-39 Customer List
├── TB-40 Add Customer
├── TB-41 Customer Detail
├── TB-42 Edit Customer
├── TB-43 Delete Customer
├── TB-44 Sales Service
├── TB-45 Sales List
├── TB-46 Add Sales
├── TB-47 Sales Detail
├── TB-48 Sales Active/Inactive
├── TB-49 Invoice Service
├── TB-50 Invoice List
├── TB-51 Search
├── TB-52 Filter
├── TB-53 Add Invoice
├── TB-54 Invoice Detail
├── TB-55 Edit Invoice
├── TB-56 Delete Invoice
├── TB-57 Assignment
├── TB-58 Assignment UI
├── TB-59 My Invoice
├── TB-60 Sales Invoice Detail
├── TB-61 Status Foundation
├── TB-62 Status UI
├── TB-63 Status Service
├── TB-64 Status History
├── TB-65 Customer Relation
├── TB-66 Date Handling
├── TB-67 Currency
├── TB-68 Status Badge
└── TB-69 Role UI
        ↓
PHASE 3 — DASHBOARD & REPORTING
├── TB-72 Admin Dashboard
├── TB-73 Dashboard Service
├── TB-74 Sales Dashboard
├── TB-75 Dashboard Card
├── TB-76 Dashboard States
├── TB-77 Collection Monitoring
├── TB-78 Collection Report
├── TB-79 Report by Sales
├── TB-80 Period Filter
├── TB-81 Report Optimization
└── TB-82 Report Empty State
        ↓
PHASE 4 — POLISH & QUALITY
├── TB-83 Export Preparation
├── TB-84 UX Hardening
├── TB-85 Global Error Handling
├── TB-86 Network Handling
├── TB-87 Confirmation Dialog
└── TB-88 Form Validation
        ↓
PHASE 5 — SECURITY & TESTING
├── TB-89 Permission Testing
├── TB-90 RLS Security Testing
├── TB-91 End-to-End Testing
└── TB-92 Performance Check
        ↓
PHASE 6 — RELEASE
├── TB-93 Production Environment
├── TB-94 Build Configuration
├── TB-95 Deployment Preparation
├── TB-96 Final QA
└── TB-97 Final Definition of Done
```

## 111. MASTER RULE FOR OPENCODE

OpenCode tidak boleh mengerjakan seluruh roadmap sekaligus. Gunakan pola:

```
Baca backlog → Ambil 1 TB → Implementasi → Test → Review → Selesai → TB berikutnya
```

Contoh:
```
Baca PRODUCT_BACKLOG.md dan TECHNICAL_BACKLOG.md.

TB-72 sampai TB-97 belum perlu dikerjakan.

Sekarang kerjakan TB-72 — Admin Dashboard saja.

Jangan mengerjakan TB-73.

Pertahankan semua fitur yang sudah ada.

Setelah selesai:
- jelaskan file yang dibuat/diubah;
- jelaskan query yang digunakan;
- cek TypeScript;
- cek runtime;
- jelaskan cara testing;
- laporkan masalah yang ditemukan.
```

## 112. MASTER PRODUCT FLOW

```
                    SALESCollect
                         │
                         ▼
                    AUTHENTICATION
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
           ADMIN                   SALES
             │                       │
             ▼                       ▼
        DASHBOARD                DASHBOARD
             │                       │
      ┌──────┼──────┐                │
      ▼      ▼      ▼                ▼
 Customer   Sales  Invoice       My Invoice
                    │                │
                    ▼                ▼
                 Assign          Invoice Detail
                    │                │
                    ▼                ▼
                  Sales         Update Status
                                     │
                                     ▼
                               Status History
                    │
                    ▼
                MONITORING
                    │
                    ▼
                 REPORT
```

## 113. MASTER DATABASE FLOW

```
                    auth.users
                        │
                        ▼
                    profiles
                        │
                 ┌──────┴──────┐
                 ▼             ▼
               admin          sales
                                │
                                ▼
                             invoices
                            /        \
                           ▼          ▼
                      customers    status_history
```

## 114. MASTER SECURITY FLOW

```
User
 │
 ▼
Supabase Auth
 │
 ▼
auth.uid()
 │
 ▼
profiles
 │
 ▼
role
 │
 ├───────────────┐
 ▼               ▼
ADMIN           SALES
 │               │
 ▼               ▼
Full scope     Own invoices
 │               │
 └───────┬───────┘
         ▼
        RLS
         │
         ▼
     PostgreSQL
```

Security tidak boleh hanya "Frontend → Hide Button", tetapi: Frontend + Route Guard + Supabase RLS + Database Constraints.

## 115. FINAL MVP SCOPE

**WAJIB SELESAI:** Authentication, Customer Management, Sales Management, Invoice Management, Invoice Assignment, Collection Status, Status History, Admin Dashboard, Sales Dashboard, Collection Monitoring, Collection Report, Role Authorization, RLS, Error Handling, Loading State, Empty State, Success Feedback, Testing

**TIDAK WAJIB UNTUK MVP** (dapat masuk backlog setelah MVP): Upload bukti pembayaran, Foto bukti collection, PDF export, Excel export, CSV export, WhatsApp customer, GPS customer, Push notification, Reminder jatuh tempo, Offline mode, Automatic reminder, Advanced analytics

Jangan memasukkan fitur tersebut ke MVP hanya untuk membuat aplikasi terlihat lebih kompleks.

## 116. FINAL SUCCESS CRITERIA

SalesCollect dianggap berhasil apabila masalah utama berikut dapat diselesaikan:

**Sebelum SalesCollect**
```
Invoice → Excel / WhatsApp / Catatan → Sulit dimonitor
```

**Setelah SalesCollect**
```
Invoice → SalesCollect → Assign Sales → Collection → Update Status → Dashboard & Report
```

Admin dapat mengetahui: Berapa invoice? Berapa belum ditagih? Berapa sudah ditagih? Berapa sudah dibayar? Siapa yang menangani invoice?

Sales dapat mengetahui: Invoice saya apa saja? Customer-nya siapa? Berapa nominalnya? Kapan jatuh tempo? Statusnya apa?

Dan database dapat memastikan `Sales A ≠ Sales B`, sehingga masing-masing Sales hanya dapat mengakses data yang memang menjadi tanggung jawabnya.

---

## END OF TECHNICAL BACKLOG

Dengan Part 1 + Part 2 + Part 3, Technical Backlog ini sudah mencakup **TB-01 sampai TB-97**: dari inisialisasi project, database dan RLS, Auth, CRUD, assignment, collection, dashboard, report, testing sampai deployment.

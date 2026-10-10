# PRODUCT BACKLOG FINAL — SALES COLLECT

## Product
**SalesCollect** — Mobile Invoice Collection Management System

## Product Goal
Membangun aplikasi mobile yang membantu distributor mengelola invoice, customer, sales, dan proses penagihan secara terpusat sehingga status penagihan dapat dipantau dengan lebih terstruktur.

## Target User

| Role | Tanggung Jawab |
|------|-----------------|
| Admin | Mengelola customer, sales, invoice, assignment, dan monitoring |
| Sales | Melihat invoice yang ditugaskan dan memperbarui status penagihan |

## Technology Stack

- **Frontend:** React Native
- **Framework:** Expo
- **Language:** TypeScript
- **Backend:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth
- **Security:** Row Level Security (RLS)
- **Storage:** Supabase Storage — opsional untuk pengembangan lanjutan

---

## EPIC 01 — AUTHENTICATION

**Goal:** menyediakan akses aplikasi menggunakan sistem authentication standar.

### US-01 — Register

**User Story**
Sebagai pengguna, saya ingin membuat akun menggunakan email dan password agar dapat mengakses SalesCollect.

**Acceptance Criteria**
- User dapat memasukkan nama.
- User dapat memasukkan email.
- User dapat memasukkan password.
- User dapat mengonfirmasi password.
- Email harus valid.
- Password dan confirmation password harus sama.
- Email yang sudah terdaftar tidak dapat digunakan kembali.
- Account dibuat melalui Supabase Auth.

**Output**
- Register screen
- Registration flow
- Form validation

**Outcome**
- Pengguna memiliki akun untuk mengakses aplikasi.

---

### US-02 — Login

**User Story**
Sebagai pengguna, saya ingin login menggunakan email dan password agar dapat masuk ke aplikasi.

**Acceptance Criteria**
- User dapat memasukkan email dan password.
- Credentials diverifikasi oleh Supabase Auth.
- Login gagal jika credentials tidak valid.
- Session disimpan.
- User diarahkan berdasarkan role.

**Output**
- Login screen
- Login authentication
- Session management

**Outcome**
- User dapat mengakses aplikasi sesuai hak aksesnya.

---

### US-03 — Logout

**User Story**
Sebagai pengguna, saya ingin logout agar session akun saya berakhir pada perangkat.

**Acceptance Criteria**
- Tersedia tombol logout.
- Session Supabase dihapus.
- User diarahkan ke Login.

**Output**
- Logout functionality

**Outcome**
- User dapat keluar dari aplikasi dengan aman.

---

### US-04 — Forgot Password

**User Story**
Sebagai pengguna, saya ingin mengatur ulang password ketika lupa password.

**Acceptance Criteria**
- User dapat memasukkan email.
- Sistem mengirimkan reset password melalui Supabase Auth.
- User dapat membuat password baru.

**Output**
- Forgot password screen
- Reset password flow

**Outcome**
- User dapat memperoleh kembali akses akun secara mandiri.

---

## EPIC 02 — USER & ROLE MANAGEMENT

**Goal:** mengatur identitas dan hak akses pengguna.

### US-05 — User Profile

**User Story**
Sebagai sistem, saya ingin menyimpan informasi profile pengguna agar dapat mengetahui identitas dan role pengguna.

**Acceptance Criteria**
- Profile terhubung dengan akun authentication.
- Profile menyimpan nama.
- Profile menyimpan role.
- Role minimal terdiri dari admin dan sales.
- Password tidak disimpan di tabel profile aplikasi.

**Output**

`profiles`
- id
- name
- role
- created_at
- updated_at

**Outcome**
- Sistem dapat mengenali identitas dan role pengguna.

---

### US-06 — Role-Based Access

**User Story**
Sebagai sistem, saya ingin membatasi akses berdasarkan role agar pengguna hanya dapat menggunakan fitur yang sesuai.

**Acceptance Criteria**

Admin:
- Dashboard Admin
- Customer management
- Sales management
- Invoice management
- Assignment
- Monitoring/report

Sales:
- Dashboard Sales
- Invoice miliknya
- Customer terkait
- Update status

Sales tidak dapat:
- Membuat invoice
- Menghapus invoice
- Mengelola sales
- Mengakses invoice sales lain

**Output**
- Role-based navigation
- Route protection
- Supabase RLS

**Outcome**
- Data dan fitur terlindungi berdasarkan tanggung jawab pengguna.

---

## EPIC 03 — CUSTOMER MANAGEMENT

**Goal:** menyediakan database customer sebagai dasar proses invoice dan penagihan.

### US-07 — Customer List

**User Story**
Sebagai Admin, saya ingin melihat daftar customer agar dapat mengelola customer perusahaan.

**Acceptance Criteria**
- Admin dapat melihat daftar customer.
- Nama customer ditampilkan.
- Nomor telepon ditampilkan.
- Alamat dapat ditampilkan.
- Customer dapat dibuka ke halaman detail.
- Empty state ditampilkan jika belum ada data.

**Output**
- Customer List

**Outcome**
- Data customer tersusun dalam satu tempat.

---

### US-08 — Add Customer

**User Story**
Sebagai Admin, saya ingin menambahkan customer agar dapat digunakan dalam pembuatan invoice.

**Acceptance Criteria**
- Admin dapat mengisi nama customer.
- Admin dapat mengisi nama pemilik.
- Admin dapat mengisi nomor telepon.
- Admin dapat mengisi alamat.
- Data tersimpan ke database.
- Customer muncul pada daftar setelah berhasil.

**Output**
- Add Customer
- Customer form
- Database insert

**Outcome**
- Customer baru tersedia untuk proses bisnis.

---

### US-09 — Customer Detail

**User Story**
Sebagai Admin/Sales, saya ingin melihat detail customer agar mengetahui informasi customer yang ditagih.

**Acceptance Criteria**
- Nama customer ditampilkan.
- Nama pemilik ditampilkan.
- Nomor telepon ditampilkan.
- Alamat ditampilkan.
- Invoice customer dapat ditampilkan jika tersedia.

**Output**
- Customer Detail

**Outcome**
- Sales memiliki informasi customer yang diperlukan saat melakukan penagihan.

---

### US-10 — Edit Customer

**User Story**
Sebagai Admin, saya ingin mengubah data customer agar informasi tetap akurat.

**Acceptance Criteria**
- Admin dapat mengubah data customer.
- Perubahan tersimpan ke database.
- Data terbaru ditampilkan setelah update.

**Output**
- Edit Customer
- Update operation

**Outcome**
- Data customer tetap terbarui.

---

## EPIC 04 — SALES MANAGEMENT

**Goal:** mengelola sales yang bertanggung jawab atas penagihan.

### US-11 — Sales List

**User Story**
Sebagai Admin, saya ingin melihat daftar sales agar dapat mengetahui sales yang tersedia.

**Acceptance Criteria**
- Admin dapat melihat sales.
- Nama sales ditampilkan.
- Nomor telepon ditampilkan.
- Status aktif/nonaktif dapat ditampilkan.
- Detail sales dapat dibuka.

**Output**
- Sales List

**Outcome**
- Admin mengetahui sales yang tersedia untuk assignment.

---

### US-12 — Add Sales

**User Story**
Sebagai Admin, saya ingin menambahkan sales agar invoice dapat ditugaskan kepadanya.

**Acceptance Criteria**
- Admin dapat mengisi nama sales.
- Admin dapat mengisi nomor telepon.
- Data sales tersimpan.
- Sales tersedia pada pilihan assignment invoice.

**Output**
- Add Sales
- Sales record

**Outcome**
- Sales baru dapat menerima tugas penagihan.

---

### US-13 — Sales Detail

**User Story**
Sebagai Admin, saya ingin melihat detail sales beserta invoice yang ditugaskan.

**Acceptance Criteria**
- Informasi sales ditampilkan.
- Invoice yang ditugaskan dapat dilihat.
- Status invoice dapat dilihat.

**Output**
- Sales Detail

**Outcome**
- Admin dapat melihat tanggung jawab invoice setiap sales.

---

## EPIC 05 — INVOICE MANAGEMENT

**Goal:** mencatat dan mengelola seluruh tagihan customer.

### US-14 — Invoice List

**User Story**
Sebagai Admin, saya ingin melihat seluruh invoice agar dapat memonitor tagihan.

**Acceptance Criteria**

Invoice menampilkan minimal:
- Nomor invoice
- Customer
- Sales
- Nominal
- Jatuh tempo
- Status

Invoice dapat dibuka ke detail.

**Output**
- Invoice List
- Invoice item/card

**Outcome**
- Admin memiliki gambaran seluruh tagihan.

---

### US-15 — Search Invoice

**User Story**
Sebagai Admin, saya ingin mencari invoice agar dapat menemukan tagihan tertentu dengan cepat.

**Acceptance Criteria**
- Search berdasarkan nomor invoice.
- Search berdasarkan nama customer.
- Hasil pencarian sesuai keyword.

**Output**
- Search functionality

**Outcome**
- Invoice lebih cepat ditemukan.

---

### US-16 — Filter Invoice

**User Story**
Sebagai Admin, saya ingin memfilter invoice berdasarkan status agar dapat fokus pada kondisi tertentu.

**Acceptance Criteria**

Filter minimal:
- Semua
- Belum Ditagih
- Sudah Ditagih
- Dibayar

**Output**
- Filter functionality

**Outcome**
- Admin dapat memonitor invoice berdasarkan status.

---

### US-17 — Add Invoice

**User Story**
Sebagai Admin, saya ingin membuat invoice baru agar tagihan customer tercatat dalam sistem.

**Acceptance Criteria**

Form:
- Nomor invoice
- Customer
- Nominal
- Tanggal invoice
- Jatuh tempo
- Sales
- Catatan

Ketentuan:
- Field wajib divalidasi.
- Status awal otomatis Belum Ditagih.
- Data tersimpan ke database.

**Output**
- Add Invoice
- Invoice form
- Database record

**Outcome**
- Tagihan baru siap diproses untuk penagihan.

---

### US-18 — Invoice Detail

**User Story**
Sebagai Admin/Sales, saya ingin melihat detail invoice agar mengetahui informasi tagihan secara lengkap.

**Acceptance Criteria**
- Nomor invoice ditampilkan.
- Customer ditampilkan.
- Sales ditampilkan.
- Nominal ditampilkan.
- Tanggal invoice ditampilkan.
- Jatuh tempo ditampilkan.
- Status ditampilkan.
- Catatan ditampilkan.

**Output**
- Invoice Detail

**Outcome**
- Pengguna memperoleh informasi lengkap tentang tagihan.

---

### US-19 — Edit Invoice

**User Story**
Sebagai Admin, saya ingin mengubah invoice agar kesalahan atau perubahan data dapat diperbaiki.

**Acceptance Criteria**
- Admin dapat mengubah informasi invoice.
- Perubahan divalidasi.
- Perubahan tersimpan.
- Data terbaru dapat dilihat oleh Sales.

**Output**
- Edit Invoice
- Update operation

**Outcome**
- Data invoice tetap akurat.

---

### US-20 — Delete Invoice

**User Story**
Sebagai Admin, saya ingin menghapus invoice yang tidak valid agar tidak muncul dalam daftar aktif.

**Acceptance Criteria**
- Hanya Admin yang dapat menghapus.
- Sistem meminta konfirmasi.
- Invoice tidak lagi muncul sebagai invoice aktif.
- Sales tidak dapat mengakses invoice yang sudah dihapus.

**Output**
- Delete functionality
- Confirmation dialog

**Outcome**
- Data invoice yang tidak valid dapat ditangani.

---

## EPIC 06 — INVOICE ASSIGNMENT

**Goal:** memastikan setiap invoice memiliki sales yang bertanggung jawab.

### US-21 — Assign Invoice to Sales

**User Story**
Sebagai Admin, saya ingin menugaskan invoice kepada sales agar sales mengetahui tagihan yang menjadi tanggung jawabnya.

**Acceptance Criteria**
- Admin dapat memilih sales.
- Invoice menyimpan sales yang ditugaskan.
- Sales dapat melihat invoice tersebut.
- Sales lain tidak dapat melihat invoice tersebut.
- Assignment dapat diubah Admin.

**Output**

```
invoices
└── sales_id
```

**Outcome**
- Tanggung jawab penagihan setiap invoice menjadi jelas.

---

## EPIC 07 — COLLECTION

**Goal:** memungkinkan Sales menjalankan dan memperbarui proses penagihan.

### US-22 — My Invoice

**User Story**
Sebagai Sales, saya ingin melihat invoice yang ditugaskan kepada saya agar mengetahui customer yang harus ditagih.

**Acceptance Criteria**
- Sales hanya melihat invoice miliknya.
- Invoice sales lain tidak muncul.
- Customer ditampilkan.
- Nominal ditampilkan.
- Jatuh tempo ditampilkan.
- Status ditampilkan.

**Output**
- My Invoice screen

**Outcome**
- Sales memiliki daftar pekerjaan penagihan yang jelas.

---

### US-23 — Update Collection Status

**User Story**
Sebagai Sales, saya ingin memperbarui status invoice setelah melakukan penagihan agar Admin mengetahui progresnya.

**Acceptance Criteria**

Status utama:

```
Belum Ditagih
      ↓
Sudah Ditagih
      ↓
Dibayar
```

- Sales dapat mengubah status.
- Status tersimpan ke database.
- Admin dapat melihat status terbaru.
- Hanya Sales yang berwenang yang dapat memperbarui invoice tersebut.

**Output**
- Update status functionality
- Status database update

**Outcome**
- Admin dapat mengetahui perkembangan penagihan tanpa harus meminta update manual dari Sales.

---

### US-24 — Status History

**User Story**
Sebagai Admin, saya ingin melihat riwayat perubahan status invoice agar dapat mengetahui perjalanan penagihan.

**Acceptance Criteria**

Setiap perubahan mencatat:
- Status lama
- Status baru
- User yang mengubah
- Waktu perubahan

**Output**
- invoice_status_history
- Status history UI

**Outcome**
- Perubahan status invoice dapat ditelusuri.

---

## EPIC 08 — DASHBOARD & MONITORING

**Goal:** memberikan ringkasan kondisi collection.

### US-25 — Admin Dashboard

**User Story**
Sebagai Admin, saya ingin melihat ringkasan invoice agar dapat mengetahui kondisi collection secara cepat.

**Acceptance Criteria**

Dashboard menampilkan minimal:
- Total invoice
- Belum ditagih
- Sudah ditagih
- Dibayar
- Total nominal invoice

**Output**
- Admin Dashboard
- Summary cards

**Outcome**
- Admin dapat memonitor kondisi collection tanpa membuka invoice satu per satu.

---

### US-26 — Sales Dashboard

**User Story**
Sebagai Sales, saya ingin melihat ringkasan invoice saya agar mengetahui pekerjaan penagihan.

**Acceptance Criteria**

Dashboard menampilkan:
- Total invoice saya
- Belum ditagih
- Sudah ditagih
- Dibayar

**Output**
- Sales Dashboard

**Outcome**
- Sales mengetahui jumlah dan kondisi pekerjaan penagihannya.

---

## EPIC 09 — REPORTING

**Goal:** menyediakan rekap collection untuk kebutuhan monitoring Admin.

### US-27 — Collection Report

**User Story**
Sebagai Admin, saya ingin melihat rekap collection agar dapat mengetahui kondisi penagihan berdasarkan periode.

**Acceptance Criteria**
- Total invoice ditampilkan.
- Total nominal ditampilkan.
- Jumlah belum ditagih ditampilkan.
- Jumlah sudah ditagih ditampilkan.
- Jumlah dibayar ditampilkan.
- Report dapat difilter berdasarkan periode.

**Output**
- Collection Report

**Outcome**
- Admin memperoleh rekap kondisi collection berdasarkan periode.

---

### US-28 — Report by Sales

**User Story**
Sebagai Admin, saya ingin melihat rekap invoice berdasarkan sales agar mengetahui distribusi pekerjaan penagihan.

**Acceptance Criteria**
- Sales ditampilkan.
- Jumlah invoice ditampilkan.
- Jumlah invoice berdasarkan status dapat ditampilkan.
- Data dapat difilter berdasarkan periode.

**Output**
- Sales collection report

**Outcome**
- Admin dapat melihat distribusi invoice dan statusnya berdasarkan sales.

---

## EPIC 10 — APPLICATION EXPERIENCE

**Goal:** memastikan aplikasi mudah dipahami dan memberikan feedback yang jelas.

### US-29 — Loading State

**User Story**
Sebagai pengguna, saya ingin mengetahui ketika aplikasi sedang memproses data.

**Acceptance Criteria**
- Loading ditampilkan saat mengambil data.
- Button submit memiliki loading state.
- Submit berulang dapat dicegah.

**Output**
- Loading component

**Outcome**
- Pengguna memahami bahwa aplikasi sedang memproses permintaan.

---

### US-30 — Empty State

**User Story**
Sebagai pengguna, saya ingin mendapatkan informasi ketika belum ada data.

**Acceptance Criteria**
- Empty state ditampilkan ketika list kosong.
- Pesan sesuai konteks.
- CTA ditampilkan jika diperlukan.

**Output**
- Empty state component

**Outcome**
- Pengguna tidak bingung ketika belum ada data.

---

### US-31 — Error Handling

**User Story**
Sebagai pengguna, saya ingin mendapatkan informasi yang jelas ketika terjadi kesalahan.

**Acceptance Criteria**
- Error database ditangani.
- Error network ditangani.
- Validation error ditampilkan.
- Pesan error mudah dipahami.
- Tersedia retry jika memungkinkan.

**Output**
- Error state
- Error message
- Retry

**Outcome**
- Pengguna dapat mengetahui dan menangani masalah yang terjadi.

---

### US-32 — Success Feedback

**User Story**
Sebagai pengguna, saya ingin mendapatkan konfirmasi ketika aksi berhasil.

**Acceptance Criteria**
- Success message muncul setelah aksi berhasil.
- Message sesuai dengan aksi.

Contoh:
- Customer berhasil ditambahkan.
- Invoice berhasil dibuat.
- Status berhasil diperbarui.

**Output**
- Toast/snackbar/dialog

**Outcome**
- Pengguna yakin bahwa tindakan telah berhasil.

---

## PRIORITAS FINAL

### 🔴 MUST HAVE — MVP

- US-01 Register
- US-02 Login
- US-03 Logout
- US-05 User Profile
- US-06 Role-Based Access
- US-07 Customer List
- US-08 Add Customer
- US-09 Customer Detail
- US-11 Sales List
- US-12 Add Sales
- US-14 Invoice List
- US-17 Add Invoice
- US-18 Invoice Detail
- US-19 Edit Invoice
- US-21 Assign Invoice
- US-22 My Invoice
- US-23 Update Collection Status
- US-25 Admin Dashboard
- US-26 Sales Dashboard
- US-31 Error Handling

### 🟡 SHOULD HAVE

- US-04 Forgot Password
- US-10 Edit Customer
- US-13 Sales Detail
- US-15 Search Invoice
- US-16 Filter Invoice
- US-24 Status History
- US-27 Collection Report
- US-28 Report by Sales
- US-30 Empty State
- US-32 Success Feedback

### 🟢 COULD HAVE

Fitur lanjutan jangan dikerjakan sebelum MVP stabil:

- Upload bukti pembayaran
- Foto bukti penagihan
- Export PDF
- Export Excel
- WhatsApp customer
- GPS customer
- Push notification
- Reminder jatuh tempo
- Offline mode
- Automatic reminder

---

## DEFINITION OF DONE

Sebuah User Story dianggap Done apabila:

- [ ] UI sudah dibuat di React Native.
- [ ] Navigation sudah berjalan.
- [ ] Data terhubung dengan Supabase jika membutuhkan database.
- [ ] Validasi form sudah berjalan.
- [ ] Loading state tersedia.
- [ ] Error state ditangani.
- [ ] Success feedback tersedia jika relevan.
- [ ] Role access sudah benar.
- [ ] RLS sudah diterapkan untuk data yang membutuhkan pembatasan.
- [ ] Tidak ada error utama pada console.
- [ ] Fitur sudah diuji sebagai Admin dan/atau Sales sesuai role.
- [ ] Acceptance Criteria terpenuhi.

---

## PRODUCT OUTCOME FINAL

Setelah MVP selesai, kondisi yang ingin dicapai adalah:

**Sebelum SalesCollect**

```
Invoice
   ↓
Catatan / Excel / WhatsApp
   ↓
Informasi tersebar
   ↓
Sulit mengetahui siapa yang menagih
   ↓
Sulit mengetahui status invoice
```

**Setelah SalesCollect**

```
                 SALES COLLECT
                       │
          ┌────────────┴────────────┐
          ↓                         ↓
       ADMIN                     SALES
          │                         │
    Kelola Invoice            Lihat Invoice
    Kelola Customer           Lihat Customer
    Kelola Sales              Update Status
    Assign Invoice                  │
          │                         │
          └────────────┬────────────┘
                       ↓
               SUPABASE DATABASE
                       ↓
                 MONITORING
```

**Outcome utama:**

SalesCollect menjadi sumber data terpusat untuk pengelolaan invoice dan proses penagihan sales, sehingga informasi customer, invoice, penanggung jawab, dan status collection dapat dikelola serta dipantau secara lebih terstruktur.

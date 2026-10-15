# Panduan Pengguna SalesCollect

Panduan pemakaian sehari-hari SalesCollect, disusun berdasarkan menu dan
alur yang benar-benar tersedia di aplikasi.

## 1. Untuk Siapa Aplikasi Ini?

SalesCollect membantu usaha mencatat **piutang berdasarkan penjualan**:
siapa berhutang, berapa, kapan jatuh temponya, dan apakah sudah dibayar —
tanpa buku catatan terpisah dan tanpa takut datanya tercecer.

Ada dua jenis pengguna:

| Jenis | Peran Utama |
| --- | --- |
| **Admin** | Mengelola data customer, sales, dan invoice; memantau seluruh penagihan; membaca laporan dan mengunduh Excel |
| **Sales** | Melihat daftar tagihan yang ditugaskan kepadanya dan memperbarui status penagihan, termasuk mengunggah bukti bayar |

## 2. Memulai

### Membuka aplikasi

- Pengguna baru: layar perkenalan (**onboarding**) tampil sekali saja.
- Setelah itu, buka aplikasi dan masuk melalui **Login**.

### Belum punya akun?

1. Di layar Login, pilih **Daftar / Register**.
2. Isi nama, email, dan password (password diulang untuk konfirmasi).
3. Setelah berhasil, Anda langsung masuk sebagai pengguna **Sales**
   (kecuali admin memberi peran lain).

### Lupa password?

1. Pilih **Lupa password** di layar Login.
2. Masukkan email, lalu cek kotak masuk email Anda.
3. Klik link reset password dan buat password baru.

## 3. Alur Umum Pemakaian

```text
Admin:
  Tambah Customer  →  Tambah Sales  →  Buat Invoice  →  Tugaskan ke Sales
       ↓                                                        ↓
  Pantau di Monitoring / Dashboard                    Sales menagih
       ↓                                                        ↓
  Lihat Reports  →  Unduh laporan Excel            Perbarui status sampai Dibayar
```

## 4. Panduan untuk Admin

Menu utama (setelah login): **Dashboard, Customers, Sales, Invoices,
Monitoring, Reports, Profile, Logout**.

### Dashboard

Ringkasan kondisi collection: jumlah invoice, pembagian status
(Belum Ditagih / Sudah Ditagih / Dibayar), dan total nominal.

### Customers (data pelanggan)

| Aksi | Langkah |
| --- | --- |
| Melihat daftar | Menu **Customers** → daftar nama customer tampil |
| Menambah | Tombol **Tambah** → isi **nama (wajib)**, nama pemilik, telepon, alamat → **Simpan** |
| Melihat detail & invoice-nya | Ketuk nama customer → info customer + daftar invoice terkait |
| Mengubah data | Dari detail → **Edit** → ubah → **Simpan** |
| Menghapus | Dari detail → **Hapus** → konfirmasi |

Catatan: customer yang **masih memiliki invoice tidak bisa dihapus**.
Selesaikan invoice-nya terlebih dahulu.

### Sales (data tim penagihan)

| Aksi | Langkah |
| --- | --- |
| Menambah | Menu **Sales** → **Tambah** → isi nama, telepon → (opsional) tautkan ke akun login → **Simpan** |
| Melihat detail & tugasan | Ketuk nama sales → info + daftar invoice yang ditugaskan |
| Menonaktifkan sales | Dari detail → ubah status aktif. Sales nonaktif tidak menerima tugas baru, tetapi riwayat lama tetap tersimpan |

### Invoices (tagihan / piutang)

| Aksi | Langkah |
| --- | --- |
| Melihat daftar | Menu **Invoices** → daftar tagihan (nomor, customer, sales, nominal, jatuh tempo, status) |
| Mencari | Ketik di kolom cari → cocok nomor invoice atau nama customer |
| Memfilter status | Ketuk chip **Semua / Belum Ditagih / Sudah Ditagih / Dibayar** |
| Menambah | **Tambah** → isi nomor invoice, customer, nominal, tanggal invoice, jatuh tempo, sales (opsional), catatan → **Simpan**. Status otomatis **Belum Ditagih** |
| Mengubah / menugaskan sales | Dari detail → **Edit** → ubah data atau pilih sales lain → **Simpan** |
| Menghapus | Dari detail → **Hapus** → konfirmasi |

### Monitoring

Menu **Monitoring**: cari + filter status untuk memantau seluruh invoice
(kondisi collection tanpa mengubah data).

### Reports (laporan)

1. Buka **Reports**.
2. Pilih rentang tanggal → laporan menampilkan total invoice & nominal,
   jumlah per status, serta rincian per sales (invoice yang belum
   ditugaskan tampil sebagai **Belum ditugaskan**).
3. Pilih **Export** → file **Excel (.xlsx)** dibuat dan dibagikan lewat
   menu berbagi perangkat (WhatsApp, email, penyimpanan, dsb.).

### Profile & Logout

- **Profile**: melihat nama dan peran; mengubah nama lalu **Simpan**
  (peran tidak bisa diubah dari layar ini).
- **Logout**: konfirmasi → keluar dari aplikasi.

## 5. Panduan untuk Sales

Menu utama: **Dashboard, My Invoices, Profile, Logout**.

### Dashboard

Ringkasan **tagihan milik Anda sendiri**: total, pembagian status, dan
total nominal.

### My Invoices (tagihan saya)

- Daftar invoice yang ditugaskan kepada Anda. Tagihan sales lain tidak
  tampil.
- Ketuk salah satu untuk membuka detail (info tagihan, data customer,
  dan riwayat status).

### Memperbarui status penagihan (dari detail invoice)

Status berjalan **berurutan**:

```text
Belum Ditagih  →  Sudah Ditagih  →  Dibayar
```

| Tujuan | Langkah |
| --- | --- |
| Sudah dihubungi/diingatkan pelanggan | **Perbarui Status** → pilih **Sudah Ditagih** → konfirmasi |
| Pelanggan sudah membayar | **Tandai Dibayar** → pilih/ambil **foto bukti bayar** → tunggu unggah selesai → status menjadi **Dibayar** |

Aturan penting:

- Pemindahan mundur, melompat, atau ke status yang sama **ditolak**
  aplikasi — ikuti urutan di atas.
- Bukti bayar **wajib** saat menandai Dibayar. Jika foto gagal diunggah,
  status tidak berubah — coba lagi.
- Setiap perubahan status tercatat otomatis di **riwayat status**
  (status lama → baru, pengubah, waktu).

### Riwayat dan bukti bayar

- **Riwayat status** tampil di bagian bawah detail invoice.
- **Bukti bayar** tampil sebagai kartu bukti di detail invoice (bisa
  dilihat sales pemilik dan admin).

## 6. Pertanyaan Umum

| Pertanyaan | Jawaban |
| --- | --- |
| Mengapa saya tidak melihat invoice ini? | Invoice belum ditugaskan ke Anda, atau Anda membuka data sales lain (hanya bisa dilihat admin) |
| Siapa yang boleh mengubah status? | Sales pemilik invoice; admin memantau lewat riwayat, monitoring, dan laporan |
| Bagaimana cara membagikan laporan ke pemilik usaha? | Reports → pilih tanggal → **Export** → bagikan file Excel |
| Apakah data hilang jika saya logout? | Tidak. Data tersimpan di server; login kembali untuk mengaksesnya |
| Bisa dipakai tanpa internet? | Tidak — SalesCollect perlu koneksi untuk membaca dan menyimpan data |
| Siapa yang bisa menjadi Admin? | Admin lain — peran diberikan lewat sistem, tidak bisa dipilih saat mendaftar |

# Deployment dan Operasional

Panduan menjalankan, membangun, dan menyiapkan SalesCollect. Seluruh
perintah dan konfigurasi disesuaikan dengan `package.json`, `app.json`,
dan `eas.json` yang ada di project.

> Status: aplikasi berjalan dalam tahap pengembangan. **Belum ada bukti
> publikasi ke Play Store / App Store** — dokumen ini tidak mengklaim
> aplikasi sudah dirilis.

## 1. Prasyarat

| Kebutuhan | Keterangan |
| --- | --- |
| Node.js + npm | Untuk instalasi dependency dan menjalankan Expo |
| Akun Supabase | Project database + Auth (URL & anon key) |
| Perangkat/dev client | Expo Go (development) atau build development client |
| Android Studio / Xcode | Opsional — hanya untuk build native lokal (`expo run:android/ios`) |
| Akun Expo + EAS CLI | Opsional — untuk build cloud (`eas build`) |

## 2. Instalasi Dependency

```bash
npm install
```

## 3. Konfigurasi Environment

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

Isi `​.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=<url project Supabase>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
```

Nilai diambil dari **Supabase Dashboard → Project Settings → API**.

Aturan:

- `.env` tidak masuk Git (lihat `.gitignore`).
- Jangan pernah menaruh `SUPABASE_SERVICE_ROLE_KEY` di aplikasi ini.
- Nilai `EXPO_PUBLIC_*` di-bundle ke dalam binary saat build — mengubahnya
  memerlukan build ulang.

## 4. Menjalankan (Development)

```bash
npm start          # expo start — pilih perangkat/emulator
npm run android    # expo run:android (build native lokal)
npm run ios        # expo run:ios (butuh macOS)
npm run web        # expo start --web
```

Pengecekan kualitas:

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
npx expo-doctor    # diagnosa dependency/konfigurasi
```

## 5. Konfigurasi Backend (Supabase)

### 5.1 Jalankan migration

Migration wajib dijalankan **berurutan** `001` → `014` (lihat
`docs/DATABASE_AND_STATE.md` untuk daftar isinya).

**Opsi A — Supabase SQL Editor:** buka SQL Editor, jalankan tiap file
migration berurutan.

**Opsi B — Supabase CLI:**

```bash
supabase init                                   # sekali saja
supabase link --project-ref <project-ref>
supabase db push
```

Catatan: migration 013 (bucket `payment-proofs`) dan 014 (RPC versi
3 argumen) dijalankan **sekali** setelah migration sebelumnya.

### 5.2 Daftarkan redirect URL Auth

Fitur "Lupa Password" membutuhkan redirect terdaftar di
**Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**:

| Lingkungan | URL |
| --- | --- |
| Development (Expo Go / dev client) | `exp://<host>:<port>/--/reset-password` |
| Production (scheme `salescollect`) | `salescollect://reset-password` |

### 5.3 Struktur akun & role

- Setiap register baru otomatis mendapat profile dengan role `sales`
  (trigger `handle_new_user`, migration 010).
- Role `admin` dinaikkan manual oleh admin (provisioning terkontrol).
- Data sales dapat ditautkan ke akun login saat membuat data sales
  (menu admin → Sales → Tambah).

## 6. Build (Pengemasan Aplikasi)

### 6.1 Build lokal

```bash
npm run android     # menghasilkan build Android via gradle
npm run ios         # menghasilkan build iOS (macOS saja)
```

Catatan: `android/` dan `ios/` adalah folder hasil generate (Continuous
Native Generation) — jangan diedit manual; konfigurasi native ada di
`app.json`.

### 6.2 Build cloud (EAS)

Build profile di `eas.json`:

| Profile | Kegunaan | Catatan |
| --- | --- | --- |
| `development` | Development client | `developmentClient: true`, distribution internal |
| `preview` | Uji internal | APK Android (`buildType: apk`), non-dev-client |
| `production` | Rilis | Menandai `EXPO_PUBLIC_ENVIRONMENT=production` |

```bash
npx eas-cli build --profile preview      # APK untuk uji internal
npx eas-cli build --profile production   # build produksi
```

Konfigurasi identitas aplikasi (`app.json`):

- `name`: SalesCollect, `slug`: SalesCollect, `scheme`: `salescollect`
- Android package: `com.salescollect.app` (`versionCode: 1`)
- iOS bundle id: `com.salescollect.app` (`buildNumber: "1"`)
- Versi aplikasi: `1.0.0`

### 6.3 Persiapan release

Checklist sebelum build produksi:

1. [ ] `.env` berisi URL + anon key project **production** (jika memakai
      project terpisah — lihat bagian 7).
2. [ ] Seluruh migration `001`–`014` sudah dijalankan di database production.
3. [ ] Redirect URL production (`salescollect://reset-password`) terdaftar.
4. [ ] `npm run typecheck` dan `npm run lint` lulus.
5. [ ] Versi di `app.json` (`version` / `versionCode` / `buildNumber`)
      dinaikkan jika mengunggah versi baru.
6. [ ] Build ulang dilakukan setelah mengubah nilai env (nilai lama tidak
      boleh terbawa ke binary).

## 7. Development vs Production

MVP ini memakai **satu project Supabase** untuk development dan
production; environment ditentukan oleh isi `.env` saat build. Untuk
pemisahan yang benar-benar terpisah:

1. Buat project Supabase production baru.
2. Jalankan semua file `supabase/migrations/` berurutan.
3. Salin `.env.example` → `.env` berisi URL + anon key project production.
4. Build ulang — nilai lama tidak boleh terbawa ke binary produksi.

Build profile EAS sudah menandai `EXPO_PUBLIC_ENVIRONMENT`
(`development` / `preview` / `production`).

## 8. Troubleshooting

### Umum

| Masalah | Penyebab | Solusi |
| --- | --- | --- |
| Aplikasi langsung crash saat start: "Konfigurasi Supabase belum lengkap" | `.env` belum dibuat/diisi | Salin `.env.example` → `.env`, isi kedua nilai, restart dev server |
| Request lama tidak pernah selesai / "Koneksi bermasalah" | Internet lambat/terputus | Timeout 15 detik membatalkan request; cek koneksi lalu tekan Coba lagi |
| Fitur Lupa Password tidak mengirim ke aplikasi | Redirect URL belum terdaftar | Daftarkan URL sesuai tabel bagian 5.2 |
| Reset password dilempar ke dashboard | Membuka link ketika sudah login | Keluar (logout) dulu, lalu buka link dari email |
| Sales tidak melihat invoice tertentu | Belum ditugaskan / bukan miliknya | Admin memeriksa assignment di detail invoice (UC-A17) |
| "Customer masih memiliki N invoice dan tidak dapat dihapus" | Constraint + validasi app | Selesaikan/hapus invoice customer tersebut lebih dulu |

### Windows (catatan lingkungan pengembangan, dari temuan TB-95)

- `gradlew.bat` gagal menemukan `gradle-wrapper.jar` dari path non-ASCII
  (misal proyek di OneDrive/`ドキュメント`) — jalankan build native dari
  salinan di path ASCII, atau langsung via
  `java -cp gradle/wrapper/gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain`.
- `GRADLE_USER_HOME` user-level yang menunjuk ke instalasi pihak ketiga
  bisa merusak kompilasi Gradle Kotlin DSL (`Unresolved reference 'plugins'`)
  — override `GRADLE_USER_HOME` ke direktori bersih.
- NDK membutuhkan path proyek pendek (batas path panjang Windows) —
  gunakan root pendek seperti `C:\sc\SalesCollect` untuk build native.

### Pemeriksaan cepat

```bash
npx expo-doctor        # kesehatan dependency & konfigurasi
npm run typecheck      # validasi TypeScript
npm run lint           # ESLint (eslint-config-expo)
git status             # pastikan .env tidak ter-stage
```

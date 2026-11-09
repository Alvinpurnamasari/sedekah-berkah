# Sedekah Berkah – Laravel + React PWA starter

Starter full-stack untuk platform sedekah dengan area publik, admin, superadmin, guest checkout, kampanye, dan fondasi integrasi pembayaran.

## Stack
- Laravel 12 / PHP 8.2+
- React + Inertia.js
- PostgreSQL
- Vite + Tailwind CSS
- PWA manifest + service worker

## Menjalankan lokal
1. Install PHP 8.2+, Composer, Node.js 20+, PostgreSQL.
2. `composer install`
3. `cp .env.example .env`
4. `php artisan key:generate`
5. Buat database `sedekah_berkah`, lalu atur `.env`.
6. `php artisan migrate --seed`
7. `npm install`
8. `npm run build` (atau `npm run dev` untuk development)
9. `php artisan serve`

## Status implementasi
Termasuk: kerangka Laravel, migration inti, model Campaign/Donation, API publik, endpoint guest donation, halaman homepage, detail program, checkout awal, transparansi, dashboard placeholder admin/superadmin, dan PWA shell.

Belum siap menerima uang sungguhan: payment gateway belum dihubungkan ke SDK/API Midtrans; webhook adalah kerangka validasi signature dan wajib dilengkapi dengan pengecekan status server-to-server, pencatatan idempotent, transaksi database, rekonsiliasi, serta jurnal double-entry. Belum termasuk seluruh modul CRUD/approval, autentikasi/role provisioning, upload privat, dan seluruh tabel ledger. Dashboard admin/superadmin wajib dipasang middleware RBAC dan policy sebelum deployment.

## Catatan penting sebelum produksi
- Jangan deploy dengan `APP_DEBUG=true`.
- Konfigurasikan HTTPS, secret, queue, scheduler, backup, rate limiting, MFA superadmin, dan object storage privat.
- Buat akun merchant payment gateway atas nama pengelola yang sah dan selesaikan pemeriksaan legal/PUB.
- Jangan gunakan data demo sebagai klaim donasi atau penyaluran nyata.
- Minta review keamanan independen sebelum menerima dana publik.

## Endpoint awal
- `GET /api/v1/campaigns`
- `GET /api/v1/campaigns/{slug}`
- `POST /api/v1/donations`
- `GET /api/v1/donations/{code}`
- `POST /api/v1/payments/midtrans/webhook`

## Konfigurasi Midtrans
Isi `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, dan `MIDTRANS_IS_PRODUCTION` pada environment server. Implementasikan pembuatan Snap transaction menggunakan SDK resmi dan verifikasi status melalui API Midtrans sebelum menandai pembayaran paid.

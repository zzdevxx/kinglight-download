# Dokumentasi Teknis

Status: portal v0.2.0 dipublikasikan di GitHub Pages pada 2026-11-26. Snapshot live dan kedua aset telah diverifikasi.

Portal `kinglight-download` adalah situs statis tanpa build step, dependensi npm, akun, basis data, server aplikasi, analitik, atau AI. Browser memuat HTML, CSS, JavaScript, lalu membaca `release.json` dari direktori yang sama.

Tautan: https://github.com/zzdevxx/kinglight-download dan https://github.com/zzdevxx/kinglight

## Menjalankan dan menguji

```sh
python -m http.server 4174 --bind 127.0.0.1
node --test
```

Port 4174 dipilih agar tidak bertabrakan dengan layanan lain di workspace. `node --test` memakai `node:test` bawaan dan tidak memasang packages.

Tautan CSS dan JavaScript memakai `?design=remake` sebagai cache key stabil. Query ini tidak menggantikan versi aplikasi dan tidak masuk validator URL rilis.

## Peta berkas

| Berkas | Peran |
|---|---|
| `index.html` | Halaman utama, screenshot, status rilis, hero CTA, alur kerja, persyaratan, sumber. |
| `site.css` | Token warna, font display lokal, layout responsif, lima state kontrol, `[hidden]`, reduced motion. |
| `site.js` | Validator snapshot, pemilih artefak, hero CTA, render status, copy hash, fallback screenshot. |
| `privacy.html` | Data portal, data lokal, dan batas log hosting. |
| `terms.html` | Ketentuan portal dan tautan unduhan. |
| `data-deletion.html` | Penghapusan konfigurasi lokal oleh pengguna. |
| `favicon.svg` | Tanda tipografi KL dengan palet baru. |
| `release.json` | Snapshot rilis. Sumber versi tetap berada di Kinglight. |
| `assets/simulator.webp` | Screenshot 1440x810 dari executable portable v0.2.0 yang dijalankan. |
| `assets/fonts/BarlowCondensed-Bold.ttf` | Font display self-hosted dari Google Fonts. |
| `assets/fonts/OFL.txt` | Lisensi SIL Open Font License 1.1. |
| `assets/fonts/SOURCE.md` | Sumber font dan catatan pemakaian. |
| `tests/release-contract.test.js` | Uji kontrak, metadata, artefak, dan semantik halaman. |
| `docs/RELEASE-CONTRACT.md` | Kontrak snapshot rilis. |
| `DESIGN.md` | Design Read, token, override needmcp, dan gerbang desain. |
| `README.md` | Ringkasan dan perintah lokal. |
| `HANDOFF.md` | Status serah terima dan langkah publish. |

## Arsitektur rilis

1. Kinglight menerbitkan aset ke GitHub Release dan mengukur ukuran serta SHA-256 dari berkas yang sudah diunggah.
2. Snapshot `release.json` dibuat dari aset terverifikasi dengan `schemaVersion: 1`.
3. `site.js` memanggil `validateReleaseSnapshot` sebelum menyentuh tampilan unduhan.
4. `selectDownloadArtifacts` memilih artefak `.exe` sebagai aksi utama dan artefak `.zip` sebagai "Versi portable" bila tersedia.
5. Hero dan panel memakai `artifact.url` yang sudah lolos pemeriksaan URL GitHub Release Kinglight.
6. Pemeriksaan checksum tetap berada di rincian rilis, bukan di alur penggunaan simulator.

Versi, tag, tanggal, ukuran, hash, dan nama berkas tidak ditulis manual di HTML, CSS, atau JavaScript. Snapshot `release.json` v0.2.0 dibuat dari aset GitHub Release yang sudah diunduh ulang dan dicocokkan.

## Keadaan tampilan

| State | Panel | Hero | Tautan biner |
|---|---|---|---|
| `loading` | "Menyiapkan unduhan", `aria-busy="true"` | "Lihat status rilis" | Tidak ada |
| `available` | Versi, artefak, tombol installer, tombol portable bila ada, rincian tertutup | "Unduh untuk Windows" dan "Versi portable" bila keduanya valid | Ya, dari metadata valid |
| `unreleased` | "Belum ada unduhan aktif" | "Lihat status rilis" | Tidak ada |
| `invalid` | Alasan validasi data rilis | "Lihat status rilis" | Tidak ada |
| `error` | Gagal fetch dan tombol muat ulang | "Lihat status rilis" | Tidak ada |

Copy SHA-256 memakai Clipboard API dengan fallback textarea. Status "Menyalin hash.", "SHA-256 tersalin.", dan "Gagal menyalin. Pilih teks hash lalu salin manual." dibacakan lewat `role="status"`. Kegagalan dicatat ke console dengan konteks pesan error.

## Aset visual

Halaman menampilkan screenshot asli `assets/simulator.webp` dengan rasio 16:9, diambil dari executable portable v0.2.0 yang dijalankan. Jika gambar gagal dimuat, `initScreenshot` menampilkan `Pratinjau belum dapat ditampilkan. Coba muat ulang halaman.`. Aturan `[hidden]` global mencegah gambar rusak dan fallback tampil bersamaan. Screenshot bukan hasil generasi gambar atau salinan video.

Bingkai screenshot hanya memakai border 1 px, radius 4 px, dan bayangan lembut. Tidak ada `console-frame-top`, rel samping, tanda grooves, `512`, `DMX`, atau kontrol aplikasi palsu. Detail yang ditampilkan sebagai fakta: Windows x64 dari artefak, WebView2 Runtime, dan Art-Net opsional untuk lampu fisik.

Font display Barlow Condensed Bold dimuat dari `assets/fonts/BarlowCondensed-Bold.ttf` melalui `@font-face` di `site.css`. Lisensi `OFL.txt` disertakan. Judul produk memakai `letter-spacing: -0.04em`. Tidak ada permintaan font ke pihak ketiga.

## Desain dan aksesibilitas

- Satu tema terang, off-white dingin, tinta hitam, satu aksen vermilion, dan border screenshot tajam.
- Angka memakai `tabular-nums`.
- Semua kontrol minimal 44 px, tombol primer 48 px, focus ring 3 px, active `scale(0.98)`, disabled opacity `0.5`.
- `prefers-reduced-motion` mematikan transisi dan transform saat menekan.
- Satu `h1`, urutan heading tanpa lompatan, skip link, landmark semantic, `alt` gambar, dan `aria-live` pada status.
- Suffix ", membuka tab baru" hanya untuk pembaca layar.
- Tidak ada glassmorphism, gradient teks, kartu tiga kolom identik, atau eyebrow di setiap bagian.

Render browser lokal diukur pada 320, 375, 768, 1024, 1440, dan 1920 px. Tidak ada overflow horizontal dan kontrol terkecil 44 px. State gambar sukses dan gagal hanya menampilkan satu visual. Fixture dua artefak menghasilkan urutan CTA `.exe` lalu `.zip`. Console browser tidak memuat error setelah rute asli dan fixture disiapkan.

## Kontrak rilis

Baca [docs/RELEASE-CONTRACT.md](docs/RELEASE-CONTRACT.md). Ringkasan:

- `schemaVersion: 1`, status `unreleased` atau `available`.
- Snapshot `unreleased` tidak boleh memiliki artefak atau field rilis.
- Snapshot `available` memuat versi, tag, commit sumber, waktu terbit, kanal, tautan rilis, dan minimal satu artefak.
- Tiap artefak memuat platform, arsitektur, nama berkas, URL aset, ukuran byte, dan SHA-256.
- URL harus menuju `https://github.com/zzdevxx/kinglight/releases/...`.
- SHA-256 membuktikan kesesuaian berkas, bukan identitas penerbit. Penandatanganan kode butuh sertifikat nyata.

## Publish

Rilis v0.2.0 telah mengikuti urutan tersebut. `node --test` lulus 27 tes. Browser lokal dan live memverifikasi render responsif pada enam lebar, screenshot 1440x810, link installer dan portable, kontrol salin SHA-256, serta console tanpa error. `scripts/verify-portal.mjs` lulus sembilan pemeriksaan terhadap halaman, snapshot, ukuran, dan hash dua aset.

Commit portal dan source tersinkron di `origin`, `codeberg`, dan `github`. GitHub Pages memuat snapshot `v0.2.0`.

Jika salah satu remote gagal atau lebih maju, hentikan klaim publish lengkap dan minta keputusan. Push paksa, mirror, reset, dan rewrite riwayat dilarang.

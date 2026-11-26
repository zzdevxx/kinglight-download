# kinglight-download

Status: implementasi portal, screenshot asli, dan snapshot metadata v0.2.0 selesai secara lokal. GitHub Pages belum diperbarui.

Portal statis untuk halaman unduhan Kinglight. Halaman utama menampilkan tangkapan layar simulator, tombol unduhan dari metadata rilis, rincian dan SHA-256 yang dapat disalin, alur kerja, persyaratan, serta tautan ke sumber resmi. Tiga halaman pendukung tersedia untuk privasi, ketentuan, dan penghapusan data lokal.

Tautan kanonik:

- Portal live: https://zzdevxx.github.io/kinglight-download/
- Sumber portal: https://github.com/zzdevxx/kinglight-download
- Desktop: https://github.com/zzdevxx/kinglight

## Menjalankan lokal

Tidak ada dependensi npm. Dari direktori repo:

```sh
python -m http.server 4174 --bind 127.0.0.1
node --test
```

Buka `http://127.0.0.1:4174/`. Port 4174 dipakai agar tidak bentrok dengan layanan lain di workspace.

## Struktur

- `index.html`: halaman utama dengan hero asimetris, screenshot, unduhan, alur kerja, persyaratan, dan sumber.
- `site.css`: token terang, font display lokal, kontrol, status, tata letak responsif 320 px sampai 1920 px, dan reduced motion.
- `site.js`: validator kontrak rilis, pemilih artefak, render status, hero CTA, copy hash, dan fallback screenshot.
- `privacy.html`, `terms.html`, `data-deletion.html`: hukum dan batas data lokal dengan chroma yang sama.
- `release.json`: snapshot v0.2.0 yang dibuat setelah ukuran dan hash aset GitHub Release diverifikasi.
- `assets/simulator.webp`: screenshot 1440x810 dari executable portable v0.2.0 yang benar-benar dijalankan.
- `assets/fonts/`: Barlow Condensed Bold dari Google Fonts beserta `OFL.txt` dan `SOURCE.md`.
- `tests/release-contract.test.js`: uji kontrak, metadata rilis, pemilih artefak, dan semantik halaman.
- `docs/RELEASE-CONTRACT.md`: kontrak snapshot rilis.
- `DESIGN.md`, `HANDOFF.md`, `DOCUMENTATION.md`: status implementasi dan arah desain terkini.

## Rilis dan unduhan

Portal membaca `release.json` lewat `fetch('./release.json')` lalu memvalidasi schema dan URL resmi sebelum menampilkan tautan. Versi, tanggal, ukuran, hash, dan nama berkas tidak ditulis manual di HTML, CSS, atau JavaScript.

Bila snapshot `available`, hero memakai `.exe` sebagai "Unduh untuk Windows" dan menampilkan "Versi portable" bila artefak `.zip` tersedia. Status `loading`, `unreleased`, `invalid`, dan `error` tidak memasang tautan biner. Artefak tetap berada di GitHub Release Kinglight. Installer biner tidak masuk Git portal.

Kinglight pada Windows memerlukan Microsoft Edge WebView2 Runtime. Jaringan hanya diperlukan bila ingin mengirim Art-Net ke lampu fisik.

Tautan CSS dan JavaScript memakai `?design=remake` sebagai cache key stabil. Ini bukan nomor versi aplikasi dan tidak menggantikan validasi URL rilis.

## Aset visual

`index.html` merujuk screenshot asli 1440x810 di `assets/simulator.webp`, diambil dari aplikasi portable yang dijalankan. Bila gambar gagal dimuat, halaman menampilkan `Pratinjau belum dapat ditampilkan. Coba muat ulang halaman.`. Aturan `[hidden]` global memastikan gambar rusak dan fallback tidak tampil bersamaan.

Tidak ada gambar yang dihasilkan, video yang disalin, logo baru, antarmuka konsol tiruan, atau tangkapan layar tiruan dari sesi ini. Bingkai screenshot memakai border tajam dan bayangan lembut.

Font display disimpan lokal. Tidak ada permintaan font ke pihak ketiga saat halaman dibuka. Lisensi font berada di `assets/fonts/OFL.txt`.

## Batasan

Portal tidak memiliki akun, basis data, server aplikasi, analitik, AI, atau backend penghapusan data. Browser tidak mengirim UDP Art-Net 6454 mentah. Konfigurasi jaringan dan fixture menjadi tanggung jawab operator.

Sinkronisasi tiga remote hanya menyamakan ref Git. Remote: `origin`, `codeberg`, `github`. Aset GitHub Release dan halaman deploy tidak ikut tersalin otomatis. Push paksa, mirror, reset, dan rewrite riwayat dilarang.

## Verifikasi

```sh
node --test
git status --short --branch
```

Hasil lokal terakhir: 27 pengujian lulus, 0 gagal. Render browser pada 320, 375, 768, 1024, 1440, dan 1920 px tidak menunjukkan overflow horizontal; kontrol terkecil 44 px. Uji state gambar sukses dan gagal menunjukkan hanya satu visual yang tampil. Console browser tidak memuat error setelah rute asli dan fixture disiapkan.

Rilis aplikasi v0.2.0 sudah tersedia di GitHub. Snapshot portal sudah diperbarui secara lokal; commit, sinkronisasi cloud, dan deploy masih tertunda.

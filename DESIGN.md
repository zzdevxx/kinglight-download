# Arah desain kinglight-download

Status: portal v0.2.0 live pada 2026-11-26 dengan screenshot dari portable dan metadata rilis terverifikasi.

## Design Read

Portal unduhan aplikasi desktop untuk operator pencahayaan, dengan bahasa visual lembar produk teknis. Arahnya: kertas putih dingin, tinta hitam, aksen vermilion, dan tangkapan layar asli tanpa perangkat keras tiruan. Pengunjung perlu menemukan installer resmi, melihat bukti visual aplikasi, lalu memeriksa rincian rilis tanpa melewati halaman pemasaran yang bertele-tele.

Dial: `DESIGN_VARIANCE 8` (komposisi asimetris), `MOTION_INTENSITY 2` (feedback kontrol saja), `VISUAL_DENSITY 5` (cukup rapat untuk data rilis, tidak penuh kartu).

Arahan ini menggantikan arah charcoal dan amber pada versi dokumen sebelumnya dan penyempurnaan bingkai konsol biru atas keputusan pemilik. Keputusan pemilik lebih tinggi dari dokumen lama.

## Override terhadap panduan komponen

NeedMCP menyimpan `blueprint-technical` sebagai panduan komponen dasar di `.needmcp/state.json`. Panduan itu dipakai untuk kontrol tajam, fokus terlihat, `active` scale `0.98`, dan `disabled` opacity `0.5`. Warna, susunan halaman, tipografi, dan citra mengikuti brief pemilik, bukan palet bawaan blueprint. Tidak ada glassmorphism, gradient teks, kartu tiga kolom identik, atau eyebrow di setiap bagian.

## Sistem visual

| Peran | Token | Alasan |
|---|---|---|
| Kertas | `--paper: #f4f6f8` | Putih dingin memberi ruang pada tinta dan angka tanpa terasa hangat atau krem. |
| Tinta | `--ink: #111820` | Teks utama dan garis kuat. Kontras terhadap kertas dihitung 16,49:1. |
| Tinta sekunder | `--ink-2: #3c4854` | Paragraf pendukung. Kontras terhadap kertas dihitung 8,63:1. |
| Aksen | `--vermilion: #b8321d` | Satu warna untuk aksi dan status rilis tersedia. Kontras terhadap kertas dihitung 5,52:1. |
| Garis | `--line: #c5ced6` | Pemisah 1 px dan border kontrol. |

Perhitungan kontras di atas memakai rasio luminans relatif standar untuk pasangan token yang tercantum. Teks putih di atas vermilion memiliki rasio 5,98:1.

Tipografi display memakai Barlow Condensed Bold yang disimpan di `assets/fonts/BarlowCondensed-Bold.ttf` dengan lisensi SIL Open Font License 1.1 di `assets/fonts/OFL.txt`. Sumber adalah repositori Google Fonts. Tidak ada permintaan font ke pihak ketiga saat halaman dibuka. Judul produk memakai `letter-spacing: -0.04em`. Tubuh teks memakai font sistem Windows, dan angka teknis memakai `tabular-nums`.

Skala ukuran: `0.75rem`, `0.875rem`, `1rem`, `1.15rem`, `clamp(1.5rem, 3vw, 2.25rem)`, dan `clamp(3.5rem, 11vw, 6rem)`. Judul produk sengaja melewati skala biasa karena nama produk adalah identitas utama. Batas atas 6 rem mengikuti panduan design-taste.

Radius mengikuti aturan yang tercatat: `3px` untuk kontrol, `8px` untuk panel, dan `4px` untuk bingkai screenshot. Garis selalu `1px`, kecuali garis atas panel selebar `3px` yang menandakan status. Bayangan screenshot bersifat lembut dan dangkal, bukan bayangan keras 8 px.

## Susunan halaman

1. Header solid dengan wordmark, tautan ke unduhan, alur kerja, persyaratan, dan privasi.
2. Hero asimetris. Kiri: nama produk besar, pernyataan fungsi, status yang diisi `site.js`, dan aksi unduhan dari snapshot tervalidasi. Kanan: tangkapan layar asli di dalam bingkai tajam.
3. Bagian unduhan. Satu panel status dengan tombol installer utama, tombol "Versi portable" bila artefak `.zip` tersedia, rincian rilis, dan `<details>` tertutup untuk versi, waktu, commit, ukuran, serta SHA-256. Tombol tidak dibuat sebelum status `available` dan URL aset tervalidasi.
4. Alur kerja tiga langkah yang memakai urutan nyata aplikasi: buka simulator, pilih fixture dan Shape, lalu lihat hasilnya.
5. Persyaratan singkat: Windows, WebView2 Runtime, jaringan opsional, dan tanpa akun.
6. Sumber dan footer dengan tiga halaman pendukung.

Copy beranda berbicara tentang simulator konsol lighting, bukan admin portal. Penjelasan `release.json`, `site.js`, `snapshot`, dan perintah PowerShell hanya berada di sumber atau rincian rilis. Tidak ada testimonial, statistik buatan, harga, FAQ generik, atau kartu fitur yang berulang.

## Aset visual

`index.html` menampilkan `assets/simulator.webp`, screenshot 1440x810 dari executable portable v0.2.0 yang benar-benar dijalankan. Gambar tidak dihasilkan atau disalin dari video. Aturan `[hidden]` global memastikan satu visual yang tampil: gambar saat berhasil dimuat, atau teks `Pratinjau belum dapat ditampilkan. Coba muat ulang halaman.` saat gagal.

Tidak ada `console-frame-top`, rel samping, tanda grooves, angka `512`, label `DMX`, atau kontrol palsu. Bingkai hanya border 1 px, radius 4 px, dan bayangan lembut. Tidak ada antarmuka aplikasi tiruan.

Pemilik akan merilis dua artefak Windows x64: installer NSIS `.exe` dan arsip `.zip` berisi `kinglight.exe` portable. Portal memilih `.exe` sebagai aksi utama berdasarkan ekstensi nama berkas dan menampilkan `.zip` sebagai aksi kedua bila hadir. Tidak ada nomor versi, ukuran, atau hash yang ditulis manual di HTML, CSS, atau JavaScript.

## Interaksi dan kondisi

Semua tautan dan tombol memiliki lima keadaan: `default`, `hover`, `focus-visible`, `active`, dan `disabled`. Target sentuh minimal 44 px; tombol utama 48 px. Fokus memakai outline hitam 3 px dengan offset 3 px. Tombol aktif memakai `scale(0.98)`. Tombol bisa dinonaktifkan oleh skrip saat menyalin hash dan menampilkan alasan lewat teks status.

Status rilis yang dibedakan:

- `loading`: "Menyiapkan unduhan", `aria-busy="true"`, hero hanya memuat tautan "Lihat status rilis".
- `available`: hero memuat "Unduh untuk Windows" untuk `.exe` dan "Versi portable" untuk `.zip` bila keduanya tervalidasi. Panel memuat versi, artefak, dan rincian tertutup.
- `unreleased`: pesan tidak ada unduhan aktif, tanpa tautan biner.
- `invalid`: pesan data rilis tidak valid, tanpa tautan biner.
- `error`: pesan data rilis tidak dapat dimuat beserta tombol muat ulang, tanpa tautan biner.

Suffix ", membuka tab baru" hanya untuk pembaca layar. Teks tampilan tidak memuat qualifier tersebut.

Copy hash memiliki tiga hasil teks: "Menyalin hash.", "SHA-256 tersalin.", dan "Gagal menyalin. Pilih teks hash lalu salin manual." Semua hasil dibacakan lewat `role="status"`.

## Respons dan aksesibilitas

Render lokal diukur pada 320, 375, 768, 1024, 1440, dan 1920 px. Tidak ada overflow horizontal dan tinggi kontrol terkecil 44 px. Grid berubah menjadi satu kolom sebelum ruang sempit memaksa teks terpotong. Hash dan nama berkas memakai `overflow-wrap: anywhere`. Gambar memakai `max-width: 100%`. Tidak ada `overflow-x: hidden` untuk menyembunyikan kesalahan tata letak.

Satu `h1`, urutan `h2` dan `h3` tanpa lompatan, skip link pertama, landmark `header`, `nav`, `main`, dan `footer`, serta `alt` deskriptif pada tangkapan layar. `prefers-reduced-motion` mematikan transisi dan `scale` saat menekan. Halaman memakai satu tema terang karena brief pemilik menentukan kertas putih dingin; tidak ada mode gelap yang didesain atau dijanjikan.

Tautan CSS dan JavaScript memakai query stabil `?design=remake` agar pengunjung versi lama menerima aset baru setelah deploy tanpa angka versi manual.

## Gerbang desain

Gerbang desain lulus: screenshot tampil, enam lebar layar tidak overflow, kontrol download dan salin hash bekerja, dan console bersih. Snapshot live cocok dengan rilis v0.2.0.

# Product Requirements Document
Proyek: kinglight-download
Status: DRAFT PERENCANAAN
Dibuat: 2026-11-26

## 1. Ringkasan
`kinglight-download` adalah portal statis untuk menampilkan status rilis dan tautan unduhan resmi Kinglight. Portal tidak menyimpan installer dan tidak menjalankan layanan dinamis. Fokus v1 adalah satu halaman yang jujur tentang kondisi rilis, dengan tiga halaman pendukung untuk data lokal, ketentuan, dan penghapusan data lokal.

Belum ada aplikasi, situs, installer, atau rilis yang dapat dijalankan. Semua isi masih usulan.

## 2. Masalah dan pengguna
Sumber rilis Kinglight belum punya tempat publik yang stabil untuk membedakan rilis terverifikasi dari berkas di luar kanal resmi. Portal yang menampilkan angka, tanggal, atau tautan tanpa sumber dapat menyesatkan pembaca.

Pengguna:

- Pemilik rilis, yang menerbitkan metadata setelah aset GitHub Release siap dan tidak ingin mengedit versi di dua tempat.
- Pengunjung, yang membutuhkan status rilis, tautan resmi, informasi ukuran dan hash bila tersedia, serta penjelasan data lokal.

## 3. Tujuan dan kriteria
| Tujuan | Kriteria penerimaan |
|---|---|
| Status jujur | Tanpa rilis terverifikasi, portal menunjukkan `unreleased` tanpa tautan unduhan aktif. |
| Versi tunggal | Nomor versi berasal dari rilis Kinglight, bukan ditulis manual di portal. |
| Aset kekal | Aset rilis tidak ditimpa dan tidak disimpan di Git portal. |
| Halaman pendukung | `/privacy`, `/terms`, `/data-deletion` menjelaskan data lokal dan batas log hosting tanpa klaim kepatuhan. |
| Sinkronisasi jelas | Tiga remote Git diverifikasi dan keterbatasannya dicatat. |

Belum ada target angka performa atau metrik adopsi yang ditetapkan sebelum pengukuran nyata.

## 4. Kebutuhan
### Setelah framework dipilih
- Halaman `/` dengan keadaan `unreleased`, metadata tidak valid, dan `available`.
- Daftar artefak hanya bila status `available`.
- Tautan ke GitHub Release dan catatan rilis bila tersedia.
- Halaman `/privacy`, `/terms`, dan `/data-deletion`.
- Pembaca snapshot statis yang mengikuti kontrak rilis.

### Tidak masuk v1
- Akun, basis data, server aplikasi, analitik, dan AI.
- Backend penghapusan data.
- Installer biner di Git atau portal.
- Demo browser pengirim UDP 6454 mentah dan jembatan lokal.
- Layanan berbayar, integrasi domain baru, dan perubahan proyek lain.
- Pembaruan otomatis dengan protokol khusus.

## 5. Arsitektur
| Lapisan | Keputusan | Alasan |
|---|---|---|
| Hosting | Situs statis, penyedia belum dipilih | Tanpa server aplikasi. |
| Framework | Belum dipilih | Astro statis direkomendasikan bila dokumentasi dan komponen ringan dibutuhkan. HTML, CSS, dan TypeScript lebih sederhana. |
| Sumber rilis | GitHub Release Kinglight | Aset kekal dan terikat commit sumber. |
| Metadata portal | Snapshot statis hasil rilis terverifikasi | Menghindari edit versi manual. |
| Sinkronisasi | Ref Git ke tiga remote | Tidak mencakup aset Release dan halaman deploy. |

Inti desktop Kinglight v1 direncanakan sebagai pratinjau pancaran menyerupai 3D dan keluaran UDP 6454 native. Demo browser bersifat opsional di masa depan dan tidak dapat mengirim UDP mentah dari browser. Jembatan lokal tidak masuk v1.

## 6. Alur
### Rilis tersedia
1. Kinglight menetapkan versi dari satu sumber setelah pemilik menyetujui mekanismenya.
2. Aset diunggah ke GitHub Release dan proses selesai ditunggu.
3. Ukuran, hash, platform, arsitektur, dan commit sumber diukur dari aset yang dipublikasikan.
4. Snapshot dibuat dari rilis terverifikasi.
5. Snapshot masuk commit portal sebagai langkah publish terakhir.
6. Pemeriksaan tautan dijalankan sebelum deploy.

### Tanpa rilis
Snapshot berisi `status: "unreleased"`, `artifacts: []`, portal menampilkan pesan belum ada unduhan aktif, dan tidak ada tautan biner.

## 7. Data dan batasan
Kontrak penuh ada di [docs/RELEASE-CONTRACT.md](docs/RELEASE-CONTRACT.md). Nilai awal: `schemaVersion: 1`, `status: "unreleased"`, dan `artifacts: []`. Saat `available`, field wajib: `version`, `tag`, `sourceCommit`, `publishedAt`, `channel`, `releaseUrl`, `artifacts`. Tiap artefak memuat `platform`, `arch`, `fileName`, `url`, `sizeBytes`, `sha256`. `notesUrl` opsional.

Tidak ada klaim kepatuhan hukum, angka tampilan tanpa sumber, aset visual tanpa instruksi, atau perubahan proyek lain.

## 8. Keputusan tertunda
Framework, persetujuan `DESIGN.md`, lisensi, target deploy, sertifikat penandatanganan, dan otomasi lintas repo menunggu pemilik. Implementasi tidak dimulai sebelum status DRAFT berubah dan framework dipilih.

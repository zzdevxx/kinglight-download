# Roadmap
Status: DRAFT PERENCANAAN.

Detail kontrak ada di [docs/RELEASE-CONTRACT.md](docs/RELEASE-CONTRACT.md). Belum ada fase implementasi yang dimulai.

## P0: Dokumentasi
Tujuan: mengunci ruang lingkapan sebelum kode atau aset dibuat.

Keluaran: sembilan berkas perencanaan dan kontrak `schemaVersion: 1` dengan status awal `unreleased`, tanpa data rilis palsu.

Gate: pemilik menyetujui portal statis tanpa akun, basis data, server, analitik, dan AI; framework dan lisensi dipilih; tidak ada aset visual, logo, installer, atau biner dibuat.

Status: dokumen selesai sebagai DRAFT, gate menunggu pemilik.

## P1: Scaffold portal
Tujuan: membuat situs statis minimal setelah framework dipilih.

Keluaran: struktur proyek sesuai pilihan pemilik, halaman `/` dengan keadaan `unreleased`, metadata tidak valid, dan `available`, serta halaman `/privacy`, `/terms`, `/data-deletion`. Arah visual berasal dari `DESIGN.md` pemilik.

Gate: pilihan framework tercatat, tidak ada tautan ke halaman yang belum ada, tidak ada angka atau klaim tanpa sumber, tidak ada integrasi domain berbayar atau proyek lain, build lokal dijalankan bila scaffold sudah ada.

Status: belum dimulai.

## P2: Uji kontrak rilis
Tujuan: memastikan portal hanya menampilkan data yang sah.

Keluaran: fixture `unreleased` tanpa artefak, fixture `available` dengan berkas uji nyata yang dibuat lokal, pemeriksaan field wajib dan tipe data, penolakan snapshot tidak valid, serta pemeriksaan versi tunggal di tampilan.

Gate: semua fixture lulus, snapshot tidak valid ditolak sebelum publish, tidak ada fetch jaringan untuk merender halaman, tidak ada installer biner di Git.

Status: belum dimulai.

## P3: Rilis nyata dan deploy
Tujuan: menerbitkan rilis Kinglight pertama yang diakui portal.

Keluaran: versi dari satu sumber setelah disetujui, aset GitHub Release kekal, snapshot dari rilis terverifikasi, dan deploy ke target pemilik.

Gate: aset selesai diunggah sebelum snapshot, ukuran dan hash diukur dari aset yang dipublikasikan, pemeriksaan tautan lulus, commit portal menjadi langkah publish terakhir, tidak ada perubahan proyek lain.

Status: belum dimulai.

## P4: Pengerasan rilis
Tujuan: memperkuat rilis tanpa layanan tambahan yang tidak dibutuhkan.

Keluaran yang mungkin: penandatanganan dengan sertifikat nyata, opsi pembaruan native bila Tauri dipilih dengan Minisign, pemeriksaan otomatis kecocokan hash, dan prosedur rotasi bila sertifikat dipakai.

Gate: tidak ada sertifikat palsu, hash contoh sebagai bukti rilis, klaim kepatuhan, protokol Cosign khusus, PKI buatan, atau layanan berbayar. Sinkronisasi tiga remote diverifikasi dengan commit sama. Kegagalan satu remote dihentikan dan dilaporkan tanpa push paksa.

Status: belum dimulai.

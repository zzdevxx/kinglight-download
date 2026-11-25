# Dokumentasi Teknis
Status: DRAFT PERENCANAAN.

## Kondisi
Repositori baru berisi dokumentasi. Belum ada kode situs, konfigurasi build, installer, aset rilis, atau deploy aktif. Tidak ada perintah build yang dapat dijalankan sampai framework dipilih.

Tautan: https://github.com/zzdevxx/kinglight-download dan https://github.com/zzdevxx/kinglight

## Peta berkas
- `README.md`: ringkasan dan status awal.
- `PRD.md`: kebutuhan dan batasan.
- `ERD.md`: model metadata konseptual tanpa basis data.
- `DOCUMENTATION.md`: catatan teknis.
- `ROADMAP.md`: fase dan gate.
- `AGENTS.md`: aturan kerja agen.
- `HANDOFF.md`: serah terima dan keputusan tertunda.
- `DESIGN.md`: arah visual berstatus DRAFT, menunggu persetujuan pemilik.
- `docs/RELEASE-CONTRACT.md`: kontrak snapshot rilis.

## Keputusan teknis
- Portal adalah situs statis tanpa akun, basis data, server aplikasi, analitik, atau AI.
- Framework belum dipilih. Astro statis direkomendasikan bila dokumentasi dan komponen ringan dibutuhkan. HTML, CSS, dan TypeScript adalah alternatif sederhana.
- Tidak ada backend penghapusan data.
- Biner installer tidak masuk Git portal.
- Kinglight memiliki sumber versi dan kontrak rilis. Portal menyimpan snapshot statis dari rilis terverifikasi.
- Lisensi belum dipilih.

## Kontrak rilis
Baca [docs/RELEASE-CONTRACT.md](docs/RELEASE-CONTRACT.md). Ringkasan:

- `schemaVersion: 1`, `status: unreleased` atau `available`.
- Saat `unreleased`, tidak ada tautan unduhan aktif.
- Saat `available`, snapshot memuat versi, tag, commit sumber, waktu terbit, kanal, tautan rilis, dan artefak.
- Tiap artefak memuat platform, arsitektur, nama berkas, URL, ukuran byte, dan SHA-256.
- Versi tidak ditulis manual di HTML, judul halaman, atau teks lainnya.

Hash SHA-256 membuktikan kesesuaian berkas dengan nilai tercatat, bukan identitas penerbit. Penandatanganan kode memerlukan sertifikat nyata bila dipakai. Pembaruan otomatis bukan bagian v1. Bila Tauri dipilih, opsi yang dipertimbangkan adalah plugin native dengan Minisign. Tidak ada protokol Cosign khusus atau PKI buatan yang diwajibkan.

## Publish yang direncanakan
1. Kinglight mengunggah seluruh aset ke GitHub Release.
2. Kinglight memverifikasi unggahan lalu mengukur ukuran dan hash aset yang sudah dipublikasikan.
3. Snapshot dibuat dari rilis terverifikasi.
4. Snapshot masuk commit portal sebagai langkah publish terakhir.
5. Pemeriksaan tautan dijalankan sebelum deploy.

Belum ada konfigurasi lintas repo dengan izin tulis otomatis.

## Sinkronisasi
| Remote | Platform |
|---|---|
| `origin` | GitLab |
| `codeberg` | Codeberg |
| `github` | GitHub |

Sinkronisasi hanya menyamakan ref Git. Aset Release dan halaman deploy tidak ikut tersalin. Setelah commit, jalankan skrip sinkronisasi yang disediakan pemilik, lalu verifikasi commit sama dengan `git ls-remote` di ketiga remote. Push paksa, mirror, reset, dan rewrite riwayat dilarang.

```sh
git remote
git rev-parse HEAD
git ls-remote origin refs/heads/main
git ls-remote codeberg refs/heads/main
git ls-remote github refs/heads/main
```

## Halaman statis
Teks `/privacy`, `/terms`, dan `/data-deletion` harus menyebut bahwa portal tidak membuat akun, tidak menyimpan input di basis data, Kinglight menyimpan konfigurasi lokal di perangkat pengguna bila aplikasi tersedia, penghapusan data lokal dilakukan dari aplikasi atau dengan menghapus folder data sesuai petunjuk resmi, dan hosting dapat menyimpan log akses sesuai kebijakan penyedia. Teks tidak boleh menyatakan kepatuhan regulasi tertentu.

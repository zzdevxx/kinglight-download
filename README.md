# kinglight-download
Status: DRAFT PERENCANAAN.

Portal statis untuk informasi unduhan Kinglight. Belum ada situs, aplikasi, installer, atau aset rilis yang dapat dijalankan. Semua berkas saat ini hanya perencanaan.

Tautan kanonik:

- Portal: https://github.com/zzdevxx/kinglight-download
- Desktop: https://github.com/zzdevxx/kinglight

## Ruang lingkapan
Portal hanya menampilkan metadata rilis terverifikasi. Biner installer tidak disimpan di Git dan tidak disalin ke portal. Aset tetap berada di GitHub Release Kinglight. Saat belum ada rilis terverifikasi, portal menampilkan `unreleased` dan tidak menampilkan tautan unduhan aktif.

## Arah teknis
Stack web belum dipilih. Astro statis direkomendasikan bila dokumentasi dan komponen ringan dibutuhkan. HTML, CSS, dan TypeScript adalah alternatif lebih sederhana. Pemilik memilih sebelum scaffold.

Rute yang direncanakan: `/` untuk status rilis, `/privacy` untuk data lokal dan batas log hosting, `/terms` untuk ketentuan portal dan unduhan, `/data-deletion` untuk penghapusan data lokal di perangkat pengguna.

Tidak ada akun, basis data, server aplikasi, analitik, atau AI. Tidak ada backend penghapusan data. Teks halaman tidak menyatakan kepatuhan terhadap regulasi tertentu.

## Rilis dan sinkronisasi
Kinglight memiliki satu sumber versi dan mengukur ukuran, hash, platform, arsitektur, serta commit sumber. Portal menyimpan snapshot statis dari rilis yang sudah diverifikasi. Hash dipakai untuk integritas, bukan pembuktian identitas penerbit. Pembaruan otomatis belum masuk v1.

Sinkronisasi tiga platform hanya menyamakan ref Git. Aset Release dan halaman deploy tidak ikut tersalin otomatis. Remote: `origin`, `codeberg`, `github`. Push paksa dan rewrite riwayat dilarang.

## Dokumen
- [PRD.md](PRD.md)
- [ERD.md](ERD.md)
- [DOCUMENTATION.md](DOCUMENTATION.md)
- [ROADMAP.md](ROADMAP.md)
- [AGENTS.md](AGENTS.md)
- [HANDOFF.md](HANDOFF.md)
- [docs/RELEASE-CONTRACT.md](docs/RELEASE-CONTRACT.md)
- [DESIGN.md](DESIGN.md) berstatus DRAFT dan menunggu persetujuan pemilik.

Lisensi belum dipilih. Belum ada berkas `LICENSE` yang dibuat.

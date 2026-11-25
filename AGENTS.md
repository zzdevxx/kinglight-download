# AGENTS.md
Status: DRAFT PERENCANAAN.

File ini mengatur agen di repositori `kinglight-download`. Keputusan pemilik lebih tinggi dari dokumen ini.

## Sebelum bekerja
1. Baca `README.md`, `PRD.md`, `ERD.md`, `DOCUMENTATION.md`, `ROADMAP.md`, dan `docs/RELEASE-CONTRACT.md`.
2. Baca `DESIGN.md` bila tersedia. Berkas itu dimiliki pemilik.
3. Periksa status Git dan identifikasi file yang dimiliki agen sebelum mengubah apa pun.
4. Jangan mulai scaffold, kode, aset, commit, atau push tanpa persetujuan pemilik. Pengecualian terbatas adalah pembuatan remote publik dan commit dokumentasi perencanaan yang sudah diotorisasi pemilik pada sesi ini.

## Kepemilikan
Agen mengelola dokumen perencanaan yang tercantum di `README.md`. Pemilik mengelola `DESIGN.md`, `.gitignore`, `.gitattributes`, dan berkas verifikasi. Jangan membuat `LICENSE` dan jangan mengubah proyek lain.

## Aturan isi
- Bahasa Indonesia lugas dan teknis, status DRAFT sampai disetujui pemilik.
- Tanpa em dash, emoji, hype, superlatif tanpa bukti, angka tanpa sumber, dan klaim kepatuhan.
- Jangan membuat logo, favicon, gambar, avatar, kisah pengguna, atau statistik tanpa instruksi pemilik.
- Jangan menautkan halaman yang belum ada.
- Contoh JSON hanya boleh menunjukkan `unreleased`.
- Jangan menyalin path lokal pribadi atau nama mesin ke dokumen publik.

## Batasan produk
Portal statis tanpa akun, basis data, server aplikasi, analitik, atau AI. Tidak ada backend penghapusan data. `/privacy`, `/terms`, `/data-deletion` hanya menjelaskan data lokal dan batas log hosting. Tidak ada installer biner di Git atau portal. Demo browser pengirim UDP 6454 mentah dan jembatan lokal bukan bagian v1.

## Rilis
Kinglight memiliki sumber versi dan kontrak rilis. Portal memakai `schemaVersion: 1` dan `unreleased` sampai ada rilis terverifikasi. Snapshot `available` hanya dibuat dari aset GitHub Release yang lengkap, diukur, dan diverifikasi. Versi tidak ditulis manual lebih dari satu kali. Hash adalah integritas, bukan identitas penerbit. Penandatanganan kode butuh sertifikat nyata. Belum ada izin `repo_write` lintas repo otomatis.

## Sinkronisasi
Remote: `origin` GitLab, `codeberg` Codeberg, `github` GitHub. Sinkronisasi hanya ref Git, bukan aset Release atau halaman deploy. Jalankan skrip sinkronisasi pemilik, lalu verifikasi commit sama di ketiga remote. Push paksa, mirror, reset, dan rewrite dilarang. Jika satu remote gagal, hentikan klaim sukses dan laporkan.

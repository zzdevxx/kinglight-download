# AGENTS.md

Status: panduan implementasi repositori `kinglight-download`. Pembaruan terakhir 2026-11-26.

Keputusan pemilik lebih tinggi dari dokumen ini.

## Sebelum bekerja

1. Baca `README.md`, `DOCUMENTATION.md`, `DESIGN.md`, `HANDOFF.md`, dan `docs/RELEASE-CONTRACT.md` yang tersedia.
2. Periksa status Git dan identifikasi berkas yang berubah sebelum mengubah apa pun.
3. Kerjakan hanya cakupan yang diminta pemilik. Jangan menyentuh proyek desktop, `banklycs`, `zzluxora`, atau repositori lain.
4. Implementasi HTML, CSS, JavaScript, pengujian, dan aset font berlisensi di repo ini diizinkan sesuai instruksi pemilik. Commit, push, sinkronisasi cloud, dan deploy tetap menunggu verifikasi serta keputusan pemilik.

## Kepemilikan

Agen mengelola implementasi portal dan dokumentasi teknis yang tercantum di `README.md`. Pemilik menentukan arah desain, screenshot asli, metadata rilis, dan keputusan publish. `LICENSE` sudah ada dengan lisensi MIT; jangan dibuat ulang atau diganti tanpa instruksi.

## Aturan isi

- Bahasa Indonesia lugas dan teknis.
- Tanpa em dash, emoji, hype, superlatif tanpa bukti, angka tanpa sumber, dan klaim kepatuhan.
- Contoh JSON boleh memakai fixture yang jelas. Jangan menulis versi, ukuran, atau hash rilis nyata secara manual di HTML, CSS, atau JavaScript.
- Screenshot asli disediakan pemilik. Font display disimpan lokal beserta teks lisensinya. Jangan membuat screenshot tiruan atau mengganti lisensi font.
- Jangan menautkan halaman yang belum ada.
- Jangan menyalin path lokal pribadi atau nama mesin ke dokumen publik.

## Batasan produk

Portal statis tanpa akun, basis data, server aplikasi, analitik, atau AI. Tidak ada backend penghapusan data. `/privacy`, `/terms`, dan `/data-deletion` menjelaskan data lokal dan batas log hosting. Tidak ada installer biner di Git atau portal. Art-Net bersifat opsional untuk lampu fisik dan bukan bagian dari alur simulator wajib.

## Rilis

Kinglight memiliki sumber versi dan kontrak rilis. Portal memakai `schemaVersion: 1` dan membaca status `unreleased` atau `available` dari `release.json`. Rilis nyata sudah ada; pemilik akan menerbitkan versi baru dengan installer `.exe` dan arsip `.zip` yang memiliki URL unik. Snapshot `available` hanya dibuat dari aset GitHub Release yang lengkap, diukur, dan diverifikasi. Versi tidak ditulis manual lebih dari satu kali. Hash adalah integritas, bukan identitas penerbit. Penandatanganan kode butuh sertifikat nyata.

## Sinkronisasi

Remote: `origin` GitLab, `codeberg` Codeberg, `github` GitHub. Sinkronisasi hanya ref Git, bukan aset Release atau halaman deploy. Jalankan skrip sinkronisasi pemilik, lalu verifikasi commit sama di ketiga remote. Push paksa, mirror, reset, dan rewrite dilarang. Jika satu remote gagal, hentikan klaim sukses dan laporkan.

# Arah desain kinglight-download

Status: DRAFT PERENCANAAN, 2026-11-26. Arah portal ini menunggu tinjauan pemilik sebelum UI dibuat.

Design Read: portal distribusi desktop untuk operator lighting, memakai bahasa visual panel instrumen dan dokumentasi pemasangan; ENERGY 2 / RHYTHM 2 / MOTION 1.

## Susunan berdasarkan kebutuhan

Portal dibuka dengan identitas teks Kinglight, status ketersediaan yang jujur, dan akses unduhan bila artifact nyata tersedia. Versi, platform, ukuran, tanggal dan hash berasal dari metadata release producer.

Sesudah area unduhan, tampilkan screenshot asli aplikasi jika sudah ada, batas fitur, langkah pemasangan dan pengaturan Art-Net. Catatan rilis serta halaman kebijakan mempunyai tujuan nyata. Tidak diperlukan testimonial, jumlah pengguna, harga, FAQ generik atau feature cards berulang.

Selama belum ada release, tombol unduh aktif tidak ditampilkan. Halaman menjelaskan tahap pengembangan dan menautkan source/rencana yang benar-benar tersedia. Screenshot produk tidak diganti dengan mockup yang menyamar sebagai aplikasi jadi.

## Hubungan visual dengan desktop

| Keputusan | Alasan |
|---|---|
| Charcoal/navy dan satu aksen amber, mengikuti proposal Kinglight | Pengguna mengenali hubungan portal dengan panel tanpa menjadikan halaman web replika konsol |
| Panel informasi rilis berbentuk daftar teknis ringkas | Ukuran, platform dan checksum lebih mudah dibandingkan dalam baris berlabel |
| Sans sistem, angka tabular, monospace hanya pada hash | Informasi instalasi mudah dibaca tanpa font tambahan yang tidak diperlukan |
| Border tegas dan radius kecil | Menjaga karakter instrumen yang sama dengan aplikasi |
| Motion terbatas pada feedback kontrol | Pengunjung perlu memilih installer, bukan menunggu animasi landing page |
| Screenshot beam nyata setelah P1 | Memperlihatkan produk yang benar-benar telah dijalankan |

Warna final dan tema harus diuji pada UI nyata; belum ada klaim kontras atau performa. Theme toggle hanya ditambahkan bila kedua tema disiapkan serta diverifikasi. Logo, ikon, favicon dan gambar promosi belum dibuat; identitas sementara memakai nama produk sebagai teks.

## Kontrol dan kondisi

- Download hanya aktif untuk artifact yang schema, URL, ukuran dan hash-nya valid.
- Checksum dapat disalin dengan feedback sukses/gagal; link release menuju lokasi yang nyata.
- Kondisi belum ada release, metadata sedang dibaca, metadata invalid dan jaringan gagal harus terlihat berbeda.
- Semua kontrol memiliki lima state interaksi, accessible name, fokus keyboard dan target sentuh minimal 44 px.
- Halaman bekerja pada lebar 320 px ke atas tanpa horizontal overflow. Hash panjang dapat wrap atau berada pada area copy yang tidak memaksa viewport melebar.
- Navigasi hanya berisi halaman/section yang telah tersedia. Link privacy, terms, data-deletion benar-benar dibangun sebelum publish.

## Batas browser

Browser biasa tidak mengirim raw Art-Net UDP. Demo web bila kelak dibuat harus menyatakan batas itu. Portal versi awal berfungsi untuk distribusi dan dokumentasi; tidak ada local bridge atau kendali aplikasi desktop dari halaman web.

## Gerbang desain

Saat implementasi: uji reflow, keyboard, kontras, loading/error, link installer dan checksum terhadap artifact nyata. Catat hasil klik tiap kontrol, console error dan ukuran media yang sebenarnya. Pada tahap dokumen, hanya sumber arah dan alasan desain yang dapat ditinjau.

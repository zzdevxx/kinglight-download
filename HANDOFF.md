# HANDOFF

Status: portal v0.2.0 live di GitHub Pages. Commit portal dan source tersinkron ke tiga remote. Verifikasi live memastikan metadata, screenshot, dan aset unduhan cocok.

## Yang sudah dikerjakan

- `index.html`: hero editorial asimetris, nama produk dengan tracking `-0.04em`, screenshot asli, status rilis, hero CTA dari snapshot tervalidasi, alur kerja tiga langkah, persyaratan, sumber, dan footer hukum.
- `site.css`: palet kertas putih dingin, tinta hitam, aksen vermilion, Barlow Condensed Bold self-hosted, bingkai screenshot tajam dengan bayangan lembut, kontrol 44 px dan 48 px, focus ring, active `scale(0.98)`, disabled `0.5`, `[hidden]` global, reduced motion, dan reflow 320 px sampai 1920 px.
- `site.js`: validator kontrak tidak dilemahkan, pemilih artefak `.exe` dan `.zip`, hero "Unduh untuk Windows" serta "Versi portable", render `loading`, `available`, `unreleased`, `invalid`, dan `error`, copy SHA-256 dengan status sukses dan gagal, serta fallback screenshot yang jujur.
- `privacy.html`, `terms.html`, `data-deletion.html`: chroma yang sama, header yang cocok, dan suffix tab baru hanya untuk pembaca layar.
- `favicon.svg`: tanda tipografi KL memakai palet baru.
- `assets/fonts/`: `BarlowCondensed-Bold.ttf`, `OFL.txt`, dan `SOURCE.md` dari repositori Google Fonts.
- Tautan CSS dan JavaScript memakai `?design=remake` sebagai cache key stabil tanpa nomor versi manual.
- `tests/release-contract.test.js`: 27 pengujian lulus, termasuk uji kontrak lama tanpa pelemahan, state gambar, hero CTA, font, dan suffix aksesibel.
- `assets/simulator.webp`: screenshot 1440x810 dari executable portable v0.2.0 yang benar-benar dijalankan.
- `DESIGN.md`, `README.md`, `DOCUMENTATION.md`, `docs/RELEASE-CONTRACT.md`: status implementasi dan keputusan desain diperbarui.
- `.needmcp/state.json`: style `blueprint-technical`, `dna: null`, sesuai arahan sesi induk. Panduan komponen dipakai, tetapi warna dan komposisi mengikuti brief pemilik.

## Hasil publish

1. `node --test`: 27 lulus, 0 gagal.
2. `verify-portal.mjs`: 9 pemeriksaan live lulus, termasuk ukuran dan SHA-256 dua aset.
3. HEAD kedua repo sama di GitLab, Codeberg, dan GitHub; tag `v0.2.0` menunjuk commit build.
4. GitHub Pages menampilkan v0.2.0 dengan screenshot asli, installer dan portable ZIP.

Catatan: installer NSIS belum dipasang karena instalasi uji v0.1.0 harus tetap dipertahankan.

## Kebutuhan yang sudah dicatat

- Windows x64 sesuai artefak rilis.
- Microsoft Edge WebView2 Runtime tersedia pada perangkat.
- Jaringan opsional. Art-Net dipakai hanya bila ingin mengirim ke lampu fisik.
- Tidak ada akun, basis data, server aplikasi, analitik, AI, atau backend penghapusan data.

## Verifikasi lokal

- `node --test`: 27 lulus, 0 gagal.
- Render browser pada 320, 375, 768, 1024, 1440, dan 1920 px: tidak ada overflow horizontal, kontrol terkecil 44 px.
- Screenshot aktual 1440x810: `naturalWidth` 1440, gambar `display: block`, fallback `display: none`.
- State gambar gagal: gambar `display: none`, fallback `display: flex`. Hanya satu visual tampil.
- Fixture dua artefak: hero menampilkan "Unduh untuk Windows" dari `.exe` dan "Versi portable" dari `.zip`.
- Font Barlow Condensed terbaca terpakai di browser lokal. Console error 0.

## Bukti browser

Browser lokal dan live diuji pada 320, 375, 768, 1024, 1440, dan 1920 px. Tidak ada horizontal overflow. Screenshot 1440x810 dimuat, kedua CTA menuju aset rilis v0.2.0, rincian dapat dibuka dan ditutup, tombol SHA-256 memberi umpan balik sukses, dan console tidak mencatat error.

## Batas tetap

Sesi induk mengubah hanya repo `kinglight` dan `kinglight-download`. Tidak ada perubahan pada `banklycs`, `banklycs-download`, `zzluxora-download`, atau repo referensi. Tidak ada installer biner di Git, screenshot tiruan, video, logo baru, angka rilis buatan, atau perubahan lisensi font.

Tautan: https://github.com/zzdevxx/kinglight-download dan https://github.com/zzdevxx/kinglight

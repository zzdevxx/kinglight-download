# Kontrak Rilis kinglight-download
Status: aktif. Kontrak ini dipakai oleh rilis `v0.1.0` dan pembaruan portal berikutnya.

Dokumen ini menetapkan cara `kinglight-download` membaca informasi rilis dari `kinglight`. Rilis v0.2.0 dan snapshot portal live telah diverifikasi terhadap kedua aset yang diunduh ulang.

Tautan: https://github.com/zzdevxx/kinglight dan https://github.com/zzdevxx/kinglight-download

## 1. Prinsip
1. Kinglight memiliki satu sumber versi dan saat diimplementasikan membuat `docs/contracts/release.json` dengan skema yang sama seperti snapshot portal. Rencana sisi producer saat ini tercatat di bagian Rilis dan sinkronisasi pada `https://github.com/zzdevxx/kinglight/blob/main/DOCUMENTATION.md`.
2. Portal memakai skema yang sama dan hanya menyimpan snapshot metadata statis.
3. Snapshot dibuat dari rilis yang sudah diterbitkan dan diverifikasi, bukan dari rencana build.
4. Aset biner berada di GitHub Release Kinglight. Tidak ada installer di Git portal atau halaman portal.
5. Versi tidak ditulis manual di lebih dari satu tempat. Portal bukan sumber versi.
6. Snapshot `unreleased` adalah kondisi awal tanpa tautan unduhan aktif.

## 2. Snapshot
Contoh yang boleh dipakai pada tahap perencanaan:

```json
{
  "schemaVersion": 1,
  "status": "unreleased",
  "artifacts": []
}
```

Tidak ada contoh versi, tanggal, hash, atau ukuran yang menyerupai rilis nyata.

## 3. Field
| Field | Jenis | Wajib | Keterangan |
|---|---|---|---|
| `schemaVersion` | integer | ya | Nilai saat ini `1`. |
| `status` | string | ya | `unreleased` atau `available`. |
| `version` | string | bila `available` | Berasal dari sumber versi Kinglight. |
| `tag` | string | bila `available` | Tag GitHub untuk versi tersebut. |
| `sourceCommit` | string | bila `available` | Commit sumber penuh yang dipakai build. |
| `publishedAt` | string | bila `available` | Waktu terbit dari GitHub Release. |
| `channel` | string | bila `available` | Kanal yang ditetapkan saat rilis dibuat. |
| `releaseUrl` | string | bila `available` | Tautan kanonik ke GitHub Release. |
| `notesUrl` | string | tidak | Tautan catatan rilis bila tersedia. |
| `artifacts` | array | ya | Kosong saat `unreleased`, isi saat `available`. |

Tiap artefak:

| Field | Jenis | Keterangan |
|---|---|---|
| `platform` | string | Sistem operasi target. |
| `arch` | string | Arsitektur target. |
| `fileName` | string | Nama berkas aset di GitHub Release. |
| `url` | string | Tautan langsung ke aset. |
| `sizeBytes` | integer | Ukuran hasil pengukuran. |
| `sha256` | string | Hash SHA-256 hasil pengukuran. |

## 4. Aturan status
`unreleased`:

- `artifacts` kosong dan tidak ada field rilis wajib.
- Halaman utama menyatakan belum ada unduhan aktif.
- Tidak ada tautan biner ditampilkan.

`available`:

- Semua field wajib hadir dan tidak kosong.
- `artifacts` berisi minimal satu entri.
- `sha256` dan `sizeBytes` berasal dari berkas yang sudah diunggah.
- `sourceCommit` ditulis lengkap.
- `releaseUrl` mengarah ke GitHub Release Kinglight.
- Versi tampil dari snapshot, bukan teks HTML yang ditulis manual.

## 5. Urutan publish
1. Kinglight menetapkan versi dari satu sumber setelah pemilik menyetujui mekanisme versi.
2. Kinglight membangun dari commit sumber yang tercatat.
3. Kinglight mengunggah seluruh aset ke GitHub Release dan menunggu proses selesai.
4. Kinglight memverifikasi akses aset lalu mengukur ukuran, hash, platform, arsitektur, dan commit sumber.
5. Snapshot dibuat hanya dari rilis yang sudah diverifikasi.
6. Snapshot masuk commit portal sebagai langkah publish terakhir.
7. Pemeriksaan tautan dijalankan sebelum deploy atau pengumuman.
8. Deploy dijalankan setelah commit portal terverifikasi.

Urutan tidak boleh dibalik. Setiap rilis baru memakai tag dan URL aset yang unik.

## 6. Integritas dan keaslian
- SHA-256 mendeteksi perubahan berkas, bukan membuktikan penerbit.
- Portal menyajikan hash sebagai informasi integritas, bukan klaim keaslian.
- Penandatanganan kode, bila dipakai, harus memakai sertifikat nyata dari pemilik.
- Tidak ada sertifikat palsu, kunci tiruan, atau tanda tangan contoh sebagai bukti rilis.
- Pembaruan otomatis bukan bagian v1.
- Bila Tauri dipilih, opsi yang dipertimbangkan adalah plugin pembaruan native dengan Minisign.
- Tidak ada protokol Cosign khusus, updater mandiri, atau PKI buatan yang diwajibkan.

## 7. Aset
- Installer dan arsip biner tidak masuk Git Kinglight atau Git portal.
- Aset rilis kekal. Nama yang sudah dipakai tidak ditimpa.
- Revisi memakai versi atau tag baru.
- Portal hanya menyimpan metadata teks dan halaman statis.
- Tidak ada layanan berbayar yang diprovision.

## 8. Sinkronisasi
| Remote | Platform |
|---|---|
| `origin` | GitLab |
| `codeberg` | Codeberg |
| `github` | GitHub |

Yang tersinkron hanya commit dan ref Git portal. Yang tidak tersinkron otomatis: aset GitHub Release Kinglight, halaman statis yang di-deploy, dan konfigurasi hosting.

Setelah commit publish, jalankan skrip sinkronisasi pemilik. Verifikasi commit sama dengan `git ls-remote` pada ketiga remote. Jika satu gagal, hentikan klaim publikasi lengkap dan laporkan. Push paksa, mirror, reset, dan rewrite riwayat dilarang.

## 9. Pemeriksaan publish
- [x] Snapshot sesuai `schemaVersion: 1`.
- [x] Status `unreleased` atau `available`.
- [x] Snapshot `unreleased` tidak memiliki artefak.
- [x] Field `available` hadir dan tidak kosong.
- [x] URL aset dan `releaseUrl` dapat diakses.
- [x] Hash dan ukuran berasal dari aset yang sudah diunggah.
- [x] Versi tidak ditulis manual di komponen tampilan.
- [x] Tidak ada installer biner di Git portal.
- [x] Tidak ada klaim kepatuhan atau sertifikasi.
- [x] Commit portal menjadi langkah publish terakhir sebelum deploy.

## 10. Status
Kontrak diterapkan oleh pembaca snapshot portal, producer metadata Kinglight, dan pengujian `node:test`. Snapshot v0.2.0 live dan terverifikasi; kedua aset cocok ukuran serta SHA-256. Commit portal tersinkron di tiga remote dan menjadi sumber deploy GitHub Pages.

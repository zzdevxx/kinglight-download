# Entity Relationship Diagram
Status: DRAFT PERENCANAAN.

Ini model konseptual. Tidak ada basis data, tabel SQL, migrasi, atau baris data yang dibuat repositori ini. Metadata portal berupa berkas statis.

## Entitas
### Release
Sumber kebenaran adalah GitHub Release Kinglight.

| Atribut | Keterangan |
|---|---|
| `version` | Berasal dari satu sumber versi Kinglight. |
| `tag` | Tag GitHub untuk versi tersebut. |
| `sourceCommit` | Commit sumber penuh yang dipakai build. |
| `publishedAt` | Waktu terbit dari sumber resmi. |
| `channel` | Kanal yang ditetapkan saat rilis dibuat. |
| `releaseUrl` | Tautan kanonik ke GitHub Release. |
| `notesUrl` | Opsional, tautan catatan rilis. |

### Artifact
Berkas biner di GitHub Release Kinglight, bukan berkas portal.

| Atribut | Keterangan |
|---|---|
| `platform` | Sistem operasi target. |
| `arch` | Arsitektur target. |
| `fileName` | Nama berkas aset. |
| `url` | Tautan langsung ke aset. |
| `sizeBytes` | Ukuran hasil pengukuran. |
| `sha256` | Hash SHA-256 hasil pengukuran. |

### Snapshot
Salinan metadata statis yang dipakai portal, dibuat hanya dari rilis terverifikasi.

| Atribut | Keterangan |
|---|---|
| `schemaVersion` | Versi kontrak, nilai awal `1`. |
| `status` | `unreleased` atau `available`. |
| `release` | Hadir hanya bila `available`. |
| `artifacts` | Kosong saat `unreleased`. |

### Page
| Halaman | Tujuan |
|---|---|
| `/` | Status dan tautan bila tersedia. |
| `/privacy` | Data lokal dan batas log hosting. |
| `/terms` | Ketentuan portal dan unduhan. |
| `/data-deletion` | Penghapusan data lokal di perangkat pengguna. |

## Relasi
```text
Kinglight release 1 --- 1 snapshot portal
snapshot portal    1 --- 0..n artifact
snapshot portal    1 --- 1 halaman utama
halaman utama      1 --- 3 halaman pendukung
```

## Invariant
- Snapshot `unreleased` tidak memiliki artefak atau tautan unduhan aktif.
- Snapshot `available` memuat semua field wajib Release.
- `sha256` dan `sizeBytes` berasal dari aset yang sudah diunggah.
- Versi tidak ditulis manual di komponen tampilan.
- Tidak ada relasi ke akun, sesi, basis data, analitik, atau backend penghapusan data.

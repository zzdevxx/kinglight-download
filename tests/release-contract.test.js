import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  SCHEMA_VERSION,
  STATUS_UNRELEASED,
  STATUS_AVAILABLE,
  initPortal,
  initScreenshot,
  validateReleaseSnapshot,
  validateArtifact,
  parseOfficialUrl,
  isOfficialAssetUrl,
  isOfficialReleaseUrl,
  isOfficialNotesUrl,
  isFullCommitSha,
  isSha256,
  isIsoTimestamp,
  formatBytes,
  shortCommit,
  formatPublishedAt,
  selectDownloadArtifacts
} from '../site.js';

const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
const PAGES = ['../index.html', '../privacy.html', '../terms.html', '../data-deletion.html'];

// Nilai di bawah hanya dipakai di dalam pengujian dan tidak pernah dikirim ke portal.
const TEST_COMMIT = 'abcdef0123456789abcdef0123456789abcdef01';
const TEST_HASH = 'b'.repeat(64);
const TEST_RELEASE_URL = 'https://github.com/zzdevxx/kinglight/releases/tag/test-only';
const TEST_ASSET_URL = 'https://github.com/zzdevxx/kinglight/releases/download/test-only/fixture.bin';

const TEST_ARTIFACT = {
  platform: 'test',
  arch: 'test',
  fileName: 'fixture.bin',
  url: TEST_ASSET_URL,
  sizeBytes: 2048,
  sha256: TEST_HASH
};

const TEST_INSTALLER = {
  platform: 'windows',
  arch: 'x64',
  fileName: 'Kinglight_setup.exe',
  url: 'https://github.com/zzdevxx/kinglight/releases/download/test-only/Kinglight_setup.exe',
  sizeBytes: 4096,
  sha256: 'c'.repeat(64)
};

const TEST_PORTABLE = {
  platform: 'windows',
  arch: 'x64',
  fileName: 'Kinglight_portable.zip',
  url: 'https://github.com/zzdevxx/kinglight/releases/download/test-only/Kinglight_portable.zip',
  sizeBytes: 8192,
  sha256: 'd'.repeat(64)
};

function availableFixture(overrides = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    status: STATUS_AVAILABLE,
    version: 'test-only',
    tag: 'test-only',
    sourceCommit: TEST_COMMIT,
    publishedAt: '1970-01-01T00:00:00Z',
    channel: 'test-only',
    releaseUrl: TEST_RELEASE_URL,
    artifacts: [{ ...TEST_ARTIFACT }],
    ...overrides
  };
}

function withoutField(object, field) {
  const copy = { ...object };
  delete copy[field];
  return copy;
}

function screenshotRoot({ complete = false, naturalWidth = 0 } = {}) {
  const listeners = new Map();
  const image = {
    hidden: true,
    complete,
    naturalWidth,
    addEventListener(type, handler) {
      listeners.set(type, handler);
    }
  };
  const fallback = { hidden: false };
  const root = {
    querySelector(selector) {
      if (selector === '#simulator-screenshot') return image;
      if (selector === '#simulator-fallback') return fallback;
      return null;
    }
  };
  return {
    image,
    fallback,
    root,
    fire(type) {
      const handler = listeners.get(type);
      assert.equal(typeof handler, 'function', `tidak ada penangan ${type}`);
      handler();
    }
  };
}

function section(html, id, nextId) {
  const start = html.indexOf(`id="${id}"`);
  const end = html.indexOf(`id="${nextId}"`);
  assert.ok(start >= 0 && end > start);
  return html.slice(start, end);
}

test('release.json adalah snapshot yang valid menurut kontrak', () => {
  const parsed = JSON.parse(read('../release.json'));
  const result = validateReleaseSnapshot(parsed);
  assert.equal(result.ok, true, result.error?.message);
  assert.equal(parsed.schemaVersion, SCHEMA_VERSION);
  assert.ok(parsed.status === STATUS_UNRELEASED || parsed.status === STATUS_AVAILABLE);
  assert.ok(Array.isArray(parsed.artifacts));
  if (parsed.status === STATUS_AVAILABLE) {
    assert.ok(parsed.artifacts.length > 0);
    assert.ok(isSha256(parsed.artifacts[0].sha256));
  }
});

test('.nojekyll hadir dan kosong', () => {
  assert.equal(read('../.nojekyll'), '');
});

test('site.js dapat diimpor di Node tanpa DOM', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  assert.equal(typeof initPortal, 'function');
});

test('beranda memuat region status dan pembaca snapshot', () => {
  const html = read('../index.html');
  assert.match(html, /id="release"/);
  assert.match(html, /id="release-content"/);
  assert.match(html, /href="\.\/site\.css\?design=remake"/);
  assert.match(html, /<script type="module" src="\.\/site\.js\?design=remake"><\/script>/);
  assert.match(read('../site.js'), /fetch\('\.\/release\.json'/);
});

test('tidak ada versi rilis, hash rilis, atau em dash pada berkas situs', () => {
  const files = ['../index.html', '../privacy.html', '../terms.html', '../data-deletion.html', '../site.css', '../site.js', '../favicon.svg'];
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /\bv?\d+\.\d+\.\d+\b/, file);
    assert.doesNotMatch(source, /[0-9a-f]{64}/i, file);
    assert.doesNotMatch(source, /\u2014/, file);
  }
});

test('semua tautan internal antarhalaman menuju berkas yang ada', () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.match(html, /href="\.\/site\.css\?design=remake"/, page);
    const targets = [...html.matchAll(/href="(\.\/[^"#]+\.html)"/g)].map((match) => match[1]);
    assert.ok(targets.length >= 3, `terlalu sedikit tautan internal pada ${page}`);
    for (const target of targets) {
      const resolved = fileURLToPath(new URL(target, new URL(page, import.meta.url)));
      assert.doesNotThrow(() => readFileSync(resolved), `${page} menuju ${target}`);
    }
  }
});

test('snapshot awal diterima sebagai unreleased tanpa field rilis', () => {
  const result = validateReleaseSnapshot({
    schemaVersion: 1,
    status: 'unreleased',
    artifacts: []
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.release, {
    schemaVersion: 1,
    status: 'unreleased',
    artifacts: []
  });
});

test('unreleased ditolak bila membawa artefak atau field rilis', () => {
  const withArtifact = validateReleaseSnapshot({
    schemaVersion: 1,
    status: 'unreleased',
    artifacts: [{ ...TEST_ARTIFACT }]
  });
  assert.equal(withArtifact.ok, false);
  assert.equal(withArtifact.code, 'unreleased.artifacts');

  const withVersion = validateReleaseSnapshot({
    schemaVersion: 1,
    status: 'unreleased',
    artifacts: [],
    version: 'test-only'
  });
  assert.equal(withVersion.ok, false);
  assert.equal(withVersion.code, 'unreleased.fields');
});

test('bentuk dasar snapshot divalidasi', () => {
  assert.equal(validateReleaseSnapshot(null).code, 'root');
  assert.equal(validateReleaseSnapshot([]).code, 'root');
  assert.equal(validateReleaseSnapshot(withoutField(availableFixture(), 'artifacts')).code, 'artifacts');
  assert.equal(validateReleaseSnapshot({ schemaVersion: 2, status: 'unreleased', artifacts: [] }).code, 'schemaVersion');
  assert.equal(validateReleaseSnapshot({ schemaVersion: 1, status: 'draft', artifacts: [] }).code, 'status');
  assert.equal(validateReleaseSnapshot({ schemaVersion: 1, status: 'unreleased' }).code, 'artifacts');
});

test('fixture available lengkap diterima dan dinormalisasi', () => {
  const result = validateReleaseSnapshot(availableFixture());
  assert.equal(result.ok, true);
  assert.equal(result.release.status, STATUS_AVAILABLE);
  assert.equal(result.release.version, 'test-only');
  assert.equal(result.release.sourceCommit, TEST_COMMIT);
  assert.equal(result.release.notesUrl, null);
  assert.equal(result.release.artifacts[0].sha256, TEST_HASH);
  assert.equal(result.release.artifacts[0].sizeBytes, 2048);
});

test('status available memerlukan setiap field wajib', () => {
  const required = ['version', 'tag', 'sourceCommit', 'publishedAt', 'channel', 'releaseUrl'];
  for (const field of required) {
    const result = validateReleaseSnapshot(withoutField(availableFixture(), field));
    assert.equal(result.ok, false, `${field} seharusnya ditolak`);
    assert.equal(result.code, field);
  }

  for (const field of required) {
    const result = validateReleaseSnapshot(availableFixture({ [field]: '   ' }));
    assert.equal(result.ok, false, `${field} kosong seharusnya ditolak`);
    assert.equal(result.code, field);
  }

  const noArtifact = validateReleaseSnapshot(availableFixture({ artifacts: [] }));
  assert.equal(noArtifact.code, 'artifacts');
});

test('commit, waktu, dan hash divalidasi menurut kontrak', () => {
  assert.equal(isFullCommitSha(TEST_COMMIT), true);
  assert.equal(isFullCommitSha('abcdef0'), false);
  assert.equal(isFullCommitSha('z'.repeat(40)), false);
  assert.equal(isSha256(TEST_HASH), true);
  assert.equal(isSha256('c'.repeat(63)), false);
  assert.equal(isIsoTimestamp('1970-01-01T00:00:00Z'), true);
  assert.equal(isIsoTimestamp('kemarin'), false);
  assert.equal(isIsoTimestamp('1970-01-01'), false);

  const badCommit = validateReleaseSnapshot(availableFixture({ sourceCommit: 'abc123' }));
  assert.equal(badCommit.code, 'sourceCommit');
  const badDate = validateReleaseSnapshot(availableFixture({ publishedAt: 'bukan waktu' }));
  assert.equal(badDate.code, 'publishedAt');
});

test('URL rilis dan catatan ditolak bila host atau path tidak resmi', () => {
  const rejected = [
    'http://github.com/zzdevxx/kinglight/releases/tag/test-only',
    'https://evil.example/zzdevxx/kinglight/releases/tag/test-only',
    'https://github.com.evil.example/zzdevxx/kinglight/releases/tag/test-only',
    'https://user@github.com/zzdevxx/kinglight/releases/tag/test-only',
    'https://github.com:443/zzdevxx/kinglight/releases/tag/test-only',
    'https://github.com/other/owner/releases/tag/test-only',
    'https://github.com/zzdevxx/kinglight/tree/main',
    'https://github.com/zzdevxx/kinglight/releases/tag/..%2F..'
  ];

  for (const url of rejected) {
    assert.equal(isOfficialReleaseUrl(url), false, url);
    assert.equal(parseOfficialUrl(url), null, url);
    const result = validateReleaseSnapshot(availableFixture({ releaseUrl: url }));
    assert.equal(result.ok, false, url);
    assert.equal(result.code, 'releaseUrl', url);
  }

  assert.equal(isOfficialReleaseUrl(TEST_RELEASE_URL), true);
  assert.equal(isOfficialNotesUrl(TEST_RELEASE_URL), true);
  assert.equal(isOfficialNotesUrl('https://evil.example/notes'), false);

  const badNotes = validateReleaseSnapshot(availableFixture({ notesUrl: 'https://evil.example/notes' }));
  assert.equal(badNotes.code, 'notesUrl');
  assert.equal(validateReleaseSnapshot(availableFixture({ notesUrl: TEST_RELEASE_URL })).ok, true);
});

test('URL artefak ditolak bila bukan aset GitHub Release Kinglight', () => {
  const rejected = [
    'http://github.com/zzdevxx/kinglight/releases/download/test-only/fixture.bin',
    'https://evil.example/zzdevxx/kinglight/releases/download/test-only/fixture.bin',
    'https://github.com.evil.example/zzdevxx/kinglight/releases/download/test-only/fixture.bin',
    'https://user@github.com/zzdevxx/kinglight/releases/download/test-only/fixture.bin',
    'https://github.com:8080/zzdevxx/kinglight/releases/download/test-only/fixture.bin',
    'https://github.com/zzdevxx/kinglight/releases/tag/test-only',
    'https://github.com/zzdevxx/kinglight/releases/download/test-only',
    'https://github.com/zzdevxx/kinglight/releases/download/test-only/../../fixture.bin',
    'https://github.com/other/owner/releases/download/test-only/fixture.bin'
  ];

  for (const url of rejected) {
    assert.equal(isOfficialAssetUrl(url), false, url);
    const result = validateArtifact({ ...TEST_ARTIFACT, url }, 0);
    assert.equal(result.ok, false, url);
    assert.equal(result.code, 'artifacts[0].url', url);
  }

  assert.equal(isOfficialAssetUrl(TEST_ASSET_URL), true);
  const result = validateReleaseSnapshot(
    availableFixture({
      artifacts: [{ ...TEST_ARTIFACT, url: 'https://evil.example/fixture.bin' }]
    })
  );
  assert.equal(result.code, 'artifacts[0].url');
});

test('field artefak wajib bertipe dan berukuran sesuai kontrak', () => {
  const cases = [
    [null, 'artifacts[0]'],
    [{ ...TEST_ARTIFACT, platform: '' }, 'artifacts[0].platform'],
    [{ ...TEST_ARTIFACT, arch: undefined }, 'artifacts[0].arch'],
    [{ ...TEST_ARTIFACT, fileName: 12 }, 'artifacts[0].fileName'],
    [{ ...TEST_ARTIFACT, sizeBytes: -1 }, 'artifacts[0].sizeBytes'],
    [{ ...TEST_ARTIFACT, sizeBytes: 1.5 }, 'artifacts[0].sizeBytes'],
    [{ ...TEST_ARTIFACT, sizeBytes: '2048' }, 'artifacts[0].sizeBytes'],
    [{ ...TEST_ARTIFACT, sha256: 'abc' }, 'artifacts[0].sha256']
  ];

  for (const [artifact, code] of cases) {
    const result = validateArtifact(artifact, 0);
    assert.equal(result.ok, false, code);
    assert.equal(result.code, code);
    assert.ok(result.reason.length > 0);
  }

  const duplicate = validateReleaseSnapshot({
    ...availableFixture(),
    artifacts: [{ ...TEST_ARTIFACT }, { ...TEST_ARTIFACT, fileName: 'other.bin' }]
  });
  assert.equal(duplicate.code, 'artifacts[1].url');
});

test('pembantu format menghasilkan teks yang stabil', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1023), '1023 B');
  assert.equal(formatBytes(1024), '1,0 KB');
  assert.equal(formatBytes(1536), '1,5 KB');
  assert.equal(formatBytes(1048576), '1,0 MB');
  assert.equal(formatBytes(-1), '');
  assert.equal(shortCommit(TEST_COMMIT), 'abcdef0');
  assert.equal(formatPublishedAt('1970-01-01T00:00:00Z'), '1970-01-01 00:00 UTC');
  assert.equal(formatPublishedAt('tidak valid'), '');
});

test('pemilih unduhan memprioritaskan installer dan mengenali berkas portable', () => {
  const both = selectDownloadArtifacts([TEST_PORTABLE, TEST_INSTALLER]);
  assert.equal(both.installer.fileName, TEST_INSTALLER.fileName);
  assert.equal(both.portable.fileName, TEST_PORTABLE.fileName);
  assert.equal(both.primary.fileName, TEST_INSTALLER.fileName);

  const portableOnly = selectDownloadArtifacts([TEST_PORTABLE]);
  assert.equal(portableOnly.installer, null);
  assert.equal(portableOnly.portable.fileName, TEST_PORTABLE.fileName);
  assert.equal(portableOnly.primary.fileName, TEST_PORTABLE.fileName);

  assert.equal(selectDownloadArtifacts([]).primary, null);
  assert.equal(selectDownloadArtifacts(null).primary, null);
});

test('beranda memakai screenshot asli, hidden global, dan fallback yang jujur', () => {
  const html = read('../index.html');
  const imgTag = html.match(/<img[\s\S]*?id="simulator-screenshot"[\s\S]*?>/)?.[0] ?? '';
  assert.match(imgTag, /src="\.\/assets\/simulator\.webp"/);
  assert.match(imgTag, /\bhidden\b/);
  assert.match(html, /id="simulator-fallback"/);
  assert.match(html, /Pratinjau belum dapat ditampilkan\. Coba muat ulang halaman\./);
  assert.doesNotMatch(html, /Letakkan berkas|sebelum halaman dipublikasikan/);
  assert.doesNotMatch(html, /onerror\s*=/i);
  assert.match(read('../site.css'), /\[hidden\]\s*\{\s*display:\s*none\s*!important;?\s*\}/);
  assert.match(read('../site.js'), /initScreenshot/);
});

test('state gambar sukses dan gagal hanya menampilkan satu visual', () => {
  const pending = screenshotRoot();
  initScreenshot(pending.root);
  assert.equal(pending.image.hidden, true);
  assert.equal(pending.fallback.hidden, false);
  pending.fire('error');
  assert.equal(pending.image.hidden, true);
  assert.equal(pending.fallback.hidden, false);
  pending.fire('load');
  assert.equal(pending.image.hidden, false);
  assert.equal(pending.fallback.hidden, true);

  const ready = screenshotRoot({ complete: true, naturalWidth: 1280 });
  initScreenshot(ready.root);
  assert.equal(ready.image.hidden, false);
  assert.equal(ready.fallback.hidden, true);

  const broken = screenshotRoot({ complete: true, naturalWidth: 0 });
  initScreenshot(broken.root);
  assert.equal(broken.image.hidden, true);
  assert.equal(broken.fallback.hidden, false);
});

test('hero memakai unduhan tervalidasi dan tidak memasang tautan biner sebelum tersedia', () => {
  const html = read('../index.html');
  const heroActions = html.match(/<div id="hero-actions"[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.match(heroActions, /href="#download"/);
  assert.doesNotMatch(heroActions, /href="https:\/\//);
  assert.doesNotMatch(heroActions, /Pilih installer/);

  const js = read('../site.js');
  assert.match(js, /renderHeroActions/);
  assert.match(js, /'Unduh untuk Windows'/);
  assert.match(js, /'Versi portable'/);
  assert.match(js, /selection\.installer === selection\.primary/);
  assert.match(js, /primary\.url/);
});

test('copy beranda fokus pada produk dan alur simulator yang sebenarnya', () => {
  const html = read('../index.html');
  assert.match(html, /Latih show lighting lewat konsol virtual\. Lihat gerakan beam sebelum mengirim Art-Net\./);
  assert.match(html, /Jalankan installer, atau ekstrak versi portable lalu buka <code>Kinglight\.exe<\/code>\./);
  assert.match(html, /Buka unit konsol penuh, pilih Shape, lalu tekan Play Shape\./);
  assert.match(html, /Atur size, speed, dan spread\. Art-Net opsional untuk lampu fisik\./);

  const walkthrough = section(html, 'walkthrough', 'requirements');
  assert.doesNotMatch(walkthrough, /Get-FileHash|UDP 6454|release\.json|site\.js|snapshot|basis data/i);
  const requirements = section(html, 'requirements', 'sources-title');
  assert.match(requirements, /Microsoft Edge WebView2 Runtime/);
  assert.match(requirements, /Art-Net opsional untuk lampu fisik/);
  assert.doesNotMatch(requirements, /UDP 6454|basis data|snapshot|release\.json/i);
});

test('pemeriksaan checksum hanya berada di rincian rilis', () => {
  const walkthrough = section(read('../index.html'), 'walkthrough', 'requirements');
  assert.doesNotMatch(walkthrough, /Get-FileHash/);
  assert.match(read('../site.js'), /Get-FileHash nama-berkas -Algorithm SHA256/);
});

test('rincian rilis dan hash berada di dalam details yang tertutup', () => {
  const html = read('../index.html');
  assert.match(html, /id="release-content"/);
  assert.doesNotMatch(html, /<details[^>]*open/i);
  const js = read('../site.js');
  assert.match(js, /element\('details', 'details'\)/);
  assert.match(js, /Rincian rilis dan SHA-256/);
  assert.match(js, /Salin SHA-256/);
});

test('bingkai screenshot tidak memakai perangkat keras tiruan', () => {
  const html = read('../index.html');
  const css = read('../site.css');
  assert.match(html, /class="screenshot-frame"/);
  assert.doesNotMatch(html, /console-frame|console-rail|rail-tick|KINGLIGHT \/ SIMULATOR|rail-unit/i);
  assert.match(css, /\.screenshot-frame\s*\{/);
  assert.doesNotMatch(css, /console-frame|rail-tick|box-shadow:\s*8px 8px 0/i);
});

test('font display self-hosted memakai lisensi yang disertakan', () => {
  const css = read('../site.css');
  assert.match(css, /@font-face/);
  assert.match(css, /font-family:\s*"Barlow Condensed"/);
  assert.match(css, /BarlowCondensed-Bold\.ttf/);
  assert.match(css, /letter-spacing:\s*-0\.04em/);
  assert.doesNotMatch(css, /Bahnschrift|DIN Alternate|letter-spacing:\s*-0\.05em/);
  assert.ok(existsSync(fileURLToPath(new URL('../assets/fonts/BarlowCondensed-Bold.ttf', import.meta.url))));
  assert.match(read('../assets/fonts/OFL.txt'), /SIL OPEN FONT LICENSE Version 1\.1/i);
});

test('suffix tab baru hanya untuk pembaca layar', () => {
  for (const page of PAGES) {
    const anchors = [...read(page).matchAll(/<a\b[^>]*href="https:\/\/[^"]+"[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
    for (const anchor of anchors) {
      assert.match(anchor, /target="_blank"/, `${page}: ${anchor}`);
      assert.match(anchor, /rel="noopener noreferrer"/, `${page}: ${anchor}`);
      assert.match(anchor, /<span class="sr-only">, membuka tab baru<\/span>/, `${page}: ${anchor}`);
      const visible = anchor.replace(/<span class="sr-only">[\s\S]*?<\/span>/g, '');
      assert.doesNotMatch(visible, /tab baru/i, `${page}: ${anchor}`);
    }
  }
  const js = read('../site.js');
  assert.match(js, /element\('span', 'sr-only', ', membuka tab baru'\)/);
  assert.doesNotMatch(js, /Unduh \$\{[^}]+\}, tab baru|Versi portable, tab baru|Buka GitHub Release, tab baru/);
});

test('tiga hukum privasi tersedia dan memakai chroma yang sama', () => {
  for (const page of ['../privacy.html', '../terms.html', '../data-deletion.html']) {
    const html = read(page);
    assert.match(html, /class="wordmark"/, page);
    assert.match(html, /id="main"/, page);
    assert.match(html, /class="[^"]*\blegal-main\b/, page);
    assert.match(html, /class="site-footer"/, page);
  }
});

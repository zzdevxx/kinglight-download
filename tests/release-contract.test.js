import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  SCHEMA_VERSION,
  STATUS_UNRELEASED,
  STATUS_AVAILABLE,
  initPortal,
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
  formatPublishedAt
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

test('release.json adalah snapshot unreleased yang tepat', () => {
  const raw = read('../release.json');
  assert.equal(raw, '{"schemaVersion":1,"status":"unreleased","artifacts":[]}');
  assert.deepEqual(JSON.parse(raw), {
    schemaVersion: 1,
    status: 'unreleased',
    artifacts: []
  });
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
  assert.match(html, /<script type="module" src="\.\/site\.js"><\/script>/);
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

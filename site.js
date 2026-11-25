/**
 * Pembaca snapshot rilis kinglight-download.
 * Modul ini sengaja tidak menyentuh DOM saat diimpor oleh node:test.
 */

export const SCHEMA_VERSION = 1;
export const STATUS_UNRELEASED = 'unreleased';
export const STATUS_AVAILABLE = 'available';

const RELEASE_PATH = '/zzdevxx/kinglight/releases/';
const REQUIRED_RELEASE_FIELDS = [
  'version',
  'tag',
  'sourceCommit',
  'publishedAt',
  'channel',
  'releaseUrl'
];
const ALL_RELEASE_FIELDS = [...REQUIRED_RELEASE_FIELDS, 'notesUrl'];
const COMMIT_PATTERN = /^[0-9a-fA-F]{40}$/;
const SHA256_PATTERN = /^[0-9a-fA-F]{64}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasOwn(value, field) {
  return Object.prototype.hasOwnProperty.call(value, field);
}

function fail(code, reason) {
  return { ok: false, code, reason };
}

function pass(release) {
  return { ok: true, release };
}

export function parseOfficialUrl(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) {
    return null;
  }
  if (/^https:\/\/github\.com:/i.test(value)) {
    return null;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' || parsed.host !== 'github.com' || parsed.hostname !== 'github.com') {
    return null;
  }
  if (parsed.username !== '' || parsed.password !== '' || parsed.port !== '') {
    return null;
  }
  if (!parsed.pathname.startsWith(RELEASE_PATH)) {
    return null;
  }

  const rest = parsed.pathname.slice(RELEASE_PATH.length);
  if (rest === '' || rest.includes('..') || rest.includes('//')) {
    return null;
  }

  return { url: parsed, rest };
}

export function isOfficialReleaseUrl(value) {
  const parsed = parseOfficialUrl(value);
  return parsed !== null && parsed.rest.startsWith('tag/') && parsed.rest.length > 'tag/'.length;
}

export function isOfficialAssetUrl(value) {
  const parsed = parseOfficialUrl(value);
  if (parsed === null || !parsed.rest.startsWith('download/')) {
    return false;
  }
  const segments = parsed.rest.slice('download/'.length).split('/');
  return segments.length === 2 && segments.every((segment) => segment.length > 0);
}

export function isOfficialNotesUrl(value) {
  return parseOfficialUrl(value) !== null;
}

export function isFullCommitSha(value) {
  return typeof value === 'string' && COMMIT_PATTERN.test(value);
}

export function isSha256(value) {
  return typeof value === 'string' && SHA256_PATTERN.test(value);
}

export function isIsoTimestamp(value) {
  return isNonEmptyText(value) && ISO_DATE_PATTERN.test(value) && Number.isFinite(Date.parse(value));
}

export function validateArtifact(value, index) {
  const prefix = `artifacts[${index}]`;
  if (!isRecord(value)) {
    return fail(prefix, `Entri artefak ${index + 1} harus berupa objek.`);
  }

  for (const field of ['platform', 'arch', 'fileName']) {
    if (!isNonEmptyText(value[field])) {
      return fail(`${prefix}.${field}`, `Artefak ${index + 1} memerlukan ${field} berupa teks yang tidak kosong.`);
    }
  }
  if (!isOfficialAssetUrl(value.url)) {
    return fail(`${prefix}.url`, `URL artefak ${index + 1} harus menuju aset GitHub Release Kinglight.`);
  }
  if (!Number.isSafeInteger(value.sizeBytes) || value.sizeBytes < 0) {
    return fail(`${prefix}.sizeBytes`, `Ukuran artefak ${index + 1} harus bilangan bulat bukan negatif.`);
  }
  if (!isSha256(value.sha256)) {
    return fail(`${prefix}.sha256`, `SHA-256 artefak ${index + 1} harus 64 karakter heksadesimal.`);
  }

  return pass({
    platform: value.platform.trim(),
    arch: value.arch.trim(),
    fileName: value.fileName.trim(),
    url: value.url,
    sizeBytes: value.sizeBytes,
    sha256: value.sha256.toLowerCase()
  });
}

export function validateReleaseSnapshot(input) {
  if (!isRecord(input)) {
    return fail('root', 'Snapshot harus berupa objek.');
  }
  if (input.schemaVersion !== SCHEMA_VERSION) {
    return fail('schemaVersion', 'schemaVersion harus 1.');
  }
  if (input.status !== STATUS_UNRELEASED && input.status !== STATUS_AVAILABLE) {
    return fail('status', 'status harus unreleased atau available.');
  }
  if (!Array.isArray(input.artifacts)) {
    return fail('artifacts', 'artifacts harus berupa larik.');
  }

  if (input.status === STATUS_UNRELEASED) {
    if (input.artifacts.length > 0) {
      return fail('unreleased.artifacts', 'Snapshot unreleased tidak boleh memuat artefak.');
    }
    const extra = ALL_RELEASE_FIELDS.filter((field) => hasOwn(input, field));
    if (extra.length > 0) {
      return fail('unreleased.fields', `Snapshot unreleased tidak boleh memuat field ${extra[0]}.`);
    }
    return pass({ schemaVersion: SCHEMA_VERSION, status: STATUS_UNRELEASED, artifacts: [] });
  }

  for (const field of REQUIRED_RELEASE_FIELDS) {
    if (!isNonEmptyText(input[field])) {
      return fail(field, `Field ${field} wajib berupa teks yang tidak kosong.`);
    }
  }
  if (!isFullCommitSha(input.sourceCommit)) {
    return fail('sourceCommit', 'sourceCommit harus 40 karakter heksadesimal.');
  }
  if (!isIsoTimestamp(input.publishedAt)) {
    return fail('publishedAt', 'publishedAt harus waktu ISO 8601 yang valid.');
  }
  if (!isOfficialReleaseUrl(input.releaseUrl)) {
    return fail('releaseUrl', 'releaseUrl harus menuju GitHub Release Kinglight.');
  }
  if (hasOwn(input, 'notesUrl') && !isOfficialNotesUrl(input.notesUrl)) {
    return fail('notesUrl', 'notesUrl harus menuju halaman GitHub Release Kinglight.');
  }
  if (input.artifacts.length === 0) {
    return fail('artifacts', 'Status available memerlukan minimal satu artefak.');
  }

  const artifacts = [];
  const seenUrls = new Set();
  for (const [index, raw] of input.artifacts.entries()) {
    const result = validateArtifact(raw, index);
    if (!result.ok) {
      return result;
    }
    if (seenUrls.has(result.release.url)) {
      return fail(`artifacts[${index}].url`, 'URL artefak tidak boleh berulang.');
    }
    seenUrls.add(result.release.url);
    artifacts.push(result.release);
  }

  return pass({
    schemaVersion: SCHEMA_VERSION,
    status: STATUS_AVAILABLE,
    version: input.version.trim(),
    tag: input.tag.trim(),
    sourceCommit: input.sourceCommit.toLowerCase(),
    publishedAt: input.publishedAt,
    channel: input.channel.trim(),
    releaseUrl: input.releaseUrl,
    notesUrl: hasOwn(input, 'notesUrl') ? input.notesUrl : null,
    artifacts
  });
}

export function formatBytes(bytes) {
  if (!Number.isSafeInteger(bytes) || bytes < 0) {
    return '';
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(1).replace('.', ',')} ${units[index]}`;
}

export function shortCommit(commit) {
  return typeof commit === 'string' ? commit.slice(0, 7) : '';
}

export function formatPublishedAt(timestamp) {
  if (!isIsoTimestamp(timestamp)) {
    return '';
  }
  const iso = new Date(timestamp).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;
}

async function copyText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    await navigator.clipboard.writeText(text);
    return;
  }

  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.className = 'clipboard-fallback';
  document.body.append(field);
  try {
    field.select();
    if (!document.execCommand('copy')) {
      throw new Error('Perintah salin ditolak browser');
    }
  } finally {
    field.remove();
  }
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) {
    node.className = className;
  }
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function clear(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function addParagraph(parent, text, className) {
  parent.append(element('p', className, text));
}

function addTerm(parent, label, value, mono = false) {
  parent.append(element('dt', '', label));
  const dd = element('dd', mono ? 'mono hash' : 'num', value);
  if (mono) {
    const code = element('code', '', value);
    clear(dd);
    dd.append(code);
  }
  parent.append(dd);
}

function externalLink(label, url, className) {
  const link = element('a', className, label);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function actionButton(label, className, handler) {
  const button = element('button', className, label);
  button.type = 'button';
  button.addEventListener('click', handler);
  return button;
}

function renderUnreleased(setState, content) {
  setState('unreleased', 'Belum ada rilis', 'Belum ada unduhan aktif pada portal ini.');
  addParagraph(
    content,
    'Tautan unduhan ditampilkan setelah aset GitHub Release Kinglight siap dan snapshot terverifikasi diterbitkan.',
    'muted'
  );

  const list = element('ul', 'source-list');
  const item = element('li');
  item.append(externalLink('Sumber dan rencana Kinglight, tab baru', 'https://github.com/zzdevxx/kinglight', 'text-link'));
  list.append(item);
  content.append(list);
}

function renderArtifact(artifact) {
  const item = element('article', 'artifact');
  const head = element('div', 'artifact-head');
  head.append(
    element('h4', 'artifact-title', `${artifact.platform} / ${artifact.arch}`),
    element('p', 'artifact-file mono', artifact.fileName)
  );

  const specs = element('dl', 'artifact-meta');
  addTerm(specs, 'Ukuran', `${formatBytes(artifact.sizeBytes)} (${artifact.sizeBytes} byte)`);
  addTerm(specs, 'SHA-256', artifact.sha256, true);

  const actions = element('div', 'artifact-actions');
  actions.append(
    externalLink(`Unduh ${artifact.fileName}, tab baru`, artifact.url, 'btn btn--primary'),
    actionButton('Salin SHA-256', 'btn', async () => {
      feedback.textContent = 'Menyalin hash.';
      button.disabled = true;
      try {
        await copyText(artifact.sha256);
        feedback.textContent = 'SHA-256 tersalin.';
      } catch (error) {
        feedback.textContent = 'Gagal menyalin. Pilih teks hash lalu salin manual.';
        console.error('[kinglight-download] gagal menyalin hash', { message: error.message });
      } finally {
        button.disabled = false;
      }
    })
  );

  const feedback = element('p', 'copy-feedback muted');
  feedback.setAttribute('role', 'status');
  item.append(head, specs, actions, feedback);
  return item;
}

function renderAvailable(setState, content, release) {
  setState('available', `Rilis ${release.version}`, 'Metadata berasal dari snapshot release.json.');

  const meta = element('dl', 'release-meta');
  addTerm(meta, 'Versi', release.version, true);
  addTerm(meta, 'Tag', release.tag);
  addTerm(meta, 'Kanal', release.channel);
  addTerm(meta, 'Diterbitkan', formatPublishedAt(release.publishedAt));
  addTerm(meta, 'Commit sumber', shortCommit(release.sourceCommit), true);
  content.append(meta);

  const links = element('div', 'release-links');
  links.append(externalLink('Buka GitHub Release, tab baru', release.releaseUrl, 'btn btn--primary'));
  if (release.notesUrl) {
    links.append(externalLink('Catatan rilis, tab baru', release.notesUrl, 'btn'));
  }
  content.append(links);

  content.append(element('h3', 'subsection-title', 'Berkas rilis'));
  const list = element('div', 'artifact-list');
  for (const artifact of release.artifacts) {
    list.append(renderArtifact(artifact));
  }
  content.append(list);
}

export async function initPortal(root = globalThis.document) {
  const panel = root.querySelector('#release');
  const title = root.querySelector('#release-title');
  const detail = root.querySelector('#release-detail');
  const content = root.querySelector('#release-content');
  if (!panel || !title || !detail || !content) {
    return;
  }

  const setState = (state, heading, body) => {
    panel.dataset.state = state;
    panel.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
    title.textContent = heading;
    detail.textContent = body;
    clear(content);
  };

  setState('loading', 'Membaca metadata rilis', 'Menghubungkan ke snapshot statis.');

  try {
    const response = await fetch('./release.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const snapshot = await response.json();
    const result = validateReleaseSnapshot(snapshot);

    if (!result.ok) {
      setState('error', 'Metadata rilis tidak valid', result.reason);
      addParagraph(content, 'Tautan unduhan tidak ditampilkan sampai snapshot diperbaiki.', 'muted');
      return;
    }

    if (result.release.status === STATUS_UNRELEASED) {
      renderUnreleased(setState, content);
      return;
    }

    renderAvailable(setState, content, result.release);
  } catch (error) {
    setState(
      'error',
      'Metadata rilis tidak dapat dimuat',
      'Periksa koneksi lalu muat ulang halaman. Tautan unduhan tidak ditampilkan.'
    );
    content.append(
      actionButton('Muat ulang metadata', 'btn btn--primary', () => {
        void initPortal(root);
      })
    );
    console.error('[kinglight-download] gagal membaca release.json', {
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      void initPortal(document);
    }, { once: true });
  } else {
    void initPortal(document);
  }
}

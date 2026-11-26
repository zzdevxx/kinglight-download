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

function hasExtension(artifact, extension) {
  const fileName = typeof artifact.fileName === 'string' ? artifact.fileName.toLowerCase() : '';
  const rawUrl = typeof artifact.url === 'string' ? artifact.url.toLowerCase() : '';
  const urlPath = rawUrl.split(/[?#]/)[0];
  return fileName.endsWith(extension) || urlPath.endsWith(extension);
}

export function selectDownloadArtifacts(artifacts) {
  const list = Array.isArray(artifacts) ? artifacts : [];
  const installer = list.find((artifact) => hasExtension(artifact, '.exe')) ?? null;
  const portable = list.find((artifact) => hasExtension(artifact, '.zip')) ?? null;
  const primary = installer ?? list.find((artifact) => artifact !== portable) ?? portable ?? null;
  return { installer, portable, primary };
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
  const link = element('a', className);
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.append(label);
  link.append(element('span', 'sr-only', ', membuka tab baru'));
  return link;
}

function renderHeroActions(root, selection) {
  const host = root.querySelector('#hero-actions');
  if (!host || !selection.primary) {
    return;
  }

  clear(host);
  const label = selection.installer === selection.primary ? 'Unduh untuk Windows' : 'Unduh portable';
  host.append(externalLink(label, selection.primary.url, 'btn btn--primary'));
  if (selection.portable && selection.portable !== selection.primary) {
    host.append(externalLink('Versi portable', selection.portable.url, 'btn btn--quiet'));
  }
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
    'Belum ada unduhan aktif. Lihat sumber aplikasi untuk perkembangan rilis.',
    'muted'
  );

  const list = element('ul', 'source-list');
  const item = element('li');
  item.append(externalLink('Sumber dan perkembangan Kinglight', 'https://github.com/zzdevxx/kinglight', 'text-link'));
  list.append(item);
  content.append(list);
}

function renderArtifact(artifact) {
  const item = element('article', 'artifact-row');
  const head = element('div', 'artifact-head');
  head.append(
    element('h4', 'artifact-title', `${artifact.platform} / ${artifact.arch}`),
    element('p', 'artifact-file', artifact.fileName)
  );

  const size = element('p', 'artifact-size', `${formatBytes(artifact.sizeBytes)} (${artifact.sizeBytes} byte)`);
  const actions = element('div', 'artifact-actions');
  actions.append(externalLink(`Unduh ${artifact.fileName}`, artifact.url, 'btn'));
  item.append(head, size, actions);
  return item;
}

function renderArtifactSpec(artifact) {
  const block = element('div', 'artifact-spec');
  block.append(element('h4', '', `${artifact.platform} / ${artifact.arch}`));

  const specs = element('dl', 'spec-grid');
  addTerm(specs, 'Nama berkas', artifact.fileName, true);
  addTerm(specs, 'Ukuran', `${formatBytes(artifact.sizeBytes)} (${artifact.sizeBytes} byte)`);
  addTerm(specs, 'SHA-256', artifact.sha256, true);
  block.append(specs);

  const feedback = element('p', 'copy-feedback');
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');

  const button = actionButton('Salin SHA-256', 'btn', async () => {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    feedback.textContent = 'Menyalin hash.';
    try {
      await copyText(artifact.sha256);
      feedback.textContent = 'SHA-256 tersalin.';
    } catch (error) {
      feedback.textContent = 'Gagal menyalin. Pilih teks hash lalu salin manual.';
      console.error('[kinglight-download] gagal menyalin hash', { message: error.message });
    } finally {
      button.removeAttribute('aria-busy');
      button.disabled = false;
    }
  });
  block.append(button, feedback);
  return block;
}

function renderAvailable(setState, content, release, root) {
  const selection = selectDownloadArtifacts(release.artifacts);
  const primary = selection.primary;
  setState('available', `Versi ${release.version}`, 'Unduhan resmi dari GitHub Release Kinglight.');
  renderHeroActions(root, selection);

  const heroStatus = root.querySelector('#hero-status');
  if (heroStatus) {
    heroStatus.textContent = primary
      ? `Versi ${release.version} untuk ${primary.platform} ${primary.arch}`
      : `Versi ${release.version} tersedia`;
  }
  const reqPlatform = root.querySelector('#req-platform');
  if (reqPlatform && primary) {
    reqPlatform.textContent = `${primary.platform} / ${primary.arch}`;
  }
  const reqFile = root.querySelector('#req-file');
  if (reqFile && primary) {
    reqFile.textContent = primary.fileName;
  }

  const summary = element('div', 'release-summary');
  summary.append(
    element('p', 'release-version', release.version),
    element('p', 'release-context', `${release.channel}, ${formatPublishedAt(release.publishedAt)}`)
  );
  content.append(summary);

  const actions = element('div', 'release-actions');
  if (primary) {
    actions.append(externalLink(`Unduh ${primary.fileName}`, primary.url, 'btn btn--primary'));
  }
  if (selection.portable && selection.portable !== primary) {
    actions.append(externalLink('Versi portable', selection.portable.url, 'btn btn--quiet'));
  }
  actions.append(externalLink('Buka GitHub Release', release.releaseUrl, 'btn btn--quiet'));
  content.append(actions);

  const list = element('div', 'artifact-list');
  for (const artifact of release.artifacts) {
    list.append(renderArtifact(artifact));
  }
  content.append(list);

  const details = element('details', 'details');
  const summaryDetails = element('summary', '', 'Rincian rilis dan SHA-256');
  details.append(summaryDetails);

  const body = element('div', 'details-body');
  const meta = element('dl', 'spec-grid');
  addTerm(meta, 'Versi', release.version, true);
  addTerm(meta, 'Tag', release.tag);
  addTerm(meta, 'Kanal', release.channel);
  addTerm(meta, 'Diterbitkan', formatPublishedAt(release.publishedAt), true);
  addTerm(meta, 'Commit sumber', shortCommit(release.sourceCommit), true);
  if (release.notesUrl) {
    const notes = element('dd');
    notes.append(externalLink('Catatan rilis', release.notesUrl, 'text-link'));
    meta.append(element('dt', '', 'Catatan rilis'), notes);
  }
  body.append(meta);

  for (const artifact of release.artifacts) {
    body.append(renderArtifactSpec(artifact));
  }
  addParagraph(body, 'Periksa hash berkas dengan Get-FileHash nama-berkas -Algorithm SHA256 di PowerShell.', 'muted');
  details.append(body);
  content.append(details);
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

    const heroActions = root.querySelector('#hero-actions');
    if (heroActions) {
      clear(heroActions);
      const statusLink = element('a', 'btn btn-quiet', 'Lihat status rilis');
      statusLink.href = '#download';
      heroActions.append(statusLink);
    }

    const badge = root.querySelector('#release-badge');
    if (badge) {
      badge.textContent = state === 'available'
        ? 'Tersedia'
        : state === 'unreleased'
          ? 'Belum terbit'
          : state === 'invalid'
            ? 'Tidak valid'
            : state === 'error'
              ? 'Gagal dimuat'
              : 'Memuat';
    }

    const heroStatus = root.querySelector('#hero-status');
    if (heroStatus) {
      const tone = state === 'available' ? 'available' : state === 'error' || state === 'invalid' ? 'error' : 'loading';
      heroStatus.dataset.tone = tone;
      heroStatus.textContent = state === 'unreleased'
        ? 'Belum ada unduhan aktif.'
        : state === 'invalid'
          ? 'Data rilis tidak valid.'
          : state === 'error'
            ? 'Data rilis tidak dapat dimuat.'
            : 'Menyiapkan unduhan.';
    }
  };

  setState('loading', 'Menyiapkan unduhan', 'Mencari rilis yang tersedia.');

  try {
    const response = await fetch('./release.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const snapshot = await response.json();
    const result = validateReleaseSnapshot(snapshot);

    if (!result.ok) {
      setState('error', 'Data rilis tidak valid', result.reason);
      panel.dataset.state = 'invalid';
      addParagraph(content, 'Belum ada tautan unduhan yang bisa ditampilkan.', 'muted');
      return;
    }

    if (result.release.status === STATUS_UNRELEASED) {
      renderUnreleased(setState, content);
      return;
    }

    renderAvailable(setState, content, result.release, root);
  } catch (error) {
    setState(
      'error',
      'Data rilis tidak dapat dimuat',
      'Periksa koneksi lalu muat ulang halaman. Belum ada tautan unduhan yang bisa ditampilkan.'
    );
    const retry = actionButton('Muat ulang data rilis', 'btn btn--primary', () => {
      retry.disabled = true;
      retry.setAttribute('aria-busy', 'true');
      retry.textContent = 'Memuat ulang data rilis.';
      void initPortal(root);
    });
    content.append(retry);
    console.error('[kinglight-download] gagal membaca release.json', {
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export function initScreenshot(root = globalThis.document) {
  const image = root.querySelector('#simulator-screenshot');
  const fallback = root.querySelector('#simulator-fallback');
  if (!image || !fallback) {
    return;
  }

  const showFallback = () => {
    image.hidden = true;
    fallback.hidden = false;
  };
  const showImage = () => {
    image.hidden = false;
    fallback.hidden = true;
  };

  image.addEventListener('error', showFallback);
  image.addEventListener('load', showImage);

  if (image.complete) {
    if (image.naturalWidth > 0) {
      showImage();
    } else {
      showFallback();
    }
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const start = () => {
    void initPortal(document);
    initScreenshot(document);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}

// Isolated storage contract check: no network and no real environment credentials.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const source = ts.transpileModule(fs.readFileSync(path.join(root, 'lib/store.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
class Conflict extends Error {}

function fixture(mode = 'normal', initial = null) {
  let record = initial && JSON.stringify(initial), etag = initial ? 1 : 0;
  let reads = 0, writes = 0;
  const sdk = {
    BlobPreconditionFailedError: Conflict,
    get: async () => {
      reads++;
      if (mode === 'read-failure') throw new Error('offline');
      if (mode === 'invalid-json') return { statusCode: 200, stream: new Response('{broken').body, blob: { etag: '1' } };
      if (!record) return null;
      return { statusCode: 200, stream: new Response(record).body, blob: { etag: String(etag) } };
    },
    put: async (_pathname, value, options) => {
      writes++;
      if (mode === 'write-failure') throw new Error('offline');
      if (mode === 'contention') throw new Conflict('conflict');
      if (record && !options.allowOverwrite) throw new Error('already exists');
      if (options.ifMatch && options.ifMatch !== String(etag)) throw new Conflict('conflict');
      record = value; etag++;
      return {};
    },
    list: async () => ({ blobs: [] }),
  };
  const exports = {};
  const sandbox = {
    exports, module: { exports }, process: { env: { BLOB_STORE_ID: 'isolated-test-store' } },
    require: name => name === '@vercel/blob' ? sdk : name === 'node:crypto' ? require(name) : (() => { throw new Error(`Unexpected import: ${name}`); })(),
    Response, AbortSignal, setTimeout,
  };
  vm.runInNewContext(source, sandbox, { filename: 'isolated-store.js' });
  return { reserve: sandbox.module.exports.takeResearchQuota, state: () => ({ record: record && JSON.parse(record), reads, writes }) };
}

const hour = new Date().toISOString().slice(0, 13);
const empty = { schemaVersion: 1, hour, siteCount: 0, owners: {}, expiresAt: new Date().toISOString() };

(async () => {
  let store = fixture();
  for (let i = 0; i < 8; i++) assert.equal(await store.reserve('same-caller'), true);
  assert.equal(await store.reserve('same-caller'), false);
  assert.equal(store.state().writes, 8);
  console.log('PASS actual caller exhaustion returns false without another write');

  store = fixture();
  const concurrent = await Promise.allSettled(Array.from({ length: 70 }, (_, i) => store.reserve(`caller-${i}`)));
  let accepted = concurrent.filter(result => result.status === 'fulfilled' && result.value).length;
  assert.ok(accepted <= 40);
  assert.equal(store.state().record.siteCount, accepted);
  for (let i = 0; accepted < 40; i++) {
    assert.equal(await store.reserve(`fill-${i}`), true); accepted++;
  }
  assert.equal(await store.reserve('after-global-limit'), false);
  assert.equal(store.state().record.siteCount, 40);
  assert.equal(Object.values(store.state().record.owners).reduce((a, b) => a + b, 0), 40);
  assert.ok(Object.values(store.state().record.owners).every(count => count <= 8));
  console.log('PASS 70 concurrent reservations preserve atomic limits and exact committed count');

  for (const mode of ['read-failure', 'invalid-json']) {
    store = fixture(mode);
    await assert.rejects(store.reserve('caller'));
    assert.equal(store.state().writes, 0);
    console.log(`PASS ${mode} throws before a write`);
  }
  store = fixture('normal', { ...empty, siteCount: 2 });
  await assert.rejects(store.reserve('caller'), /storage is invalid/);
  assert.equal(store.state().writes, 0);
  console.log('PASS corrupt counters throw before a write');

  store = fixture('write-failure', empty);
  await assert.rejects(store.reserve('caller'), /offline/);
  assert.equal(store.state().writes, 1);
  console.log('PASS existing-record write failure throws immediately');

  store = fixture('write-failure');
  await assert.rejects(store.reserve('caller'), /temporarily unavailable/);
  assert.equal(store.state().writes, 6);
  assert.equal(store.state().record, null);
  console.log('PASS failed first-create writes remain bounded and throw');

  store = fixture('contention', empty);
  await assert.rejects(store.reserve('caller'), /temporarily unavailable/);
  assert.equal(store.state().writes, 6);
  assert.equal(store.state().record.siteCount, 0);
  console.log('PASS exhausted CAS contention throws after six attempts without a reservation');
})().catch(error => { console.error(error.message); process.exitCode = 1; });

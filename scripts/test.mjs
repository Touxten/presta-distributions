import fs from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('manifests/releases.json'));
const html=fs.readFileSync('site/index.html','utf8');
assert.equal(data.length,14);
assert.equal(data.filter(r=>r.prerelease).length,3);
assert.equal(new Set(data.map(r=>r.version)).size,14);
assert.ok(html.includes('29 sept. 2026'));
assert.ok(!html.includes('{{'));
assert.ok(!html.includes('href="zip/'));
for(const r of data){assert.match(r.sourceCommit,/^[a-f0-9]{40}$/);for(const a of r.assets){assert.match(a.sha256,/^[a-f0-9]{64}$/);assert.ok(html.includes(`/releases/download/${r.tag}/${encodeURIComponent(a.name)}`));}}
assert.ok(html.includes('prestashop_9.0.0.RC1.zip'));
const variants=JSON.parse(fs.readFileSync('manifests/variants.json'));
for(const r of variants){for(const a of r.assets){assert.match(a.sha256,/^[a-f0-9]{64}$/);assert.ok(html.includes(`/releases/download/${r.tag}/${encodeURIComponent(a.name)}`));}}
assert.ok(html.includes('id="9.2.0-no-opc"'));
assert.ok(html.includes('pas recommandée pour la production'));
console.log('Catalogue: 14 versions, correct dates, asset URLs and hashes.');

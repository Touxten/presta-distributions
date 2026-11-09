import fs from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('manifests/releases.json'));
const html=fs.readFileSync('site/index.html','utf8');
assert.equal(data.length,16);
assert.equal(data.filter(r=>r.prerelease).length,3);
assert.equal(new Set(data.map(r=>r.version)).size,16);
assert.ok(html.includes('29 sept. 2026'));
assert.ok(!html.includes('{{'));
assert.ok(!html.includes('href="zip/'));
for(const r of data){assert.match(r.sourceCommit,/^[a-f0-9]{40}$/);for(const a of r.assets){assert.match(a.sha256,/^[a-f0-9]{64}$/);assert.ok(html.includes(`/releases/download/${r.tag}/${encodeURIComponent(a.name)}`));}}
assert.ok(html.includes('prestashop_9.0.0.RC1.zip'));
const variants=JSON.parse(fs.readFileSync('manifests/variants.json'));
for(const r of variants){for(const a of r.assets){assert.match(a.sha256,/^[a-f0-9]{64}$/);assert.ok(html.includes(`/releases/download/${r.tag}/${encodeURIComponent(a.name)}`));}}
assert.ok(html.includes('id="9.2.0-no-opc"'));
assert.ok(html.includes('tools/build/CreateRelease.php'));
assert.ok(html.includes('restent à valider sur une boutique de test'));
assert.ok(html.includes('Communautaire Touxten · non officielle'));
assert.ok(html.includes('https://github.com/Touxten/PrestaShop/releases/download/v9.1.6/prestashop_9.1.6.zip'));
assert.ok(html.includes('Télécharger la 9.2.1'));
console.log('Catalogue verified.');
const communityRow = html.match(/<tr id="version-9\.2\.0-no-opc".*?<\/tr>/s)?.[0];
assert.ok(communityRow?.includes('data-kind="fork"'));
assert.ok(communityRow.includes('9.2.0 sans One Page Checkout'));
assert.ok(communityRow.includes('/releases/tag/v9.2.0-no-opc'));
assert.ok(communityRow.includes('/releases/download/v9.2.0-no-opc/'));
assert.ok(!communityRow.includes('class="security"'));
assert.ok(html.includes('https://www.cve.org/CVERecord?id=CVE-2026-71519'));
const security = JSON.parse(fs.readFileSync('manifests/security.json'));
for (const fixes of Object.values(security)) {
  for (const fix of fixes) {
    if (fix.cve) assert.match(fix.cve, /^CVE-\d{4}-\d+$/);
    assert.ok(fix.source.startsWith('https://github.com/PrestaShop/PrestaShop/'));
  }
}
for (const version of ['9.2.1', '9.1.6']) {
  assert.equal(new Set(security[version].map(fix => fix.source)).size, 18);
  assert.deepEqual(security[version].map(fix => fix.cve).filter(Boolean).sort(), ['CVE-2026-71519', 'CVE-2026-71531']);
}
assert.equal(security['9.1.5'].length, 5);

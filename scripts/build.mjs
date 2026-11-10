import fs from 'node:fs';
const releases=JSON.parse(fs.readFileSync('manifests/releases.json'));
const variants=JSON.parse(fs.readFileSync('manifests/variants.json'));
const repo='https://github.com/Touxten/presta-distributions';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceRepo=r=>r.sourceRepo || 'https://github.com/PrestaShop/PrestaShop';
const asset=(r,a)=>`${r.downloadRepo || repo}/releases/download/${r.tag}/${encodeURIComponent(a)}`;
const latest=releases.find(r=>!r.prerelease);
const releaseDate = release => Date.parse(release.date + " 12:00:00 UTC");
const security = JSON.parse(fs.readFileSync('manifests/security.json'));
const communityVariants = variants.map(r => ({
  ...r, fork: true, date: r.publishedOn, label: r.sourceVersion + ' sans One Page Checkout',
  notes: repo + '/releases/tag/' + r.tag
}));
const advisories = JSON.parse(fs.readFileSync('manifests/affected-core.json'));
const versionOrder = new Intl.Collator('en', {numeric: true});
const severityLabels = {low: 'Faible', medium: 'Modérée', high: 'Élevée', critical: 'Critique'};
const scoreFormat = new Intl.NumberFormat('fr-FR', {minimumFractionDigits: 1});
function securityBadge(r) {
  const version = r.sourceVersion || (r.version === '9.1.6' ? '9.1.5' : r.version);
  if (version.includes('-')) return '<p class="security">Exposition de la préversion non évaluée</p>';
  const backports = new Set((security[r.version] || []).map(fix => fix.source));
  const affected = advisories.filter(a => versionOrder.compare(version, a.affectedFrom) >= 0
    && versionOrder.compare(version, a.fixedIn) < 0 && !backports.has(a.source));
  if (!affected.length) return '';
  const count = new Set(affected.map(a => a.cve).filter(Boolean)).size;
  const label = `${count ? count + ' CVE · ' : ''}${affected.length} avis au total`;
  const items = affected.map(a => {
    const record = a.cve ? `<a href="https://www.cve.org/CVERecord?id=${esc(a.cve)}">${esc(a.cve)}</a> · ` : '';
    const rating = a.cvss ? `<b>${scoreFormat.format(a.cvss.score)}/10 · ${severityLabels[a.cvss.severity]}</b> (CVSS ${esc(a.cvss.version)})<br>` : '';
    return `<li>${esc(a.title)}<br>${rating}${record}<a href="${esc(a.source)}">${esc(a.source.split('/').pop())}</a> · Corrigé en ${esc(a.fixedIn)}</li>`;
  });
  const ref = r.notes || sourceRepo(r) + '/releases/tag/' + (r.sourceTag || r.version);
  return `<details class="security"><summary aria-label="${esc(label)} · Vulnérabilités de la ${esc(r.label || r.version)}">${esc(label)}</summary><div class="security-content"><a href="${esc(ref)}">Version sur GitHub ↗</a> · <a href="https://github.com/PrestaShop/PrestaShop/security/advisories">Avis officiels PrestaShop ↗</a><ul>${items.join('')}</ul></div></details>`;
}
const byDate = [...releases, ...communityVariants].sort((a, b) => releaseDate(b) - releaseDate(a));
function articleLinks(r) {
  if (!r.articleUrl) return '';
  const announcement = `<a class="source" href="${esc(r.articleUrl)}">Article officiel ↗</a>`;
  if (!r.installerArticleUrl) return announcement;
  return announcement + `<a class="source" href="${esc(r.installerArticleUrl)}">Article sur l’installateur ↗</a>`;
}
const rows=byDate.map(r=>`<tr id="version-${esc(r.version)}" data-kind="${r.fork?'fork':r.prerelease?'preview':'stable'}" data-version="${esc(r.version)}" data-date="${releaseDate(r)}" data-bytes="${r.assets[0].bytes}"><td><strong>${esc(r.label || r.version)}</strong><span class="badge ${r.prerelease && !r.fork?'preview':''}">${r.fork?'Communautaire · Thomas Roux · non officielle':r.prerelease?'Préversion':'Stable'}</span>${securityBadge(r)}</td><td class="date">${new Date(r.date+' 12:00:00 UTC').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}</td><td>${(r.assets[0].bytes/1048576).toFixed(1).replace('.',',')} Mo</td><td><a class="download" href="${asset(r,r.assets[0].name)}" aria-label="Télécharger le ZIP ${esc(r.version)}">ZIP <span aria-hidden="true">↗</span></a><a href="${asset(r,r.assets[1].name)}" aria-label="Télécharger le XML ${esc(r.version)}">XML</a><a href="${asset(r,'SHA256SUMS')}" aria-label="Empreintes SHA-256 ${esc(r.version)}">SHA-256</a></td><td>${articleLinks(r)}<a class="source" href="${r.notes || sourceRepo(r)+'/releases/tag/'+(r.sourceTag || r.version)}">Notes de version ↗</a><a class="commit" href="${sourceRepo(r)}/commit/${r.sourceCommit}">${r.sourceCommit.slice(0,8)}</a></td></tr>`).join('\n');
let template=fs.readFileSync('site/template.html','utf8');
const news = [
  { date: "2026-11-09", content: `<h3>PrestaShop 9.2.1 standard</h3>
<p>Cette compilation du tag officiel 9.2.1 intègre notamment des correctifs de sécurité pour les accès API et le webservice multiboutique.</p>
<div class="about-links"><a href="#version-9.2.1">ZIP et XML de la 9.2.1 ↗</a><a href="https://github.com/PrestaShop/PrestaShop/releases/tag/9.2.1">Notes officielles ↗</a><a href="${esc(releases.find(r => r.version === '9.2.1').articleUrl)}">Article officiel ↗</a></div>` },
  { date: "2026-11-09", content: `<h3>9.1.6 communautaire de Thomas Roux</h3>
<p>Cette édition du fork de Thomas Roux reprend les correctifs de sécurité de la 9.2.1 sur la base de la 9.1.5. La mise à jour depuis la 9.1.5 a été testée avec Update Assistant sur une boutique de démonstration.</p>
<div class="about-links"><a href="#version-9.1.6">ZIP et XML de la 9.1.6 ↗</a><a href="https://github.com/Touxten/PrestaShop/compare/aee413eedd5fdc5053f28fb998da4b7e286cf641...v9.1.6">Voir les changements ↗</a></div>` },
  ...variants.map(r => ({
    id: r.version,
    date: r.publishedOn,
    content: `<h3>PrestaShop ${esc(r.sourceVersion)} sans One Page Checkout · édition communautaire</h3><p>Compilée depuis le tag officiel <strong>${esc(r.sourceVersion)}</strong> avec <strong>tools/build/CreateRelease.php</strong>, après retrait de <strong>ps_onepagecheckout</strong>. La version standard reste disponible ci-dessus. Le ZIP et son XML de mise à jour sont fournis ensemble.</p><p>Le ZIP et le XML sont contrôlés. L’installation et la mise à jour complètes restent à valider sur une boutique de test.</p><div class="about-links"><a href="${asset(r,r.assets[0].name)}">Télécharger le ZIP ↗</a><a href="${asset(r,r.assets[1].name)}">XML de mise à jour ↗</a><a href="${asset(r,'SHA256SUMS')}">SHA-256 ↗</a><a href="${repo}/releases/tag/${r.tag}">Détails de la variante ↗</a></div>`
  }))
];
const newsDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });
const newsHtml = news.sort((a, b) => b.date.localeCompare(a.date)).map(item => {
  const id = item.id ? ` id="${esc(item.id)}"` : '';
  return `<article${id}><p><time datetime="${item.date}">${newsDate.format(new Date(item.date))}</time></p>
${item.content}</article>`;
}).join('\n');
template = template.replace('<!-- NEWS -->', newsHtml);
template=template.replace('<!-- RELEASE_ROWS -->',rows).replace('{{COUNT}}',byDate.length).replaceAll('{{LATEST}}',latest.version).replaceAll('{{LATEST_ZIP}}',asset(latest,latest.assets[0].name)).replaceAll('{{LATEST_XML}}',asset(latest,latest.assets[1].name));
fs.writeFileSync('site/index.html',template);
console.log('Built static catalogue');

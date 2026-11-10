const toolbar=document.querySelector('.toolbar');
const input=toolbar.querySelector('input');
const buttons=[...toolbar.querySelectorAll('button')];
const rows=[...document.querySelectorAll('tbody tr')];
const result=document.querySelector('.results');
let filter='all';
function update(){let count=0;for(const row of rows){row.hidden=!((filter==='all'||row.dataset.kind===filter)&&(row.dataset.version+' '+row.querySelector('strong').textContent).toLowerCase().includes(input.value.trim().toLowerCase()));if(!row.hidden)count++;}result.hidden=false;result.textContent=count?`${count} version${count>1?'s':''} affichée${count>1?'s':''}`:'Aucune version correspondante.';}
for(const button of buttons)button.addEventListener('click',()=>{filter=button.dataset.filter;for(const b of buttons){b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));}update();});
input.addEventListener('input',update);toolbar.hidden=false;

const tableBody = document.querySelector('tbody');
const sortHeaders = [...document.querySelectorAll('th[data-sort]')];
const versionCollator = new Intl.Collator('en', { numeric: true });
let sortKey = 'date';
let sortDirection = -1;

function compareVersions(left, right) {
  const [leftBase, leftPreview = ''] = left.split('-');
  const [rightBase, rightPreview = ''] = right.split('-');
  const byBase = versionCollator.compare(leftBase, rightBase);
  if (byBase) return byBase;
  if (!leftPreview || !rightPreview) return Number(!leftPreview) - Number(!rightPreview);
  return versionCollator.compare(leftPreview, rightPreview);
}

for (const header of sortHeaders) {
  const key = header.dataset.sort;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'table-sort';
  button.textContent = header.textContent;
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = key === sortKey ? ' ↓' : ' ↕';
  button.append(arrow);
  header.replaceChildren(button);
  button.addEventListener('click', () => {
    sortDirection = sortKey === key ? -sortDirection : -1;
    sortKey = key;
    const sorted = [...rows].sort((a, b) => {
      const byVersion = compareVersions(a.dataset.version, b.dataset.version);
      const comparison = key === 'version' ? byVersion : Number(a.dataset[key]) - Number(b.dataset[key]);
      return comparison * sortDirection || -byVersion;
    });
    tableBody.append(...sorted);
    for (const column of sortHeaders) {
      const active = column === header;
      if (active) column.setAttribute('aria-sort', sortDirection < 0 ? 'descending' : 'ascending');
      else column.removeAttribute('aria-sort');
      column.querySelector('.table-sort span').textContent = active ? (sortDirection < 0 ? ' ↓' : ' ↑') : ' ↕';
    }
  });
}

const securityDialog = document.querySelector('.security-dialog');
if (securityDialog && typeof securityDialog.showModal === 'function') {
  for (const trigger of document.querySelectorAll('.security summary')) {
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', event => {
      event.preventDefault();
      const version = trigger.closest('tr').querySelector('strong').textContent;
      securityDialog.querySelector('h2').textContent = 'Vulnérabilités recensées · ' + version;
      const content = trigger.nextElementSibling.cloneNode(true);
      securityDialog.querySelector('.security-body').replaceChildren(content);
      securityDialog.showModal();
    });
  }
  securityDialog.addEventListener('click', event => {
    if (event.target === securityDialog) securityDialog.close();
  });
}

for (const warning of document.querySelectorAll('.community-warning')) {
  const button = warning.querySelector('button');
  const tip = warning.querySelector('[role="tooltip"]');
  document.body.append(tip);
  function showTip() {
    const anchor = button.getBoundingClientRect();
    tip.hidden = false;
    const margin = 8;
    const left = Math.min(anchor.left, document.documentElement.clientWidth - tip.offsetWidth - margin);
    const top = anchor.bottom + tip.offsetHeight <= window.innerHeight - margin
      ? anchor.bottom : anchor.top - tip.offsetHeight;
    tip.style.left = Math.max(margin, left) + 'px';
    tip.style.top = Math.max(margin, top) + 'px';
  }
  function hideTip() { tip.hidden = true; }
  function isInside(target) { return warning.contains(target) || tip.contains(target); }
  warning.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') showTip();
  });
  for (const element of [warning, tip]) {
    element.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && !isInside(event.relatedTarget)) hideTip();
    });
  }
  button.addEventListener('focus', showTip);
  button.addEventListener('click', showTip);
  button.addEventListener('blur', hideTip);
  document.addEventListener('pointerdown', event => {
    if (!isInside(event.target)) hideTip();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') hideTip();
  });
  window.addEventListener('scroll', hideTip, true);
  window.addEventListener('resize', hideTip);
}

const punkDialog = document.querySelector('.punk-dialog');
const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'B', 'A'];
const stickers = [
  ['tester-douter', 'Tester, c’est douter.'],
  ['maj', 'Ne met pas à jour.'],
  ['local', 'Ça marche en local.'],
  ['prod', 'Je teste en prod.'],
  ['cache', 'C’est le cache.'],
  ['temporaire', 'C’est temporaire.'],
  ['vendredi', 'On déploie vendredi.'],
  ['feature', 'C’est une feature.'],
  ['backup', 'Quel backup ?'],
  ['legacy', 'Rien à craindre, je suis en 1.6.'],
  ['logs', 'Quelqu’un lit les logs ?'],
  ['pixel', 'Encore un pixel.'],
  ['push', 'Qui a forcé le push ?'],
  ['todo', 'Je mets un TODO.'],
  ['branche', 'Sur quelle branche ?'],
  ['regex', 'Une petite regex.'],
  ['where', 'Le WHERE !'],
  ['ticket', 'Tu as un ticket ?'],
  ['reboot', 'Tu as redémarré ?'],
];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const offscreen = 'translateY(calc(100% + 1rem))';
let loadingSticker = false;
let closingSticker = false;
function dismissSticker(event) {
  event.preventDefault();
  if (closingSticker) return;
  if (reducedMotion.matches) {
    punkDialog.close();
    return;
  }
  closingSticker = true;
  const from = getComputedStyle(punkDialog).transform;
  const exit = punkDialog.animate([{transform: from}, {transform: offscreen}], {
    duration: 300, easing: 'ease-in', fill: 'forwards'
  });
  exit.onfinish = () => {
    punkDialog.close();
    exit.cancel();
    closingSticker = false;
  };
}
punkDialog.addEventListener('cancel', dismissSticker);
punkDialog.querySelector('form').addEventListener('submit', dismissSticker);
let previousSticker;
let recentKeys = [];
document.addEventListener('keydown', async event => {
  if (event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey ||
      event.target.closest('input, textarea, select, [contenteditable], dialog[open]')) {
    recentKeys = [];
    return;
  }
  if (event.key === 'Shift' || event.key === 'CapsLock') return;
  recentKeys.push(event.key.length === 1 ? event.key.toUpperCase() : event.key);
  if (recentKeys.length > konami.length) recentKeys.shift();
  if (konami.every((key, index) => key === recentKeys[index])) {
    recentKeys = [];
    if (loadingSticker || punkDialog.open) return;
    const mascot = punkDialog.querySelector('img');
    const choices = stickers.filter(sticker => sticker !== previousSticker);
    previousSticker = choices[Math.floor(Math.random() * choices.length)];
    const [file, phrase] = previousSticker;
    mascot.alt = 'Preston punk dit « ' + phrase + ' »';
    mascot.src = '/preston/' + file + '.webp';
    loadingSticker = true;
    try {
      await mascot.decode();
      punkDialog.showModal();
      if (!reducedMotion.matches) {
        punkDialog.animate([
          {transform: offscreen},
          {transform: 'translateY(-2%)', offset: 0.82},
          {transform: 'translateY(0)'}
        ], {duration: 640, easing: 'cubic-bezier(.2,.75,.3,1)'});
      }
    } finally {
      loadingSticker = false;
    }
  }
});
window.addEventListener('blur', () => { recentKeys = []; });

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
      securityDialog.querySelector('h2').textContent = 'Correctifs de sécurité · ' + version;
      const content = trigger.nextElementSibling.cloneNode(true);
      securityDialog.querySelector('.security-body').replaceChildren(content);
      securityDialog.showModal();
    });
  }
  securityDialog.addEventListener('click', event => {
    if (event.target === securityDialog) securityDialog.close();
  });
}

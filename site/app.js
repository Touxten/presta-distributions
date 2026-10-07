const toolbar=document.querySelector('.toolbar');
const input=toolbar.querySelector('input');
const buttons=[...toolbar.querySelectorAll('button')];
const rows=[...document.querySelectorAll('tbody tr')];
const result=document.querySelector('.results');
let filter='all';
function update(){let count=0;for(const row of rows){row.hidden=!((filter==='all'||row.dataset.kind===filter)&&row.dataset.version.toLowerCase().includes(input.value.trim().toLowerCase()));if(!row.hidden)count++;}result.hidden=false;result.textContent=count?`${count} version${count>1?'s':''} affichée${count>1?'s':''}`:'Aucune version correspondante.';}
for(const button of buttons)button.addEventListener('click',()=>{filter=button.dataset.filter;for(const b of buttons){b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));}update();});
input.addEventListener('input',update);toolbar.hidden=false;

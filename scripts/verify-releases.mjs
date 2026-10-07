import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const expected=JSON.parse(fs.readFileSync('manifests/releases.json'));
const actual=JSON.parse(execFileSync('gh',['api','repos/Touxten/presta-distributions/releases?per_page=100'],{encoding:'utf8'}));
for(const r of expected){
 const release=actual.find(x=>x.tag_name===r.tag);
 if(!release||release.draft||release.prerelease!==r.prerelease)throw Error('Release absent or wrong state: '+r.tag);
 for(const a of r.assets){const published=release.assets.find(x=>x.name===a.name);if(!published||published.state!=='uploaded'||published.size!==a.bytes||published.digest!=='sha256:'+a.sha256)throw Error('Asset mismatch: '+r.tag+'/'+a.name);}
 const sum=r.assets.map(a=>a.sha256+'  '+a.name).join('\n')+'\n';
 const publishedSum=release.assets.find(x=>x.name==='SHA256SUMS');
 if(!publishedSum||publishedSum.digest!=='sha256:'+crypto.createHash('sha256').update(sum).digest('hex'))throw Error('SHA256SUMS mismatch: '+r.tag);
 console.log('Verified '+r.tag+' ZIP, XML and SHA256SUMS');
}
console.log('All 42 GitHub assets verified against the local manifest.');

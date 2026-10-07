import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const [original,archives]=process.argv.slice(2);
if(!original||!archives) throw Error('Usage: node scripts/import.mjs original.html archives/');
const html=fs.readFileSync(original,'utf8');
const records=[];
for(const row of html.split(/<tr[^>]*>/).slice(1)){
 const version=row.match(/releases\/tag\/([^"<]+)/)?.[1];
 if(!version) continue;
 const oldZip=row.match(/href="zip\/([^"]+\.zip)"/)?.[1];
 const xml=row.match(/href="zip\/([^"]+\.xml)"/)?.[1];
 if(!xml) throw Error('Missing XML '+version);
 const zip=path.dirname(xml)+'/'+path.basename(oldZip);
 const assets=[zip,xml].map(file=>{const buffer=fs.readFileSync(path.join(archives,file));return {name:path.basename(file),path:file,bytes:buffer.length,sha256:crypto.createHash('sha256').update(buffer).digest('hex')};});
 records.push({version,tag:'v'+version,date:row.match(/<td>([^<]+)<\/td>/)?.[1],sourceCommit:row.match(/>([a-f0-9]{40})<\/a>/)?.[1],prerelease:/alpha|beta|rc/i.test(version),assets});
}
if(records.length!==14) throw Error('Expected 14 releases');
fs.writeFileSync('manifests/releases.json',JSON.stringify(records,null,2)+'\n');
for(const r of records)fs.writeFileSync(path.join(archives,path.dirname(r.assets[0].path),'SHA256SUMS'),r.assets.map(a=>a.sha256+'  '+a.name).join('\n')+'\n');
console.log('Imported '+records.length+' releases');

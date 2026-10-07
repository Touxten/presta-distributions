import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const archives=process.argv[2];
if(!archives)throw Error('Usage: node scripts/publish.mjs archives/');
const releases=JSON.parse(fs.readFileSync('manifests/releases.json'));
for(const r of [...releases].reverse()){
 const notes=`Compilation communautaire PrestaShop ${r.version}, non officielle.\n\nArchive historique reprise sans modification depuis presta.zip le 7 octobre 2026. Date de référence indiquée sur le catalogue historique : ${r.date}.\n\nSource indiquée : https://github.com/PrestaShop/PrestaShop/commit/${r.sourceCommit}\nNotes amont : https://github.com/PrestaShop/PrestaShop/releases/tag/${r.version}\n\nLe ZIP est prêt à installer ; le XML est destiné à Update Assistant. Vérifier les fichiers avec SHA256SUMS. Les empreintes ne sont pas signées et ne garantissent pas l'absence de vulnérabilités. Cette migration n'est pas une recompilation ni un audit de sécurité. Sauvegarder et tester avant toute utilisation.\n\n`+r.assets.map(a=>`${a.name}\nSHA-256 : ${a.sha256}`).join('\n\n');
 const args=['release','create',r.tag,'--repo','Touxten/presta-distributions','--target','main','--title',`PrestaShop ${r.version} — compilation communautaire`,'--notes',notes,...r.assets.map(a=>path.join(archives,a.path)),path.join(archives,path.dirname(r.assets[0].path),'SHA256SUMS')];
 if(r.prerelease)args.push('--prerelease');
 args.push(r.version==='9.2.0'?'--latest':'--latest=false');
 execFileSync('gh',args,{stdio:'inherit'});
 console.log('Published '+r.version);
}

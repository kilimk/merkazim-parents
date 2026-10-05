import {cp,mkdir,readFile,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=path.join(root,'site');
const output=path.join(root,'dist');
await rm(output,{recursive:true,force:true});
await cp(source,output,{recursive:true});
const {routes}=JSON.parse(await readFile(path.join(source,'data/content.json'),'utf8'));
const paths=['','routes','petition','community','feedback','help','guide','about',...routes.map(r=>'routes/'+r.slug)];
for(const lang of ['ru','he'])for(const route of paths){
 const dir=path.join(output,lang,route);await mkdir(dir,{recursive:true});
 await cp(path.join(source,'index.html'),path.join(dir,'index.html'));
}
await cp(path.join(source,'index.html'),path.join(output,'404.html'));
console.log(`Built dist/ with ${paths.length*2} localized routes`);

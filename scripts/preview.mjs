import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../site/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.pdf':'application/pdf','.webp':'image/webp','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return}
  if(!path.extname(pathname))file=path.join(root,'index.html');
  if(!(await stat(file)).isFile()){res.writeHead(404).end();return}
  const data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Robots-Tag':'noindex, nofollow'});res.end(data);
 }catch{res.writeHead(404).end('Not found')}
});
server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));

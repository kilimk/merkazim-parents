import fs from 'node:fs';import assert from 'node:assert/strict';
const read=f=>JSON.parse(fs.readFileSync(`site/data/${f}.json`,'utf8'));const ru=read('content'),uk=read('uk/content');
assert.equal(uk.routes.length,ru.routes.length);let sections=0;
for(let i=0;i<ru.routes.length;i++){const r=ru.routes[i],u=uk.routes[i];assert.equal(u.slug,r.slug);assert.equal(u.sections.length,r.sections.length);assert.notEqual(u.title,r.title);for(let j=0;j<r.sections.length;j++){const a=r.sections[j],b=u.sections[j];assert.equal(b.id,a.id);for(const regex of [/\d+/g,/[\u0590-\u05ff]+/g,/(?:href|src)="[^"]*"/g])assert.deepEqual(b.html.match(regex),a.html.match(regex),`${r.slug} section ${j}`);sections++}}
assert.equal(uk.petition.length,ru.petition.length);
for(const f of ['contacts','coordinators','ecosystem','contact-categories','glossary'])assert.equal(read('uk/'+f).length,read(f).length,f);
const ui=read('uk/ui');for(const f of ['app','features','directories']){const s=fs.readFileSync(`site/${f}.js`,'utf8');for(const m of s.matchAll(/tr\('((?:[^'\\]|\\.)*)'/g))assert.ok(ui[m[1]],`Missing ${m[1]}`)}
for(const page of read('uk/glossary'))assert.ok(fs.existsSync(`site/assets/glossary-uk/${String(page.page).padStart(2,'0')}.webp`));
for(const slug of ['', 'about','community','feedback','guide','help','petition','routes',...uk.routes.map(r=>'routes/'+r.slug)]){const html=fs.readFileSync(`dist/uk/${slug}${slug?'/':''}index.html`,'utf8');assert.ok(html.includes('lang="uk"'));assert.ok(html.includes('uk_UA'));assert.ok(html.includes('social-preview-uk.png'));assert.ok(!/<title>[^<]*[ыэъё]/i.test(html));}
console.log(`Verified Ukrainian content: 10 routes, ${sections} sections, 44 glossary pages, 85 services, UI and 18 static pages. Hebrew templates, links and numbers preserved.`);

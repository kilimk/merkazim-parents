import {cp,mkdir,readFile,writeFile,rm,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),source=path.join(root,'site'),output=path.join(root,'dist');
const origin=(process.env.SITE_URL||'https://merkazim-parents-feedback.kilyail.chatgpt.site').replace(/\/$/,'');
if(!/^https:\/\//.test(origin))throw Error('SITE_URL must use HTTPS');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await rm(output,{recursive:true,force:true});await cp(source,output,{recursive:true});
const data=JSON.parse(await readFile(path.join(source,'data/content.json'),'utf8'));
const template=await readFile(path.join(source,'index.html'),'utf8');
const pages={
'':['Сеть родительских комитетов Мерказим','רשת ועדי ההורים של מרכזים','Помощь родителям в системе образования Израиля: маршруты, службы, сообщество и петиция.','סיוע להורים במערכת החינוך בישראל: מדריכים, שירותים, קהילה ועצומה.'],
routes:['Что делать? Маршруты для родителей','מה עושים? מדריכים להורים','Пошаговые инструкции по десяти ситуациям: травля, учёба, адаптация, перевод и помощь ребёнку.','מדריכים להורים בנושאי בריונות, למידה, הסתגלות ותמיכה בילדים.'],
petition:['Безопасность детей — публичный показатель качества школы','מוגנות הילדים כמדד פומבי לאיכות בית הספר','Поддержите инициативу сделать безопасность каждой школы открытым и доступным показателем.','תמכו ביוזמה להפוך את המוגנות בכל בית ספר למדד גלוי ונגיש.'],
community:['Родители рядом','הורים בסביבה','Найдите родительский комитет и координаторов в вашем городе.','מצאו את קהילת ההורים והרכזים בעיר שלכם.'],
feedback:['Обратная связь','יצירת קשר','Расскажите о проблеме, опыте или предложении. Предварительная версия формы.','שתפו בעיה, ניסיון או הצעה. גרסה מקדימה של הטופס.'],
help:['Куда обратиться','למי פונים','85 служб и организаций: контакты, ситуации, часы работы и способы получить помощь.','85 שירותים וארגונים: פרטי קשר, שעות פעילות ודרכי סיוע.'],
guide:['Как устроена система образования','איך מערכת החינוך עובדת','Навигатор понятий, книга на 44 страницы и образовательная система Израиля.','מילון מושגים, מדריך בן 44 עמודים ומערכת החינוך בישראל.'],
about:['О проекте Merkazim','על מיזם Merkazim','Зачем мы создаём родительские комитеты, что хотим изменить и что уже делаем.','למה אנחנו מקימים ועדי הורים, מה רוצים לשנות ומה כבר עושים.']};
for(const r of data.routes)pages['routes/'+r.slug]=[r.title,r.titleHe,r.lead||r.title,'מדריך להורים: '+r.titleHe+'. התוכן המלא זמין בשלב זה ברוסית.'];
function pageHTML(lang,route){const h=lang==='he',info=pages[route],title=info[h?1:0],description=info[h?3:2],url=origin+'/'+lang+(route?'/'+route:'')+'/';const image=origin+'/assets/social-preview.png';
const tags=`<link rel="canonical" href="${esc(url)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Merkazim"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(url)}"><meta property="og:locale" content="${h?'he_IL':'ru_RU'}"><meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Merkazim — Сеть родительских комитетов"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${image}">`;
let body=`<h1>${esc(title)}</h1><p>${esc(description)}</p>`;const r=data.routes.find(r=>'routes/'+r.slug===route);
if(r)body+=(h?'<p>המדריך המלא מוצג ברוסית.</p>':'')+'<article class="article-body" lang="ru" dir="ltr">'+r.sections.map(s=>s.html.replace(/https:\/\/super-meringue-dce609.netlify.app\/\?utm_source=chatgpt.com/g,'/'+lang+'/community/')).join('')+'</article>';
else if(route==='petition')body+=`<p><time datetime="2026-10-27">${h?'הבחירות — 27 באוקטובר 2026':'Выборы — 27 октября 2026 года'}</time></p>`+data.petition.slice(1,-1).map((t,i)=>{if(!t)return '';const n=i+1,tag=[8,15,18,22].includes(n)?'h2':'p';const sources={11:['https://rama.gov.il/reports/students-survey2025','РАМА — опрос учеников 2024/25'],12:['https://m.knesset.gov.il/news/pressreleases/pages/press08072026s.aspx','Кнессет — публикация от 08.07.2026'],13:['/assets/105_annual_report_2025.pdf#page=2','Служба 105 — отчёт за 2025 год (PDF)']};const source=sources[n];return `<${tag} lang="ru" dir="ltr">${esc(t)}</${tag}>`+(source?`<p><a href="${source[0]}">${esc(source[1])}</a></p>`:'')}).join('');
else if(route==='guide')body+=`<a href="/assets/navigator.pdf">${h?'הורדת המדריך PDF':'Скачать навигатор PDF'}</a>`;
else if(route==='help')body+='<p><a href="tel:100">100 — Полиция</a> · <a href="tel:101">101 — Скорая помощь</a> · <a href="tel:102">102 — Пожарная охрана</a></p>';
if(route===''||route==='routes')body+='<ul>'+data.routes.map(r=>`<li><a href="/${lang}/routes/${r.slug}/">${esc(h?r.titleHe:r.title)}</a></li>`).join('')+'</ul>';
const nav='<nav>'+Object.entries(pages).filter(([key])=>!key.startsWith('routes/')).map(([key,value])=>`<a href="/${lang}/${key}${key?'/':''}">${esc(value[h?1:0])}</a>`).join(' · ')+'</nav>';
return template.replace('lang="ru" dir="ltr"',`lang="${lang}" dir="${h?'rtl':'ltr'}"`).replace(/<title>.*?<\/title>/,`<title>${esc(title)} — Merkazim</title>`).replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(description)}">\n${tags}`).replace('<div id="app"><p class="loading">Загружаем навигатор…</p></div>',`<div id="app"><main class="wrap section" id="main">${nav}${body}</main></div>`).replace(/<noscript>.*?<\/noscript>/,'<noscript><p class="wrap">Интерактивные формы, поиск и книга требуют JavaScript. Материалы маршрутов доступны выше.</p></noscript>');}
for(const lang of ['ru','he'])for(const route of Object.keys(pages)){const dir=path.join(output,lang,route);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),pageHTML(lang,route));}
await writeFile(path.join(output,'index.html'),pageHTML('ru',''));
await cp(path.join(source,'index.html'),path.join(output,'404.html'));
for(const file of await readdir(path.join(output,'data')))if(file.endsWith('.json')){const p=path.join(output,'data',file);await writeFile(p,JSON.stringify(JSON.parse(await readFile(p,'utf8'))));}
console.log(`Built ${Object.keys(pages).length*2} localized pages with static metadata and readable fallback`);

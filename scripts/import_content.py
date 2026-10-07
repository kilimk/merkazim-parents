"""Import the approved source documents without editing their substantive content."""
from pathlib import Path
from html.parser import HTMLParser
import argparse, html, json, re, zipfile
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'site/data'
OUT.mkdir(parents=True, exist_ok=True)

class Element:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def text(self):
        return ' '.join(c.text() if isinstance(c, Element) else c for c in self.children)
    def find(self, tag):
        found = []
        for c in self.children:
            if isinstance(c, Element):
                if c.tag == tag: found.append(c)
                found.extend(c.find(tag))
        return found
    def markup(self):
        if self.tag in ('script', 'style', 'img'): return ''
        body = ''.join(c.markup() if isinstance(c, Element) else html.escape(c) for c in self.children)
        if not self.tag: return body
        attrs = {}
        for k,v in self.attrs.items():
            if k in ('class','id','dir','lang','href','title','open'):
                if k == 'href' and not re.match(r'^(https?://|mailto:|tel:|#|/(?:ru|he)/)',v): continue
                attrs[k] = v or ''
        if self.tag == 'a' and attrs.get('href','').startswith('http'):
            attrs.update(target='_blank', rel='noopener noreferrer')
        a = ''.join(' '+k+'="'+html.escape(v,quote=True)+'"' for k,v in attrs.items())
        if self.tag in ('br','hr'): return '<'+self.tag+a+'>'
        return '<'+self.tag+a+'>'+body+'</'+self.tag+'>'

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.root=Element(); self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        n=Element(tag,attrs);self.stack[-1].children.append(n)
        if tag not in ('img','meta','link','br','hr','input','source','wbr'):self.stack.append(n)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag == tag:self.stack=self.stack[:i];break
    def handle_data(self,data):self.stack[-1].children.append(data)

CONFIG = [
 ('Ребенка_травят','bullying','Безопасность','בריונות בבית הספר','бойкот חרם травля изоляция насилие бьют обзывают не общаются исключили из группы'),
 ('Кибербуллинг','cyberbullying','Безопасность','פגיעה ובריונות ברשת','интернет кибербуллинг шантаж фото чат whatsapp угрозы'),
 ('Ребенок_отказывается','school-refusal','Поддержка','הילד מסרב ללכת לבית הספר','пропуски страх посещаемость кабас קבס'),
 ('Ребенку_нужна','psychological-help','Поддержка','עזרה נפשית לילדים','психолог тревога помощь שפח יועצת'),
 ('Школа_не','school-not-responding','Школа и права','בית הספר לא מגיב לפניות','директор не отвечает жалоба администрация учитель'),
 ('Как_перевести','school-transfer','Школа и права','מעבר לבית ספר אחר','перевод смена школы переезд'),
 ('Иврит_и','hebrew-support','Учёба и адаптация','עברית ותמיכה בתלמידים עולים','иврит олим репатриант адаптация часы язык'),
 ('Трудности_в','learning-difficulties','Учёба и адаптация','קשיי למידה ואבחון','диагностика дислексия учеба сдвг ADHD'),
 ('Специальное','special-education','Учёба и адаптация','חינוך מיוחד: מאיפה מתחילים','специальное образование комиссия особые потребности'),
 ('Если_подросток','missing-teenager','Безопасность','נער או נערה יצאו מהבית ונעדרים','пропал исчез ушел полиция розыск'),
]
HE_KEYWORDS={
 'bullying':'בריונות חרם נידוי אלימות בידוד',
 'cyberbullying':'בריונות ברשת אינטרנט סחיטה איומים תמונות',
 'school-refusal':'מסרב ללכת לבית הספר היעדרות ביקור סדיר',
 'psychological-help':'פסיכולוג עזרה נפשית חרדה תמיכה שפח יועצת',
 'school-not-responding':'אין מענה מבית הספר מנהל לא עונה פניות תלונה',
 'school-transfer':'מעבר העברה לבית ספר אחר',
 'hebrew-support':'עברית שעות עולים שפה תמיכה קליטה',
 'learning-difficulties':'קשיי למידה אבחון הפרעת קשב',
 'special-education':'חינוך מיוחד ועדת זכאות ואפיון',
 'missing-teenager':'נער נעדר נעלם משטרה חיפוש',
}
routes=[]
for prefix,slug,category,he,tags in CONFIG:
    source=next(p for p in (ROOT/'Content').glob('*.html') if p.name.startswith(prefix))
    p=Parser();p.feed(source.read_text())
    root=p.root; title=root.find('h1')[0].text().strip()
    lead=next((e.text().strip() for e in root.find('p') if 'lead' in e.attrs.get('class','').split()),'')
    sections=[]
    for i,s in enumerate(root.find('section')):
        heading=s.find('h3')
        label=heading[0].text().strip() if heading else 'Подробнее'
        label=re.sub(r'^[^\w\u0590-\u05ff]+','',label)
        original_id=s.attrs.get('id')
        s.attrs['id']=original_id or f'section-{i+1}'
        sections.append({'id':s.attrs['id'],'title':label,'html':s.markup()})
    routes.append({'slug':slug,'title':title,'titleHe':he,'category':category,'tags':(tags+' '+HE_KEYWORDS[slug]).split(),
                   'lead':lead,'sections':sections,'searchText':root.find('main')[0].text(), 'source':source.name})

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--petition', type=Path, help='Optional approved petition DOCX; otherwise preserve current petition text')
args=parser.parse_args()
if args.petition:
    with zipfile.ZipFile(args.petition) as z:
        xml=ET.fromstring(z.read('word/document.xml'))
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    petition=[''.join(t.text or '' for t in p.findall('.//w:t',ns)) for p in xml.findall('.//w:body/w:p',ns)]
    petition=[p for p in petition if p.strip()]
else:
    petition=json.loads((OUT/'content.json').read_text())['petition']
(OUT/'content.json').write_text(json.dumps({'routes':routes,'petition':petition},ensure_ascii=False,indent=2))
print(f'Imported {len(routes)} complete routes, {sum(len(r["sections"]) for r in routes)} sections and {len(petition)} petition paragraphs.')

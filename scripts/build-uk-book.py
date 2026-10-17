"""Build Ukrainian navigator PDF and matching book images from translated pages.
Requires reportlab, python-bidi, Pillow and pdftoppm. Run after translation updates.
"""
import json, re, subprocess, shutil, os
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
font=os.environ.get('NAVIGATOR_FONT','/System/Library/Fonts/Supplemental/Arial.ttf')
bold=os.environ.get('NAVIGATOR_BOLD_FONT','/System/Library/Fonts/Supplemental/Arial Bold.ttf')
for name,path in [('Body',font),('Bold',bold)]:pdfmetrics.registerFont(TTFont(name,path))
pages=json.loads((ROOT/'site/data/uk/glossary.json').read_text())
assert len(pages)==44, 'Complete all 44 translated pages first'
assets=ROOT/'site/assets'; out=assets/'navigator-uk.pdf'; w,h=595.276,841.89
c=canvas.Canvas(str(out),pagesize=(w,h));c.setTitle('Навігатор понять для батьків — Мерказім');c.setAuthor('Мерказім — Центри соціальної справедливості')
def wrap(text,size,width,fontname='Body'):
 lines=[];line=''
 for word in text.split():
  trial=(line+' '+word).strip()
  if pdfmetrics.stringWidth(get_display(trial),fontname,size)>width and line:lines.append(line);line=word
  else:line=trial
 if line:lines.append(line)
 return lines
for p in pages:
 c.setFillColor(HexColor('#faf7ef'));c.rect(0,0,w,h,fill=1,stroke=0)
 c.setFillColor(HexColor('#183c38'));c.setFont('Bold',10);c.drawString(42,h-38,'МЕРКАЗІМ  /  НАВІГАТОР ДЛЯ БАТЬКІВ')
 c.setStrokeColor(HexColor('#c4d1c9'));c.line(42,h-51,w-42,h-51)
 title=wrap(p['title'],21,w-84,'Bold');y=h-88
 for line in title:c.setFont('Bold',21);c.drawString(42,y,get_display(line));y-=27
 y-=18
 textlines=p['text'].splitlines()
 # Retain every source line, including headings and Hebrew terms.
 for size in [12,11.5,11,10.5,10,9.5,9]:
  layout=[(line,wrap(line,size,w-84)) for line in textlines]
  needed=sum(len(ls)*size*1.3+3 for _,ls in layout)
  if needed<y-64:break
 assert needed<y-64, (p['page'],needed,y)
 for line,ls in layout:
  hebrew=bool(re.search('[\u0590-\u05ff]',line));c.setFillColor(HexColor('#18665c' if hebrew else '#243c3a'));c.setFont('Body',size)
  for l in ls:c.drawString(42,y,get_display(l,base_dir='L'));y-=size*1.3
  y-=3
 c.setFillColor(HexColor('#627773'));c.setFont('Body',9);c.drawString(42,32,'Мережа батьківських комітетів Мерказім');c.drawRightString(w-42,32,str(p['page']));c.showPage()
c.save()
renderer=shutil.which('pdftoppm') or '/Users/kostya/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
tmp=ROOT/'tmp/pdfs/uk';tmp.mkdir(parents=True,exist_ok=True)
subprocess.run([renderer,'-scale-to','1600','-png',str(out),str(tmp/'page')],check=True)
book=assets/'glossary-uk';book.mkdir(exist_ok=True)
for file in sorted(tmp.glob('page-*.png')):
 n=int(file.stem.split('-')[-1]);Image.open(file).convert('RGB').save(book/f'{n:02}.webp',quality=86)
img=Image.new('RGB',(1200,630),'#183c38');d=ImageDraw.Draw(img)
d.text((70,65),'МЕРКАЗІМ',font=ImageFont.truetype(bold,28),fill='#dce789')
for i,line in enumerate(['Мережа батьківських','комітетів Мерказім']):d.text((70,165+i*78),line,font=ImageFont.truetype(bold,58),fill='#faf7ef')
d.text((70,430),'Підтримка батьків у системі освіти Ізраїлю',font=ImageFont.truetype(font,32),fill='#faf7ef')
img.save(assets/'social-preview-uk.png')
print('Created 44-page PDF, 44 book images, Ukrainian social preview')

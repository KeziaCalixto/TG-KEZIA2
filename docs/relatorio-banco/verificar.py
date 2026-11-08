"""Confere integridade documental sem conectar ou alterar qualquer banco."""
from pathlib import Path
import ast
import csv
import hashlib
import json
import re
from docx import Document
from pypdf import PdfReader

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[1]
STEM='prazo-claro-relatorio-banco-de-dados-2026-11-04'
OUT=ROOT/'output/documents'
schema=json.loads((BASE/'schema-inventario.json').read_text(encoding='utf8'))
manifest=json.loads((BASE/'fontes-e-manifesto.json').read_text(encoding='utf8'))
norm=lambda s:re.sub(r'\s+','',s)
for entry in schema['migrations']+manifest['sources']:
    assert hashlib.sha256((ROOT/entry['path']).read_bytes()).hexdigest()==entry['sha256'],entry['path']
for script in BASE.glob('*.py'):ast.parse(script.read_text(encoding='utf8'))
doc=Document(OUT/f'{STEM}.docx')
tables=[t for t in doc.tables if t.cell(0,0).text=='Campo']
assert len(tables)==7
for table,(name,info) in zip(tables,schema['tables'].items()):
    assert [r.cells[0].text for r in table.rows[1:]]==[c['name'] for c in info['columns']],name
    assert [r.cells[1].text for r in table.rows[1:]]==[c['type'] for c in info['columns']],name
with (BASE/'dicionario-de-dados.csv').open(encoding='utf-8-sig',newline='') as f:
    rows=list(csv.DictReader(f))
assert len(rows)==65
assert len(doc.inline_shapes)==6
pdf=PdfReader(OUT/f'{STEM}.pdf')
assert len(pdf.pages)==36
texts=[p.extract_text() for p in pdf.pages]
assert all(len(t.strip())>100 for t in texts),'Página vazia'
body=norm('\n'.join(texts[:-2]));dictionary=body.rsplit('5Dicionáriodedados',1)[1].split('6Integridadeíndiceseconsultas',1)[0]
names=list(schema['tables'])
for i,(name,info) in enumerate(schema['tables'].items()):
    section=dictionary.split(name,1)[1]
    if i+1<len(names):section=section.split(names[i+1],1)[0]
    for c in info['columns']:
        assert norm(c['name']+c['type']) in section,(name,c['name'])
    assert name in norm(texts[-2]),name
    for c in info['columns']:assert norm(c['name']+' : '+c['type']) in norm(texts[-2]),(name,c['name'],'atlas')
for name in schema['functions']:assert name in body,name
for entry in schema['indexes']:
    assert re.search(r'index\s+(\w+)',entry['sql'],re.I)[1] in body
for key in [f'P{i:02}' for i in range(1,9)]+[f'T{i:02}' for i in range(1,7)]:assert key in body,key
for p in pdf.pages[-2:]:assert float(p.mediabox.width)>float(p.mediabox.height)>800
links=pdf.pages[1]['/Annots'];assert len(links)==17
targets=[]
for a in links:
    target=pdf.get_page_number(a.get_object()['/Dest'][0].get_object())
    assert target is not None and 3<=target<34
    targets.append(target+1)
assert len(set(targets))==16 # Two appendix headings legitimately share a page.
for name in ['conceitual','fisico','agendador','persistencia','estados','infraestrutura','banco-geral-completo','arquitetura-completa']:
    for ext in ['png','svg','pdf','mmd']:assert (BASE/f'diagramas/{name}.{ext}').stat().st_size>100
private_patterns=[r'xkeysib-[A-Za-z0-9_-]{30,}',r'sb_secret_[A-Za-z0-9_-]{20,}',r'eyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+']
for pattern in private_patterns:assert not re.search(pattern,'\n'.join(texts)), 'Credencial indevida no texto'
results={'edition':'2026-11-04','verification':'document_artifacts_only','pages':len(pdf.pages),'body_pages':34,'landscape_atlas_pages':2,'tables':len(tables),'dictionary_columns':65,'final_functions':22,'explicit_indexes':7,'body_figures':6,'total_diagrams':8,'navigation_links':17,'unique_navigation_pages':len(set(targets)),'source_hashes_checked':len(manifest['sources']),'artifacts':[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [OUT/f'{STEM}.pdf',OUT/f'{STEM}.docx']]}
(BASE/'verificacao.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(results,ensure_ascii=False))

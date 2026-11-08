"""Read the rendered Word PDF and verify/update the materialized page lists."""
from pathlib import Path
import argparse, json, re, unicodedata
from pypdf import PdfReader

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('pdf',type=Path)
parser.add_argument('--write',action='store_true')
args=parser.parse_args()
manifest=json.loads((ROOT/'output/documents/relatorio-tg2-manifesto.json').read_text(encoding='utf-8'))
reader=PdfReader(args.pdf)
def norm(value):
    return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',value).encode('ascii','ignore').decode().lower())
texts=[norm(p.extract_text()) for p in reader.pages]
# The first occurrence is in the contents; the final occurrence starts the body.
start=[i for i,t in enumerate(texts) if norm('1 INTRODUÇÃO') in t][-1]
pages={};missing=[]
for heading in manifest['headings']+[{'key':'references','label':'REFERÊNCIAS'}]:
    if heading['key']=='references':
        found=[i for i in range(start,len(texts)) if any(norm(line)=='referencias' for line in reader.pages[i].extract_text().splitlines()[:3])]
    else:
        found=[i for i in range(start,len(texts)) if norm(heading['label']) in texts[i]]
    if found:pages[heading['key']]=found[0] # Cover excluded, title page counted as one.
    else:missing.append(heading['label'])
path=BASE/'paginacao-word.json'
previous=json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
changed={k:{'before':previous.get(k),'actual':v} for k,v in pages.items() if previous.get(k)!=v}
if args.write and not missing:path.write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'physical_pages':len(texts),'body_start_physical':start+1,'matched':len(pages),'missing':missing,'changed':changed,'written':args.write and not missing},ensure_ascii=False,indent=2))
raise SystemExit(1 if missing or (changed and not args.write) else 0)

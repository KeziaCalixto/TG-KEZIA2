"""Package a strict allowlist of documentation, never the workspace or env files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo
import hashlib, json, re
from pypdf import PdfReader

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[1]
OUT=ROOT/'output/documents'
NAME='prazo-claro-documentacao-tg2-2026-10-24'
artifacts=[OUT/f'prazo-claro-{suffix}' for suffix in [
    'guia-entrega-2026-10-24.docx','guia-entrega-2026-10-24.pdf',
    'relatorio-tg2-2026-10-24.docx','relatorio-tg2-2026-10-24.pdf',
    'relatorio-tg2-latex-2026-10-24.pdf']]
files=[p for p in BASE.rglob('*') if p.is_file() and p.suffix in ['.tex','.md','.json','.py','.pdf','.png'] and not any(part.startswith('.') or part=='__pycache__' for part in p.relative_to(BASE).parts)]
files+=artifacts+[ROOT/'docs/entrega/guia-do-aplicativo.md',ROOT/'docs/testing/documentacao-tg2.md']
for p in files:
    if not p.is_file():raise SystemExit(f'Missing artifact: {p.name}')
    if p.suffix in ['.tex','.md','.json','.py']:
        if re.search(r'(?:sb_secret_|xkeysib-)[A-Za-z0-9_-]{16,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY',p.read_text(encoding='utf-8')):
            raise SystemExit('Credential pattern found; package blocked.')
manifest={'edition':'2026-10-24','functional_commit':'9632fd25e9faacaf9ab7d75622febce60b30b446','status':'Para revisão da autora e do orientador','pdf_pages':{p.name:len(PdfReader(p).pages) for p in artifacts if p.suffix=='.pdf'},'files':[]}
for p in sorted(set(files)):
    manifest['files'].append({'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
manifest_path=OUT/(NAME+'-manifesto.json')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
intro='''# Prazo Claro — documentação TG2

Kezia Calixto. ADS, FATEC Campinas. Orientação: Prof. Eduardo Felipe Fonseca de Freitas.
Edição de 24/10/2026, para revisão da autora e do orientador.

Abra os arquivos Word/PDF em output/documents/. O guia é o material operacional curto; o relatório documenta concepção, engenharia, implementação, resultados e limites.
O projeto LaTeX está em docs/relatorio-tg2/: abra main.tex como documento principal. Capítulos, referências e figuras estão incluídos. Não exige BibTeX/Biber.
Os formatos usam a mesma fonte narrativa e têm paginação própria. Leia o README antes de regenerar o sumário do Word.

Este pacote contém documentação, não o aplicativo inteiro nem backup de contas/banco. Evidências completas e código estão no repositório privado TG-KEZIA2, cujo acesso depende do proprietário.
Não contém credenciais ou originais institucionais. Ficha catalográfica, aprovação, revisão jurídica e aceites pendentes exigem seus responsáveis. O recebimento do lembrete externo não foi confirmado no corte da evidência.
O manifesto identifica os arquivos por SHA-256.
'''
zip_path=OUT/(NAME+'.zip')
def write(z,arc,data):
    info=ZipInfo(arc,date_time=(2026,10,24,0,0,0));info.compress_type=ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,data)
with ZipFile(zip_path,'w') as z:
    write(z,'LEIA-ME.md',intro.encode('utf-8'))
    for p in sorted(set(files)):write(z,p.relative_to(ROOT).as_posix(),p.read_bytes())
    write(z,manifest_path.name,manifest_path.read_bytes())
with ZipFile(zip_path) as z:
    assert z.testzip() is None
    assert not any('.env' in p or '/.git/' in p or 'FATEC-CAMPINAS/' in p for p in z.namelist())
    for item in manifest['files']:assert hashlib.sha256(z.read(item['path'])).hexdigest()==item['sha256']
digest=hashlib.sha256(zip_path.read_bytes()).hexdigest()
(OUT/(NAME+'.sha256')).write_text(digest+'  '+zip_path.name+'\n',encoding='ascii')
print(json.dumps({'zip':zip_path.name,'files':len(files)+2,'bytes':zip_path.stat().st_size,'sha256':digest,'pdf_pages':manifest['pdf_pages'],'integrity':'verified'},ensure_ascii=False))

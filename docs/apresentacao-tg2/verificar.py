"""Conferência documental dos materiais exportados; não executa testes do app."""
from pathlib import Path
from zipfile import ZipFile
from hashlib import sha256
import json
import re
import unicodedata
import xml.etree.ElementTree as ET
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/presentations'
BUILD = ROOT / 'tmp/apresentacao-tg2'
NS = {'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
DATA = json.loads((ROOT / 'docs/apresentacao-tg2/conteudo.json').read_text(encoding='utf8'))

def normalize(text):
    return re.sub(r'\s+', '', unicodedata.normalize('NFKC', text)).lower()

def digest(path):
    return sha256(path.read_bytes()).hexdigest()

def inventory(path, require_notes=False):
    with ZipFile(path) as z:
        size = ET.fromstring(z.read('ppt/presentation.xml')).find('p:sldSz', NS).attrib
        slides = sorted([n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml', n)], key=lambda x: int(re.search(r'(\d+)\.xml', x)[1]))
        texts = ['\n'.join(ET.fromstring(z.read(n)).itertext()) for n in slides]
        notes = [n for n in z.namelist() if re.fullmatch(r'ppt/notesSlides/notesSlide\d+\.xml', n)]
        if require_notes:
            assert all(len(''.join(ET.fromstring(z.read(n)).itertext())) > 100 for n in notes)
        assets = {sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith('ppt/media/')}
        return size, texts, notes, assets

results = {}
for kind, template, count in [
    ('apresentacao', 'MODELO_DE_APRESENTACAO_TGI_II_-1.pptx', 20),
    ('poster', 'MODELO_DE_POSTER_PARA_APRESENTACAO_DO_PTG-1-1.pptx', 1),
]:
    stem = f'prazo-claro-{kind}-tg2-2026-10-24'
    pptx, pdf = OUT / f'{stem}.pptx', OUT / f'{stem}.pdf'
    original = ROOT / 'docs/FATEC-CAMPINAS/APRESENTACAO' / template
    size, texts, notes, assets = inventory(pptx, require_notes=True)
    original_size, _, _, source_assets = inventory(original)
    assert size['cx'] == original_size['cx'] and size['cy'] == original_size['cy']
    assert len(texts) == len(notes) == count
    assert len(assets & source_assets) >= 2, 'Os dois logotipos devem conservar os bytes originais.'
    assert digest(pptx) == digest(BUILD / f'{kind}-draft.pptx'), 'Final difere do candidato renderizado.'
    assert digest(pdf) == digest(BUILD / f'{kind}-draft.pdf')
    assert not re.search(r'xxxxx|TÍTULO DA PESQUISA|Nome do autor e orientador|1º Sem\. 2022', '\n'.join(texts), re.I)
    reader = PdfReader(pdf)
    assert len(reader.pages) == count
    for page in reader.pages:
        assert abs(float(page.mediabox.width) - int(size['cx']) / 12700) < .1
        assert abs(float(page.mediabox.height) - int(size['cy']) / 12700) < .1
    pdf_texts = [normalize(p.extract_text()) for p in reader.pages]
    if kind == 'apresentacao':
        for slide, text in zip(DATA['slides'], pdf_texts):
            assert normalize(slide['title']) in text, slide['title']
            for row in slide.get('table', []):
                for value in row:
                    assert normalize(value) in text, value
    else:
        text = pdf_texts[0]
        for heading in ['INTRODUÇÃO', 'REVISÃO BIBLIOGRÁFICA', 'MATERIAIS E MÉTODOS', 'CONSIDERAÇÕES FINAIS', 'REFERÊNCIAS']:
            assert normalize(heading) in text, heading
        for key in ['intro', 'literature', 'methods', 'conclusion', 'references']:
            assert all(normalize(v) in text for v in DATA['poster'][key]), key
        assert normalize(DATA['poster']['results']) in text
        assert normalize(DATA['poster']['example']) in text
    receipt = json.loads((BUILD / f'{kind}-validation.json').read_text(encoding='utf8'))
    assert receipt['firstPartyImport']['passed']
    results[kind] = {'pages': count, 'size_emu': size, 'preserved_image_hashes': len(assets & source_assets),
                     'pptx_sha256': digest(pptx), 'pdf_sha256': digest(pdf), 'template_sha256': digest(original),
                     'notes': len(notes), 'final_matches_rendered_draft': True,
                     'package_findings': receipt['packageIntegrity']['findingCount'],
                     'layout_findings': receipt['presentationLayout']['findingCount'],
                     'layout_warnings': receipt['presentationLayout']['warnings']}

destination = ROOT / 'docs/testing/artifacts/apresentacao-tg2-verificacao.json'
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(results, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
print(json.dumps(results, ensure_ascii=False, indent=2))

"""Pacote de uso dos slides e pôster, por lista explícita de arquivos."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
from hashlib import sha256
import json

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output/presentations'
NAME = 'prazo-claro-materiais-apresentacao-tg2-2026-10-24'
files = {}
for kind in ['apresentacao', 'poster']:
    for suffix in ['pptx', 'pdf']:
        filename = f'prazo-claro-{kind}-tg2-2026-10-24.{suffix}'
        files[filename] = (OUT / filename).read_bytes()
files['roteiro-de-fala.md'] = (ROOT / 'docs/apresentacao-tg2/roteiro-de-fala.md').read_bytes()
files['LEIA-ME.md'] = '''# Prazo Claro — apresentação do TG II

Autora: Kezia Calixto. FATEC Campinas, Análise e Desenvolvimento de Sistemas.
Orientação: Prof. Eduardo Felipe Fonseca de Freitas. Edição: 24/10/2026.

O PowerPoint da apresentação tem 20 slides, incluindo dois de apoio, com notas de fala e fontes. O roteiro sugere um ensaio de 16 min 5 s, incluindo demonstração; confirmar o tempo oficial com a orientação.

O PowerPoint do pôster tem uma página de aproximadamente 90 × 100 cm, conforme o modelo institucional fornecido. Os dois PDFs correspondem aos respectivos arquivos editáveis. Solicitar escala 100% à gráfica e confirmar dimensões, acabamento e margem de segurança antes de imprimir. O PDF do pôster é RGB, sem sangria ou certificação PDF/X.

Os e-mails acadêmicos da autora e do orientador não foram fornecidos e foram omitidos. Confirmar os contatos antes da submissão, se exigidos. O link do sistema está nos materiais. Revisar textos, ensaiar a fala e preparar uma conta de teste para a demonstração. Guardar o PDF para uma apresentação sem internet.

Editar o PPTX não atualiza automaticamente o PDF, o roteiro ou o relatório. Depois de mudanças, exportar e conferir novamente. Textos e tabelas são editáveis; logotipos e captura da interface são imagens incorporadas. Originais institucionais completos, configuração privada e código-fonte do aplicativo não fazem parte deste pacote.

Dados técnicos e limites seguem o relatório: base funcional 9632fd2 e CI 40061653068. Calendários parciais e revisão jurídica pendente. Recebimento externo de lembrete ainda sujeito a aceite no corte documental. Estes materiais não comprovam aprovação acadêmica ou certificação jurídica.
'''.encode('utf8')
manifest = {'edition': '2026-10-24', 'files': [
    {'path': name, 'bytes': len(data), 'sha256': sha256(data).hexdigest()}
    for name, data in sorted(files.items())
]}
files['manifesto.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode('utf8')
target = OUT / f'{NAME}.zip'
with ZipFile(target, 'w') as z:
    for name, data in sorted(files.items()):
        info = ZipInfo(name, (2026, 10, 24, 12, 0, 0))
        info.compress_type = ZIP_DEFLATED
        z.writestr(info, data)
with ZipFile(target) as z:
    assert z.testzip() is None
    assert set(z.namelist()) == set(files)
    for item in manifest['files']:
        assert sha256(z.read(item['path'])).hexdigest() == item['sha256']
archive_hash = sha256(target.read_bytes()).hexdigest()
(OUT / f'{NAME}.sha256').write_text(f'{archive_hash}  {target.name}\n', encoding='utf8')
(OUT / f'{NAME}-manifesto.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
print(json.dumps({'file': str(target), 'entries': len(files), 'bytes': target.stat().st_size, 'sha256': archive_hash}, ensure_ascii=False))

"""Adaptador de conversão local; mantém a rasterização do render_docx oficial."""
from pathlib import Path
import importlib.util
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'tmp/relatorio-banco'
SKILL = Path.home()/'.codex/plugins/cache/openai-primary-runtime/documents/26.1030.10813/skills/documents'
spec = importlib.util.spec_from_file_location('database_docx_renderer', SKILL/'render_docx.py')
renderer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
fonts=BASE/'fonts'
fonts.mkdir(parents=True,exist_ok=True)
for name in ['times.ttf','timesbd.ttf','timesbi.ttf','timesi.ttf','arial.ttf','arialbd.ttf','consola.ttf','consolab.ttf']:
    source=Path('C:/Windows/Fonts')/name
    if source.exists():shutil.copy2(source,fonts/name)
image=subprocess.check_output(['docker','image','inspect','--format','{{.Id}}','stirlingtools/stirling-pdf:latest'],text=True).strip()
assert image.startswith('sha256:')

def convert(doc_path,user_profile,convert_tmp_dir,stem,verbose):
    path=Path(doc_path).resolve();output=Path(convert_tmp_dir).resolve();staging=BASE/'input';staging.mkdir(parents=True,exist_ok=True)
    shutil.copy2(path,staging/path.name)
    cmd=['docker','run','--rm','--network','none','--memory','1g','--cpus','1','--pids-limit','192','--security-opt','no-new-privileges',
         '--env','HOME=/tmp','--env','XDG_CACHE_HOME=/tmp/cache','--env','GSETTINGS_BACKEND=memory',
         '--mount',f'type=bind,source={staging.resolve()},target=/input,readonly',
         '--mount',f'type=bind,source={output},target=/output',
         '--mount',f'type=bind,source={fonts.resolve()},target=/usr/local/share/fonts/task,readonly',
         '--entrypoint','/usr/bin/soffice',image,'-env:UserInstallation=file:///tmp/lo-profile','--headless','--norestore',
         '--convert-to','pdf','--outdir','/output',f'/input/{path.name}']
    r=subprocess.run(cmd,capture_output=True,text=True,timeout=180)
    log=f'Converter image {image}\nexit={r.returncode}\n{r.stdout}\n{r.stderr}'
    (BASE/'conversao.log').write_text(log,encoding='utf8')
    result=output/f'{stem}.pdf'
    return (str(result) if result.exists() and result.stat().st_size else '',log)

renderer.convert_to_pdf=convert
if __name__=='__main__':renderer.main()

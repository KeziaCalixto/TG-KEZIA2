"""Generate the editable academic report and LaTeX from the same reviewed source.

Dependencies: python-docx, reportlab, Pillow; Poppler pdftoppm for diagram PNGs.
Run at any cwd: python docs/relatorio-tg2/gerar_documentos.py
Optional --pages <json> supplies verified Word pagination for the static lists.
"""
from pathlib import Path
import argparse, json, re, shutil, subprocess, math
from xml.sax.saxutils import escape as xml_escape
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.enum.section import WD_SECTION_START
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, black, white
from PIL import Image

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[1]
OUT = ROOT / 'output/documents'
FIG = BASE / 'figuras'
CHAPTERS = BASE / 'capitulos'
for folder in [OUT, FIG, CHAPTERS]: folder.mkdir(parents=True, exist_ok=True)
META = json.loads((BASE / 'metadados.json').read_text(encoding='utf-8'))
REFS = json.loads((BASE / 'referencias.json').read_text(encoding='utf-8'))
parser = argparse.ArgumentParser()
parser.add_argument('--pages', type=Path)
args = parser.parse_args()
PAGES = json.loads(args.pages.read_text(encoding='utf-8')) if args.pages else {}

def citation(text):
    return re.sub(r'\[([A-Z0-9]+)\]', lambda m: '(' + REFS[m[1]]['cite'] + ')', text)

def tx(value):
    mapping = {'\\':r'\textbackslash{}','&':r'\&','%':r'\%','$':r'\$','#':r'\#','_':r'\_','{':r'\{','}':r'\}','~':r'\textasciitilde{}','^':r'\textasciicircum{}','º':r'\textordmasculine{}','ª':r'\textordfeminine{}','§':r'\S{}'}
    return ''.join(mapping.get(c,c) for c in value).replace('→',r'$\rightarrow$').replace('–','--').replace('—','---')

def tex_inline(text):
    chunks = re.split(r'(\[[A-Z0-9]+\])', text)
    return ''.join(r'\hyperref[ref:'+part[1:-1]+']{'+tx('('+REFS[part[1:-1]]['cite']+')')+'}' if re.fullmatch(r'\[[A-Z0-9]+\]',part) else tx(part) for part in chunks)

def parse_source():
    lines=(BASE/'conteudo.md').read_text(encoding='utf-8').splitlines()
    blocks=[]; idx=0; chapter=0; section=0; appendix=0; figures=0; quadros=0; tables=0
    while idx<len(lines):
        line=lines[idx].strip()
        if not line: idx+=1; continue
        if line.startswith('# '):
            section=0; title=line[2:]
            if title.startswith('APÊNDICE '):
                appendix+=1; number=chr(64+appendix); title=title.split(' — ',1)[1]
                label=f'APÊNDICE {number} — {title.upper()}'
            else:
                chapter+=1; number=str(chapter); label=f'{number} {title.upper()}'
            blocks.append({'kind':'chapter','number':number,'title':title,'label':label,'key':f'chapter-{number}','appendix':bool(appendix)})
        elif line.startswith('## '):
            section+=1; label=f'{number}.{section} {line[3:]}'
            blocks.append({'kind':'section','title':line[3:],'label':label,'key':f'section-{number}-{section}'})
        elif line.startswith('@figure '):
            figures+=1; name,title=line[8:].split('|',1)
            blocks.append({'kind':'figure','name':name,'title':title,'label':f'Figura {figures} — {title}','key':f'figure-{figures}','number':figures})
        elif line.startswith('@table '):
            typ,title=line[7:].split('|',1)
            if typ=='Quadro': quadros+=1; num=quadros
            else: tables+=1; num=tables
            rows=[]; idx+=1
            while idx<len(lines) and lines[idx].strip().startswith('|'):
                cells=[x.strip() for x in lines[idx].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[-: ]+',x) for x in cells): rows.append(cells)
                idx+=1
            blocks.append({'kind':'table','type':typ,'title':title,'rows':rows,'number':num,'label':f'{typ} {num} — {title}','key':f'{typ.lower()}-{num}'})
            continue
        elif line.startswith('```'):
            content=[]; idx+=1
            while idx<len(lines) and not lines[idx].startswith('```'):
                content.append(lines[idx]); idx+=1
            blocks.append({'kind':'code','lines':content})
        else: blocks.append({'kind':'paragraph','text':line})
        idx+=1
    return blocks

BLOCKS=parse_source()
FONT='Helvetica'
fontfile=Path('C:/Windows/Fonts/arial.ttf')
if fontfile.exists():
    pdfmetrics.registerFont(TTFont('DiagramArial',str(fontfile))); FONT='DiagramArial'

def wrapped(value,width,size=10):
    result=[]
    for original in value.split('\n'):
        current=''
        for word in original.split():
            candidate=(current+' '+word).strip()
            if pdfmetrics.stringWidth(candidate,FONT,size)>width and current: result.append(current); current=word
            else: current=candidate
        result.append(current)
    return result

def diagram(name,width,height,draw):
    c=canvas.Canvas(str(FIG/(name+'.pdf')),pagesize=(width,height))
    c.setTitle(name+' — Prazo Claro'); c.setAuthor('Projeto Prazo Claro')
    c.setFillColor(white); c.rect(0,0,width,height,fill=1,stroke=0)
    def box(x,y,w,h,text,fill='#EDF2F5',size=10):
        c.setStrokeColor(HexColor('#52616B')); c.setLineWidth(.7)
        c.setFillColor(HexColor(fill)); c.roundRect(x,y,w,h,5,fill=1,stroke=1)
        lines=wrapped(text,w-14,size)
        if len(lines)*(size+3)>h-10: raise ValueError(f'Box overflow {name}: {text}')
        c.setFillColor(black); c.setFont(FONT,size)
        start=y+h/2+(len(lines)-1)*(size+3)/2-size/3
        for i,line in enumerate(lines): c.drawCentredString(x+w/2,start-i*(size+3),line)
    def arrow(points,label=None,pos=None):
        c.setStrokeColor(HexColor('#344955'));c.setFillColor(HexColor('#344955'));c.setLineWidth(.8)
        p=c.beginPath();p.moveTo(*points[0])
        for point in points[1:]: p.lineTo(*point)
        c.drawPath(p)
        a,b=points[-2:]; angle=math.atan2(b[1]-a[1],b[0]-a[0]);length=6
        p=c.beginPath();p.moveTo(*b)
        for delta in [2.65,-2.65]: p.lineTo(b[0]+length*math.cos(angle+delta),b[1]+length*math.sin(angle+delta))
        p.close();c.drawPath(p,fill=1)
        if label:
            px,py=pos or ((a[0]+b[0])/2,(a[1]+b[1])/2+5)
            c.setFont(FONT,8.5); c.setFillColor(black); c.drawCentredString(px,py,label)
    def note(x,y,text,size=9):
        c.setFont(FONT,size);c.setFillColor(black)
        for i,line in enumerate(text.split('\n')):c.drawString(x,y-i*(size+4),line)
    draw(box,arrow,note,c);c.showPage();c.save()
    subprocess.run(['pdftoppm','-scale-to','1800','-singlefile','-png',str(FIG/(name+'.pdf')),str(FIG/name)],check=True,capture_output=True)

def make_figures():
    diagram('contexto',500,280,lambda b,a,n,c:(
        b(10,190,115,60,'Visitante\nCalcula e consulta'),b(10,65,115,70,'Conta autenticada\nHistórico e lembrete'),
        b(180,100,140,110,'PRAZO CLARO\nInterface, aplicação e motor'),b(375,180,115,65,'Supabase\nAuth e dados'),b(375,65,115,65,'Brevo\nE-mails'),
        a([(125,220),(150,220),(150,175),(180,175)]),a([(125,100),(180,125)]),
        a([(320,180),(350,180),(350,210),(375,210)]),a([(320,125),(350,125),(350,100),(375,100)]),
        n(10,25,'Consulta normativa: catálogos versionados internos; revisão jurídica ainda pendente.')
    ))
    diagram('dominio',500,330,lambda b,a,n,c:(
        b(10,235,140,75,'Entrada de cálculo\nPerfil, evento e duração\nCondições declaradas'),
        b(185,235,130,75,'Regra versionada\nÂmbito e método\nVigência e revisão'),
        b(350,235,140,75,'Calendário versionado\nCobertura e eventos\nCompletude e fontes'),
        b(175,100,150,90,'Resultado / memória\nMarcos e vencimento\nSnapshot e versões\nAvisos e estado'),
        b(10,10,140,65,'Decisão diária\nData, ordinal, motivos\nReferências e fase'),
        b(350,10,140,65,'Fonte normativa\nÓrgão, dispositivo\nURL e consulta'),
        a([(80,235),(80,145),(175,145)],'informa',(100,160)),
        a([(250,235),(250,190)],'aplica',(275,212)),
        a([(420,235),(420,145),(325,145)],'seleciona',(410,160)),
        a([(175,115),(80,75)],'compõe',(105,102)),a([(325,115),(420,75)],'preserva',(405,102))
    ))
    diagram('arquitetura',500,290,lambda b,a,n,c:(
        b(10,205,140,65,'Apresentação\nPáginas e componentes\nReact / Next.js'),b(180,205,140,65,'Aplicação / HTTP\nValidação e seleção\nCasos de uso'),
        b(350,205,140,65,'Domínio puro\nMotor e contratos\nSem rede ou relógio'),b(180,70,140,65,'Adaptadores\nAuth, Data API\nDispatcher de e-mail'),
        b(350,70,140,65,'Catálogos internos\nRegras, atos\nCalendários e fontes'),b(10,70,140,65,'Serviços externos\nSupabase / Brevo\nVercel hospeda'),
        a([(150,238),(180,238)]),a([(320,238),(350,238)]),a([(250,205),(250,135)]),a([(420,135),(420,205)]),a([(180,103),(150,103)]),
        n(10,22,'As setas representam dependências e chamadas; o domínio não importa os adaptadores.')
    ))
    diagram('dados',500,320,lambda b,a,n,c:(
        b(10,225,140,70,'auth.users\nPK id\nIdentidade gerenciada'),b(185,225,155,70,'deadline_calculations\nPK id; FK owner_id\ninput / result_snapshot'),
        b(365,225,125,70,'deadline_reminders\nPK id\nFK cálculo e dono'),
        b(10,75,140,65,'legal_sources\nPK id\nFonte e revisão'),b(185,75,155,65,'legal_rule_versions\nPK id; FK source_id\nUNIQUE chave/versão'),
        b(365,75,125,65,'calendar_versions\nPK id\nUNIQUE chave/versão'),
        a([(150,260),(185,260)],'1 : N',(166,274)),a([(340,260),(365,260)],'1 : N',(352,274)),
        a([(75,295),(75,310),(425,310),(425,295)]),
        a([(150,108),(185,108)],'1 : N',(166,122)),
        n(10,42,'Snapshot do cálculo guarda versões em JSONB, sem FK aos catálogos remotos.'),
        n(10,24,'Schema reminder_private: configuração e invocações operacionais; não exposto pela API.')
    ))
    diagram('calculo',500,420,lambda b,a,n,c:(
        b(135,355,230,50,'Validar entrada, perfil e versões'),b(135,270,230,50,'Resolver ato, comunicação e marcos'),
        b(135,185,230,50,'Avaliar a próxima data civil\nCobertura, suspensão e expediente'),
        b(135,100,230,50,'Registrar decisão e consumir\nunidade conforme o perfil'),b(135,15,230,50,'Avaliar prorrogação e retornar\nmemória provisória ou incompleta'),
        a([(250,355),(250,320)]),a([(250,270),(250,235)]),a([(250,185),(250,150)]),a([(250,100),(250,65)]),
        a([(365,125),(420,125),(420,210),(365,210)],'continuar',(450,168)),
        n(10,326,'Impedimento\n→ incompleto',8),n(10,240,'Sem data final\ninventada',8),
        n(10,75,'Cada perfil possui\ninício e curso\npróprios.',8)
    ))
    def auth(b,a,n,c):
        xs=[65,245,425]
        for x,t in zip(xs,['Navegador','Aplicação','Supabase / e-mail']):
            b(x-60,270,120,45,t)
            c.setStrokeColor(HexColor('#A3ADB5'));c.setDash(3,3);c.line(x,260,x,15);c.setDash()
        a([(65,245),(245,245)],'1. Solicita cadastro',(155,253))
        a([(245,205),(425,205)],'2. Cadastra / envia confirmação',(335,213))
        a([(245,165),(65,165)],'3. Página de orientação',(155,173))
        a([(425,125),(65,125)],'4. Pessoa abre o link no mesmo navegador',(245,133))
        a([(65,85),(245,85)],'5. Callback com código',(155,93))
        a([(245,45),(425,45)],'6. Troca PKCE e sessão SSR',(335,53))
    diagram('autenticacao',500,330,auth)
    diagram('lembretes',500,300,lambda b,a,n,c:(
        b(10,210,115,55,'pending\nAgendado'),b(190,210,120,55,'processing\nReservado'),b(375,210,115,55,'accepted\nAceito pelo serviço'),
        b(190,95,120,55,'uncertain\nConferir envio'),b(375,95,115,55,'failed\nNão enviado'),b(10,95,115,55,'cancelled\nCancelado'),
        a([(125,238),(190,238)],'claim',(157,250)),a([(310,238),(375,238)],'aceite',(342,250)),
        a([(250,210),(250,150)],'ambiguidade',(286,175)),a([(310,225),(345,225),(345,122),(375,122)]),
        a([(65,210),(65,150)],'cancelar',(100,178)),a([(190,220),(155,220),(155,122),(125,122)]),
        n(10,55,'Falha anterior ao POST pode retornar a pending, dentro de janela e tentativas limitadas.'),
        n(10,36,'Após possível aceite não há repetição automática. Cancelar não recolhe mensagem em curso.'),
        n(10,17,'Exclusão do cálculo remove o lembrete associado em cascata.')
    ))
    diagram('implantacao',500,320,lambda b,a,n,c:(
        b(10,225,125,65,'Navegador\nHTTPS\nSessão do usuário'),b(190,225,135,65,'Vercel production\nNext.js e dispatcher\nSegredos no servidor'),
        b(375,225,115,65,'Brevo\nSMTP de Auth\nAPI de lembretes'),b(10,70,125,80,'Supabase Auth\nPostgreSQL + RLS\nHistórico e fila'),
        b(190,70,135,80,'Supabase Cron\npg_net + Vault\nNonce / assinatura'),b(375,70,115,80,'GitHub\nCódigo e migrations\nCI por versão'),
        a([(135,258),(190,258)]),a([(325,258),(375,258)]),a([(220,225),(220,190),(75,190),(75,150)]),
        a([(258,150),(258,225)],'chamada assinada',(307,185)),a([(135,110),(190,110)]),
        a([(432,150),(432,185),(325,185),(325,225)]),
        n(10,33,'Preview e desenvolvimento usam configuração isolada; não recebem despacho de produção.'),
        n(10,15,'Probe confere prontidão sem enviar mensagem. Recebimento exige aceite do destinatário.')
    ))
    # A factual crop increases text legibility without altering the captured interface.
    src=ROOT/'docs/testing/artifacts/production-multi-regime-2026-10-23.png'
    Image.open(src).crop((890,320,1410,1190)).save(FIG/'tela-calculadora.png')
    shutil.copy2(ROOT/'docs/testing/artifacts/signup-confirmation-desktop.png', FIG/'tela-confirmacao.png')

def figure_source(block):
    if block['name']=='tela-calculadora': return 'Fonte: captura da aplicação publicada em 23/10/2026, recorte do resultado; acervo do projeto.'
    if block['name']=='tela-confirmacao': return 'Fonte: captura de teste controlado da aplicação, 24/10/2026; sem dados reais de conta.'
    return 'Fonte: elaboração para este relatório a partir do código e da documentação do Prazo Claro (2026).'

def make_latex():
    before=[]; after=[]; current=before; files=[]; filename=None; chunk=[]
    def flush():
        if filename:
            (CHAPTERS/filename).write_text('\n'.join(chunk).rstrip()+'\n',encoding='utf-8')
            files.append((filename,current is after))
    for block in BLOCKS:
        kind=block['kind']
        if kind=='chapter':
            flush(); current=after if block['appendix'] else before;filename=f"{block['number'].lower()}.tex";chunk=[]
            chunk += [r'\chapter{'+tx(block['title'].upper())+'}',r'\label{'+block['key']+'}']
        elif kind=='section': chunk += [r'\section{'+tx(block['title'])+'}',r'\label{'+block['key']+'}']
        elif kind=='paragraph': chunk += [tex_inline(block['text'])+'\n']
        elif kind=='code':
            chunk += [r'\begin{quote}\begin{singlespace}\raggedright\ttfamily\footnotesize']
            chunk += [r'\hspace*{'+str((len(line)-len(line.lstrip()))*.5)+'em}'+tx(line.strip())+r'\\' for line in block['lines']]
            chunk += [r'\end{singlespace}\end{quote}']
        elif kind=='figure':
            name=block['name'];ext='pdf' if (FIG/(name+'.pdf')).exists() else 'png'
            maxheight='.58' if name=='tela-calculadora' else '.39' if name=='tela-confirmacao' else '.49'
            chunk += [r'\begin{figure}[H]\centering',r'\caption{'+tx(block['title'])+'}',r'\label{'+block['key']+'}',
                r'\includegraphics[width=\linewidth,height='+maxheight+r'\textheight,keepaspectratio]{figuras/'+name+'.'+ext+'}',
                r'\par\smallskip{\fontsize{10}{12}\selectfont '+tx(figure_source(block))+'}',r'\end{figure}']
        elif kind=='table':
            env='quadro' if block['type']=='Quadro' else 'table'; rows=block['rows'];cols=len(rows[0]); numeric=env=='table'
            colspec='|'+'|'.join([r'>{\raggedright\arraybackslash}X']*cols)+'|' if not numeric else ''.join([r'>{\raggedright\arraybackslash}X']*cols)
            chunk += [r'\begin{'+env+r'}[H]\centering',r'\caption{'+tx(block['title'])+'}',r'\label{'+block['key']+'}',r'\begin{singlespace}\fontsize{10}{12}\selectfont',r'\begin{tabularx}{\linewidth}{'+colspec+'}',r'\hline']
            for ri,row in enumerate(rows):
                chunk += [' & '.join((r'\textbf{'+tex_inline(cell)+'}') if ri==0 else tex_inline(cell) for cell in row)+r' \\']
                if not numeric or ri in [0,len(rows)-1]:chunk += [r'\hline']
            chunk += [r'\end{tabularx}\end{singlespace}',r'\par\smallskip{\fontsize{10}{12}\selectfont Fonte: elaboração com base nos registros do projeto (2026).}',r'\end{'+env+'}']
    flush()
    bib=[r'\chapter*{REFERÊNCIAS}\phantomsection\addcontentsline{toc}{chapter}{REFERÊNCIAS}',r'\begin{singlespace}\setlength{\parindent}{0pt}\setlength{\parskip}{12pt}\raggedright']
    for key,ref in sorted(REFS.items(),key=lambda it:it[1]['text']):
        bib += [r'\phantomsection\label{ref:'+key+'}'+tx(ref['text'])+r' Disponível em: \url{'+ref['url']+r'}. Acesso em: 24 out. 2026.\par']
    bib += [r'\end{singlespace}']
    (BASE/'referencias.tex').write_text('\n'.join(bib),encoding='utf-8')
    tex=r'''\documentclass[12pt,a4paper,oneside]{report}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[english]{babel}
\babelprovide[import,main]{brazilian}
\usepackage{mathptmx}
\usepackage[left=3cm,right=2cm,top=3cm,bottom=2cm,headheight=15pt,headsep=18pt]{geometry}
\usepackage{setspace,graphicx,float,tabularx,array,caption,titlesec,fancyhdr,xurl,indentfirst}
\usepackage[hidelinks,unicode]{hyperref}
\hypersetup{pdftitle={Prazo Claro — Sistema de contagem de prazos processuais brasileiros},pdfauthor={Kezia Calixto},pdfsubject={Trabalho de Graduação II — versão para revisão}}
\selectlanguage{brazilian}
\onehalfspacing
\setlength{\parindent}{1.25cm}
\setlength{\parskip}{0pt}
\setlength{\emergencystretch}{3em}
\titleformat{\chapter}[block]{\normalfont\bfseries\fontsize{14}{18}\selectfont}{\thechapter}{1em}{}
\titlespacing*{\chapter}{0pt}{0pt}{24pt}
\titleformat{\section}{\normalfont\bfseries\fontsize{12}{16}\selectfont}{\thesection}{1em}{}
\titlespacing*{\section}{0pt}{18pt}{12pt}
\DeclareCaptionFont{tgcaption}{\fontsize{10}{12}\selectfont}
\captionsetup{font={tgcaption,stretch=1},labelfont=normalfont,labelsep=endash,position=top}
\counterwithout{figure}{chapter}
\counterwithout{table}{chapter}
\floatstyle{plaintop}
\newfloat{quadro}{H}{loq}
\floatname{quadro}{Quadro}
\newcommand{\listquadros}{\listof{quadro}{LISTA DE QUADROS}}
\renewcommand{\contentsname}{SUMÁRIO}
\renewcommand{\listfigurename}{LISTA DE FIGURAS}
\renewcommand{\listtablename}{LISTA DE TABELAS}
\addto\captionsbrazilian{\renewcommand{\contentsname}{SUMÁRIO}\renewcommand{\listfigurename}{LISTA DE FIGURAS}\renewcommand{\listtablename}{LISTA DE TABELAS}}
\pagestyle{fancy}\fancyhf{}\fancyhead[R]{\fontsize{10}{12}\selectfont\thepage}
\renewcommand{\headrulewidth}{0pt}
\fancypagestyle{plain}{\fancyhf{}\fancyhead[R]{\fontsize{10}{12}\selectfont\thepage}\renewcommand{\headrulewidth}{0pt}}
\setcounter{tocdepth}{1}
\begin{document}
\renewcommand{\contentsname}{SUMÁRIO}
\renewcommand{\listfigurename}{LISTA DE FIGURAS}
\renewcommand{\listtablename}{LISTA DE TABELAS}
\pagestyle{empty}
\fancypagestyle{plain}{\fancyhf{}\renewcommand{\headrulewidth}{0pt}}
\hypersetup{pageanchor=false}
\begin{titlepage}\centering
{\bfseries CENTRO ESTADUAL DE EDUCAÇÃO TECNOLÓGICA PAULA SOUZA\par
FACULDADE DE TECNOLOGIA DE CAMPINAS\par
Curso de Análise e Desenvolvimento de Sistemas\par}
\vspace{2.3cm}
Kezia Calixto\par
\vfill
{\bfseries\fontsize{14}{20}\selectfont PRAZO CLARO\par
Sistema de contagem de prazos processuais brasileiros\par}
\vfill
Campinas — SP\par 2026
\end{titlepage}
\setcounter{page}{1}
\hypersetup{pageanchor=true}
\thispagestyle{empty}
\begin{center}Kezia Calixto\end{center}
\vspace{2.2cm}
\begin{center}\bfseries\fontsize{14}{20}\selectfont PRAZO CLARO\par
Sistema de contagem de prazos processuais brasileiros\end{center}
\vspace{2cm}
\begin{flushright}\begin{minipage}{.54\textwidth}\begin{singlespace}
Trabalho de Graduação II apresentado à Faculdade de Tecnologia de Campinas, do Centro Estadual de Educação Tecnológica Paula Souza, como requisito parcial para obtenção do título de Tecnóloga em Análise e Desenvolvimento de Sistemas.\par\medskip
Orientador: Prof. Eduardo Felipe Fonseca de Freitas.
\end{singlespace}\end{minipage}\end{flushright}
\vfill
\begin{center}Versão para revisão da autora e do orientador\par
24 de outubro de 2026\par\vspace{1cm}Campinas — SP\par 2026\end{center}
\clearpage
\chapter*{RESUMO}\thispagestyle{empty}
\begin{singlespace}\noindent ABSTRACT_PT\par\medskip
\noindent\textbf{Palavras-chave:} KEYWORDS_PT
\end{singlespace}
\clearpage
\chapter*{ABSTRACT}\thispagestyle{empty}
\begin{otherlanguage}{english}\begin{singlespace}\noindent ABSTRACT_EN\par\medskip
\noindent\textbf{Keywords:} KEYWORDS_EN
\end{singlespace}\end{otherlanguage}
\clearpage\listoffigures\thispagestyle{empty}
\clearpage\listquadros\thispagestyle{empty}
\clearpage\listoftables\thispagestyle{empty}
\clearpage\chapter*{LISTA DE ABREVIATURAS E SIGLAS}\thispagestyle{empty}
\begin{singlespace}\noindent
ADS — Análise e Desenvolvimento de Sistemas\\
API — Interface de programação de aplicações\\
AR — Aviso de recebimento\\
CI — Integração contínua\\
CLT — Consolidação das Leis do Trabalho\\
CNJ — Conselho Nacional de Justiça\\
CPC — Código de Processo Civil\\
CPP — Código de Processo Penal\\
DJEN — Diário de Justiça Eletrônico Nacional\\
E2E — Teste ponta a ponta\\
LGPD — Lei Geral de Proteção de Dados Pessoais\\
PKCE — Proof Key for Code Exchange\\
RLS — Row Level Security\\
SSR — Server-Side Rendering\\
TG — Trabalho de Graduação\\
TJSP — Tribunal de Justiça do Estado de São Paulo\\
TRT — Tribunal Regional do Trabalho\\
WCAG — Web Content Accessibility Guidelines
\end{singlespace}
\clearpage\tableofcontents\thispagestyle{empty}
\clearpage\pagestyle{fancy}
\fancypagestyle{plain}{\fancyhf{}\fancyhead[R]{\fontsize{10}{12}\selectfont\thepage}\renewcommand{\headrulewidth}{0pt}}
BEFORE
\input{referencias}
\appendix
\titleformat{\chapter}[block]{\normalfont\bfseries\fontsize{14}{18}\selectfont}{APÊNDICE \thechapter\space---}{.5em}{}
AFTER
\end{document}
'''
    for token,value in [('ABSTRACT_PT',META['abstract_pt']),('KEYWORDS_PT',META['keywords_pt']),('ABSTRACT_EN',META['abstract_en']),('KEYWORDS_EN',META['keywords_en'])]:tex=tex.replace(token,tx(value))
    tex=tex.replace('BEFORE','\n'.join(r'\input{capitulos/'+fn[:-4]+'}' for fn,app in files if not app))
    tex=tex.replace('AFTER','\n'.join(r'\input{capitulos/'+fn[:-4]+'}' for fn,app in files if app))
    (BASE/'main.tex').write_text(tex.replace('—','---').replace('–','--'),encoding='utf-8')

def make_word():
    doc=Document();s=doc.sections[0]
    s.page_width=Cm(21);s.page_height=Cm(29.7);s.top_margin=s.left_margin=Cm(3);s.bottom_margin=s.right_margin=Cm(2)
    s.header_distance=Cm(2);s.footer_distance=Cm(1)
    for name,size in [('Normal',12),('Title',14),('Subtitle',12),('Heading 1',14),('Heading 2',12),('Caption',10)]:
        style=doc.styles[name];style.font.name='Times New Roman';style.font.size=Pt(size);style.font.color.rgb=RGBColor(0,0,0);style.font.italic=False
        rpr=style.element.get_or_add_rPr();fonts=rpr.find(qn('w:rFonts'))
        if fonts is None:fonts=OxmlElement('w:rFonts');rpr.append(fonts)
        for prop in ['ascii','hAnsi','cs','eastAsia']:fonts.set(qn('w:'+prop),'Times New Roman')
        for prop in ['asciiTheme','hAnsiTheme','cstheme','eastAsiaTheme']:fonts.attrib.pop(qn('w:'+prop),None)
        lang=OxmlElement('w:lang');lang.set(qn('w:val'),'pt-BR');rpr.append(lang)
        for spacing in list(rpr.findall(qn('w:spacing'))):rpr.remove(spacing)
        ppr=style.element.get_or_add_pPr()
        for border in list(ppr.findall(qn('w:pBdr'))):ppr.remove(border)
        pf=style.paragraph_format;pf.space_after=Pt(0);pf.line_spacing=1.5;pf.widow_control=True
        pf.first_line_indent=Cm(1.25);pf.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY
    for name in ['Title','Subtitle','Heading 1','Heading 2','Caption']:
        pf=doc.styles[name].paragraph_format;pf.first_line_indent=Cm(0)
        pf.keep_with_next=True;pf.space_before=Pt(18);pf.space_after=Pt(12)
        pf.alignment=WD_ALIGN_PARAGRAPH.LEFT
        doc.styles[name].font.bold=name!='Caption'
    doc.styles['Heading 1'].paragraph_format.space_before=Pt(0)
    doc.styles['Heading 1'].paragraph_format.space_after=Pt(18)
    doc.styles['Heading 2'].paragraph_format.space_before=Pt(12)
    doc.styles['Heading 2'].paragraph_format.space_after=Pt(8)
    doc.styles['Caption'].paragraph_format.line_spacing=1
    doc.styles['Caption'].paragraph_format.space_before=Pt(8);doc.styles['Caption'].paragraph_format.space_after=Pt(5)
    doc.core_properties.author=META['author'];doc.core_properties.title=META['title']+' '+META['subtitle'];doc.core_properties.subject='Trabalho de Graduação II — versão para revisão';doc.core_properties.last_modified_by='Projeto Prazo Claro'
    def para(text='',style=None,align=None,size=None,simple=False,indent=None):
        p=doc.add_paragraph(style=style);p.add_run(citation(text));pf=p.paragraph_format
        if align is not None:pf.alignment=align
        if simple:pf.line_spacing=1
        if indent is not None:pf.first_line_indent=Cm(indent)
        if size:
            for r in p.runs:r.font.size=Pt(size)
        return p
    def mark(p,key):
        bid=str(len(bookmarks)+1);bookmarks.append(key)
        start=OxmlElement('w:bookmarkStart');start.set(qn('w:id'),bid);start.set(qn('w:name'),key.replace('-','_'))
        end=OxmlElement('w:bookmarkEnd');end.set(qn('w:id'),bid)
        p._p.insert(0,start);p._p.append(end)
    def blank(height):
        p=para('',indent=0);p.paragraph_format.line_spacing=1;p.paragraph_format.space_after=Cm(height)
        p.paragraph_format.space_before=Pt(0);p.paragraph_format.line_spacing=Pt(1)
    def title(value):return para(value,'Heading 1',WD_ALIGN_PARAGRAPH.CENTER)
    def page():doc.add_page_break()
    def listed(title_text,items,chunk=24):
        for offset in range(0,len(items),chunk):
            page();title(title_text if offset==0 else title_text+' (continuação)')
            for label,key,level in items[offset:offset+chunk]:
                p=para('',indent=0,simple=True,size=11);pf=p.paragraph_format
                pf.space_after=Pt(7);pf.left_indent=Cm(.45 if level else 0)
                pf.tab_stops.add_tab_stop(Cm(15.8-(.45 if level else 0)),WD_TAB_ALIGNMENT.RIGHT,WD_TAB_LEADER.DOTS)
                link=OxmlElement('w:hyperlink');link.set(qn('w:anchor'),key.replace('-','_'))
                run=OxmlElement('w:r');t=OxmlElement('w:t');t.text=label;run.append(t);link.append(run);p._p.append(link)
                p.add_run('\t'+str(PAGES.get(key,'–')))
    from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER
    bookmarks=[]
    p=para('CENTRO ESTADUAL DE EDUCAÇÃO TECNOLÓGICA PAULA SOUZA\nFACULDADE DE TECNOLOGIA DE CAMPINAS\nCurso de Análise e Desenvolvimento de Sistemas',align=WD_ALIGN_PARAGRAPH.CENTER,indent=0)
    for r in p.runs:r.bold=True
    blank(1.4);para(META['author'],align=WD_ALIGN_PARAGRAPH.CENTER,indent=0);blank(3.5)
    para(META['title'],'Title',WD_ALIGN_PARAGRAPH.CENTER);para(META['subtitle'],'Subtitle',WD_ALIGN_PARAGRAPH.CENTER)
    blank(5);para(META['city']+'\n'+META['year'],align=WD_ALIGN_PARAGRAPH.CENTER,indent=0)
    # The cover is not counted. Start the title page at one, without visible numbering.
    s=doc.add_section(WD_SECTION_START.NEW_PAGE);s.header.is_linked_to_previous=False
    pn=OxmlElement('w:pgNumType');pn.set(qn('w:start'),'1');s._sectPr.append(pn)
    para(META['author'],align=WD_ALIGN_PARAGRAPH.CENTER,indent=0);blank(1.5)
    para(META['title'],'Title',WD_ALIGN_PARAGRAPH.CENTER);para(META['subtitle'],'Subtitle',WD_ALIGN_PARAGRAPH.CENTER);blank(1.5)
    p=para('Trabalho de Graduação II apresentado à Faculdade de Tecnologia de Campinas, do Centro Estadual de Educação Tecnológica Paula Souza, como requisito parcial para obtenção do título de Tecnóloga em Análise e Desenvolvimento de Sistemas.',simple=True,indent=0)
    p.paragraph_format.left_indent=Cm(7.2)
    p=para('Orientador: '+META['advisor']+'.',simple=True,indent=0);p.paragraph_format.left_indent=Cm(7.2);p.paragraph_format.space_before=Pt(12)
    blank(2.8);para(META['status'],align=WD_ALIGN_PARAGRAPH.CENTER,indent=0,size=10);blank(.5)
    para(META['city']+'\n'+META['year'],align=WD_ALIGN_PARAGRAPH.CENTER,indent=0)
    for label,body,keywords,prefix in [('RESUMO','abstract_pt','keywords_pt','Palavras-chave: '),('ABSTRACT','abstract_en','keywords_en','Keywords: ')]:
        page();title(label);para(META[body],simple=True,indent=0);p=para(prefix+META[keywords],simple=True,indent=0);p.paragraph_format.space_before=Pt(12)
    listed('LISTA DE FIGURAS',[(b['label'],b['key'],0) for b in BLOCKS if b['kind']=='figure'],18)
    listed('LISTA DE QUADROS',[(b['label'],b['key'],0) for b in BLOCKS if b['kind']=='table' and b['type']=='Quadro'],18)
    listed('LISTA DE TABELAS',[(b['label'],b['key'],0) for b in BLOCKS if b['kind']=='table' and b['type']=='Tabela'],18)
    page();title('LISTA DE ABREVIATURAS E SIGLAS')
    siglas=['ADS — Análise e Desenvolvimento de Sistemas','API — Interface de programação de aplicações','AR — Aviso de recebimento','CI — Integração contínua','CLT — Consolidação das Leis do Trabalho','CNJ — Conselho Nacional de Justiça','CPC — Código de Processo Civil','CPP — Código de Processo Penal','DJEN — Diário de Justiça Eletrônico Nacional','E2E — Teste ponta a ponta','LGPD — Lei Geral de Proteção de Dados Pessoais','PKCE — Proof Key for Code Exchange','RLS — Row Level Security','SSR — Server-Side Rendering','TG — Trabalho de Graduação','TJSP — Tribunal de Justiça do Estado de São Paulo','TRT — Tribunal Regional do Trabalho','WCAG — Web Content Accessibility Guidelines']
    for item in siglas:p=para(item,indent=0,simple=True);p.paragraph_format.space_after=Pt(8)
    toc=[];ref_inserted=False
    for b in BLOCKS:
        if b['kind'] in ['chapter','section']:
            if b.get('appendix') and not ref_inserted:toc.append(('REFERÊNCIAS','references',0));ref_inserted=True
            toc.append((b['label'],b['key'],int(b['kind']=='section')))
    listed('SUMÁRIO',toc,25)
    # Continuous page counter; numbers become visible only from the introduction.
    s=doc.add_section(WD_SECTION_START.NEW_PAGE);s.header.is_linked_to_previous=False
    for old in s._sectPr.findall(qn('w:pgNumType')):s._sectPr.remove(old)
    hp=s.header.paragraphs[0];hp.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');hp._p.append(field)
    hp.paragraph_format.first_line_indent=Cm(0)
    refs_added=False;first=True
    def references():
        p=para('REFERÊNCIAS','Heading 1');p.paragraph_format.page_break_before=True;mark(p,'references')
        for key,ref in sorted(REFS.items(),key=lambda it:it[1]['text']):
            p=para(ref['text'],simple=True,indent=0);p.paragraph_format.space_after=Pt(12);p.paragraph_format.keep_together=True;p.paragraph_format.alignment=WD_ALIGN_PARAGRAPH.LEFT
            p.add_run(' Disponível em: ')
            link=OxmlElement('w:hyperlink');link.set(qn('r:id'),p.part.relate_to(ref['url'],RT.HYPERLINK,is_external=True))
            run=OxmlElement('w:r');t=OxmlElement('w:t');t.text=ref['url'];run.append(t);link.append(run);p._p.append(link)
            p.add_run('. Acesso em: 24 out. 2026.')
    for b in BLOCKS:
        kind=b['kind']
        if kind=='chapter':
            if b['appendix'] and not refs_added:references();refs_added=True
            needs_break=not first
            first=False;p=para(b['label'],'Heading 1');p.paragraph_format.page_break_before=needs_break;mark(p,b['key'])
        elif kind=='section':p=para(b['label'],'Heading 2');mark(p,b['key'])
        elif kind=='paragraph':para(b['text'])
        elif kind=='code':
            p=para('\n'.join(b['lines']),simple=True,indent=0,size=9)
            p.paragraph_format.alignment=WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before=Pt(8);p.paragraph_format.space_after=Pt(8)
            for r in p.runs:r.font.name='Consolas'
        elif kind=='figure':
            p=para(b['label'],'Caption');mark(p,b['key'])
            path=FIG/(b['name']+'.png');im=Image.open(path);w,h=im.size
            maxh=15 if b['name']=='tela-calculadora' else 10 if b['name']=='tela-confirmacao' else 13
            width=min(16,maxh*w/h)
            p=para('',align=WD_ALIGN_PARAGRAPH.CENTER,indent=0,simple=True)
            p.add_run().add_picture(str(path),width=Cm(width));p.paragraph_format.keep_with_next=True
            p=para(figure_source(b),simple=True,indent=0,size=10);p.paragraph_format.space_after=Pt(12)
        elif kind=='table':
            p=para(b['label'],'Caption');mark(p,b['key'])
            rows=b['rows'];cols=len(rows[0]);table=doc.add_table(rows=1,cols=cols);table.alignment=WD_TABLE_ALIGNMENT.CENTER;table.autofit=False
            widths=[16/cols]*cols
            if cols==2:widths=[4.1,11.9]
            if cols==3:widths=[5.2,5.7,5.1]
            for cell,w in zip(table.columns,widths):cell.width=Cm(w)
            for ri,row in enumerate(rows):
                cells=table.rows[0].cells if ri==0 else table.add_row().cells
                for ci,(cell,value) in enumerate(zip(cells,row)):
                    cell.width=Cm(widths[ci]);p=cell.paragraphs[0];p.add_run(citation(value))
                    pf=p.paragraph_format;pf.first_line_indent=Cm(0);pf.line_spacing=1;pf.space_before=Pt(3);pf.space_after=Pt(3);pf.alignment=WD_ALIGN_PARAGRAPH.LEFT
                    for r in p.runs:r.font.size=Pt(10);r.bold=ri==0
                    if ri in [0,len(rows)-1]:p.paragraph_format.keep_with_next=True
                pr=table.rows[ri]._tr.get_or_add_trPr();pr.append(OxmlElement('w:cantSplit'))
                if ri==0:pr.append(OxmlElement('w:tblHeader'))
            pr=table._tbl.tblPr;borders=OxmlElement('w:tblBorders')
            for edge in ['top','left','bottom','right','insideH','insideV']:
                el=OxmlElement('w:'+edge);el.set(qn('w:val'),'single' if b['type']=='Quadro' or edge in ['top','bottom'] else 'nil');el.set(qn('w:sz'),'4');el.set(qn('w:color'),'555555');borders.append(el)
            pr.append(borders)
            p=para('Fonte: elaboração com base nos registros do projeto (2026).',simple=True,indent=0,size=10);p.paragraph_format.space_before=Pt(5);p.paragraph_format.space_after=Pt(10)
    output=OUT/'prazo-claro-relatorio-tg2-2026-10-24.docx';doc.save(output)
    manifest={'word':str(output.relative_to(ROOT)),'headings':[{k:b[k] for k in ['key','label','kind']} for b in BLOCKS if b['kind'] in ['chapter','section','figure','table']],'abstract_words':{k:len(META[k].split()) for k in ['abstract_pt','abstract_en']},'content_words':len((BASE/'conteudo.md').read_text(encoding='utf-8').split()),'references':len(REFS)}
    (OUT/'relatorio-tg2-manifesto.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in manifest.items() if k!='headings'},ensure_ascii=False))

if not (FIG/'contexto.pdf').exists():make_figures()
make_latex()
make_word()

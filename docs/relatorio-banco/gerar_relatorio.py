"""Gera o relatório Word e diagramas vetoriais a partir da documentação e DDL."""
from pathlib import Path
from xml.sax.saxutils import escape
import hashlib
import json
import re
import shutil
import subprocess
import csv
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from reportlab.graphics.shapes import Drawing, Rect, Line, Polygon, String
from reportlab.graphics import renderPDF, renderSVG
from reportlab.lib.colors import HexColor, white, black

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[1]
OUT = ROOT / 'output/documents'
FIG = BASE / 'diagramas'
BUILD = ROOT / 'tmp/relatorio-banco'
for folder in [OUT, FIG, BUILD]: folder.mkdir(parents=True, exist_ok=True)
STEM = 'prazo-claro-relatorio-banco-de-dados-2026-11-04'
SCHEMA = json.loads((BASE / 'schema-inventario.json').read_text(encoding='utf8'))

REFERENCES = {
 'P01': ('Migrations e inventário físico', [x['path'] for x in SCHEMA['migrations']] + ['docs/relatorio-banco/schema-inventario.json']),
 'P02': ('Domínio requisitos e arquitetura', ['GLOSSARY.md', 'docs/requirements.md', 'docs/architecture.md', 'supabase/seed.sql']),
 'P03': ('Decisões arquiteturais', ['docs/architecture/adr/0002-supabase-data-api-sem-orm-inicial.md', 'docs/architecture/adr/0003-historico-individual-antes-de-organizacoes.md', 'docs/architecture/adr/0005-fila-de-lembretes-e-envio-incerto.md', 'docs/architecture/adr/0006-agendamento-com-assinatura-descartavel.md']),
 'P04': ('Implementação de aplicação', ['src/app/api/history/route.ts', 'src/application/history-snapshot.ts', 'src/application/history-query.ts', 'src/app/api/reminders/route.ts', 'src/app/api/internal/reminders/dispatch/route.ts', 'src/lib/supabase/server.ts', 'src/lib/supabase/http.ts', 'src/lib/reminders/config.ts']),
 'P05': ('Configuração entrega e operação', ['supabase/config.toml', 'package.json', '.github/workflows/ci.yml', 'docs/reminder-scheduler-operations.md', 'docs/email-reminders-external.md']),
 'P06': ('Segurança e preservação de dados', ['docs/security/README.md', 'docs/security/release-review.md']),
 'P07': ('Testes e evidências SQL', sorted(p.relative_to(ROOT).as_posix() for p in (ROOT/'supabase/tests').glob('*.sql')) + ['docs/testing/reminder-scheduler.md', 'docs/testing/reminder-delivery-modes.md', 'docs/testing/signup-confirmation-page.md']),
 'P08': ('Publicação e aceite humano', ['docs/testing/reminders-production.md', 'docs/testing/reminder-receipt-2026-10-24.md', 'docs/entrega/aceite.md']),
 'T01': ('POSTGRESQL GLOBAL DEVELOPMENT GROUP. PostgreSQL 17 Documentation. JSON Types. Consulta em 04/11/2026.', ['https://www.postgresql.org/docs/17/datatype-json.html']),
 'T02': ('SUPABASE. Row Level Security. Consulta em 04/11/2026.', ['https://supabase.com/docs/guides/database/postgres/row-level-security']),
 'T03': ('POSTGRESQL GLOBAL DEVELOPMENT GROUP. PostgreSQL 17 Documentation. Constraints e Partial Indexes. Consulta em 04/11/2026.', ['https://www.postgresql.org/docs/17/ddl-constraints.html', 'https://www.postgresql.org/docs/17/indexes-partial.html']),
 'T04': ('POSTGRESQL GLOBAL DEVELOPMENT GROUP. PostgreSQL 17 Documentation. SELECT e cláusula SKIP LOCKED. Consulta em 04/11/2026.', ['https://www.postgresql.org/docs/17/sql-select.html']),
 'T05': ('SUPABASE. pg_net Async Networking e Cron. Consulta em 04/11/2026, incluindo pesquisa no plugin oficial.', ['https://supabase.com/docs/guides/database/extensions/pg_net', 'https://supabase.com/docs/guides/cron']),
 'T06': ('SUPABASE. Changelog. Anúncio de 04/11/2026 sobre CLI v3 e mudanças de alvo e confirmação. Consulta em 04/11/2026.', ['https://supabase.com/changelog']),
}

def label(d,x,y,text,size=13,bold=False,anchor='start',color=black):
    d.add(String(x,y,text,fontName='Helvetica-Bold' if bold else 'Helvetica',fontSize=size,textAnchor=anchor,fillColor=color))

def box(d,x,y,w,h,title,lines=()):
    d.add(Rect(x,y,w,h,strokeColor=HexColor('#53636D'),strokeWidth=1,fillColor=white))
    d.add(Rect(x,y+h-34,w,34,strokeWidth=0,fillColor=HexColor('#E6ECF0')))
    label(d,x+10,y+h-23,title,13,True)
    for i,line in enumerate(lines): label(d,x+10,y+h-57-i*21,line,12)

def arrow(d,points,text=None,at=None,dashed=False):
    for (x1,y1),(x2,y2) in zip(points,points[1:]):
        line=Line(x1,y1,x2,y2,strokeColor=HexColor('#53636D'),strokeWidth=1.2)
        if dashed: line.strokeDashArray=[5,4]
        d.add(line)
    x1,y1=points[-2];x2,y2=points[-1]
    import math
    a=math.atan2(y2-y1,x2-x1);r=8
    tip=[x2,y2,x2-r*math.cos(a-.45),y2-r*math.sin(a-.45),x2-r*math.cos(a+.45),y2-r*math.sin(a+.45)]
    d.add(Polygon(tip,strokeWidth=0,fillColor=HexColor('#53636D')))
    if text and at: label(d,*at,text,12)

def save_diagram(name,d,mermaid):
    renderPDF.drawToFile(d,str(FIG/f'{name}.pdf'))
    renderSVG.drawToFile(d,str(FIG/f'{name}.svg'))
    (FIG/f'{name}.mmd').write_text(mermaid.strip()+'\n',encoding='utf8')
    poppler=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe'
    subprocess.run([str(poppler),'-scale-to','2100','-singlefile','-png',str(FIG/f'{name}.pdf'),str(FIG/name)],check=True,capture_output=True)

def diagrams():
    d=Drawing(660,380)
    box(d,20,250,180,95,'Pessoa autenticada',['Identidade gerenciada'])
    box(d,240,250,180,95,'Cálculo',['Entrada e resultado'])
    box(d,460,250,180,95,'Lembrete',['Programação e estado'])
    arrow(d,[(200,298),(240,298)],'1 : N',(205,315))
    arrow(d,[(420,298),(460,298)],'1 : N',(425,315))
    box(d,20,45,180,100,'Regra versionada',['Âmbito e fundamento'])
    box(d,240,45,180,100,'Calendário',['Cobertura e eventos'])
    box(d,460,45,180,100,'Memória',['Trilha e versões'])
    arrow(d,[(110,145),(110,205),(285,205),(285,250)],'aplica',(140,212))
    arrow(d,[(330,145),(330,250)],'usa',(340,180))
    arrow(d,[(385,250),(385,180),(550,180),(550,145)],'preserva',(455,193))
    label(d,20,12,'Relações conceituais; os componentes de memória não exigem tabelas separadas.',12)
    save_diagram('conceitual',d,'''flowchart LR
Pessoa -->|possui 0..N|Calculo
Calculo -->|origina 0..N|Lembrete
RegraVersionada -->|aplicada no|Calculo
CalendarioVersionado -->|utilizado no|Calculo
Calculo -->|preserva|Memoria''')
    d=Drawing(660,690)
    box(d,20,480,270,150,'public.legal_sources',['PK id : uuid','title, url, provision','review_status, consulted_at','created_at'])
    box(d,20,250,270,160,'public.legal_rule_versions',['PK id : uuid','FK source_id : uuid','UK (rule_key, version)','scope, definition : jsonb','valid_from, valid_until'])
    box(d,20,35,270,155,'public.calendar_versions',['PK id : uuid','UK (calendar_key, version)','court, locality, coverage','is_complete, review_status','snapshot : jsonb'])
    box(d,370,510,270,120,'auth.users  [gerenciada]',['PK id : uuid','Identidade usada pelo projeto','Estrutura mantida pelo Auth'])
    box(d,370,280,270,160,'public.deadline_calculations',['PK id : uuid','FK owner_id : uuid','input, result_snapshot : jsonb','status = provisional','title, created_at'])
    box(d,370,35,270,170,'public.deadline_reminders',['PK id : uuid','FK calculation_id, owner_id','due_date, send_at, status','delivery_mode, claim_token','Uma geração ativa por cálculo'])
    arrow(d,[(155,480),(155,410)],'1 : 0..N',(165,445))
    arrow(d,[(505,510),(505,440)],'1 : 0..N',(515,475))
    arrow(d,[(505,280),(505,205)],'1 : 0..N',(515,242))
    arrow(d,[(370,560),(335,560),(335,110),(370,110)])
    label(d,299,350,'FK',11,True); label(d,299,332,'owner',10)
    label(d,20,12,'Setas: pai para filho por FK. Campos resumidos; o dicionário lista todas as colunas.',12)
    save_diagram('fisico',d,'''erDiagram
AUTH_USERS ||--o{ DEADLINE_CALCULATIONS : owner_id
AUTH_USERS ||--o{ DEADLINE_REMINDERS : owner_id
DEADLINE_CALCULATIONS ||--o{ DEADLINE_REMINDERS : calculation_id
LEGAL_SOURCES ||--o{ LEGAL_RULE_VERSIONS : source_id
CALENDAR_VERSIONS { uuid id PK }
LEGAL_SOURCES { uuid id PK }
LEGAL_RULE_VERSIONS { uuid id PK uuid source_id FK }
AUTH_USERS { uuid id PK }
DEADLINE_CALCULATIONS { uuid id PK uuid owner_id FK }
DEADLINE_REMINDERS { uuid id PK uuid owner_id FK uuid calculation_id FK }''')
    d=Drawing(660,420)
    box(d,15,270,310,115,'reminder_private.scheduler_config',['PK singleton : boolean = true','enabled : boolean = false'])
    box(d,15,35,310,190,'reminder_private.scheduler_invocations',['PK nonce : uuid','issued_at, operation','UK request_id : bigint (opcional)','used_at, http_status, summary','Retenção operacional: sete dias'])
    box(d,400,270,245,115,'cron.job  [extensão]',['Job por minuto','active e schedule'])
    box(d,400,65,245,145,'net._http_response',['id : bigint','status_code, timed_out','Resposta HTTP assíncrona'])
    arrow(d,[(325,325),(400,325)],'controle',(332,345),True)
    arrow(d,[(325,125),(400,125)],'request_id',(331,145),True)
    label(d,15,12,'Linhas tracejadas: controle ou correlação por valor. Não há FKs entre esses objetos.',12)
    save_diagram('agendador',d,'''flowchart LR
Config["scheduler_config"] -. habilita .-> Cron["cron.job"]
Invocacoes["scheduler_invocations.request_id"] -. correlaciona sem FK .-> Resposta["net._http_response.id"]''')
    d=Drawing(660,430)
    names=['Navegador','Next.js','Supabase Auth','Data API / banco'];xs=[65,240,415,595]
    for x,name in zip(xs,names):
        label(d,x,400,name,13,True,'middle');line=Line(x,55,x,385,strokeColor=HexColor('#AAB5BD'),strokeDashArray=[3,4]);d.add(line)
    arrow(d,[(65,355),(240,355)],'1. POST input e título',(72,367))
    arrow(d,[(240,310),(415,310)],'2. getUser',(258,322))
    arrow(d,[(415,275),(240,275)],'Identidade verificada',(250,287),True)
    label(d,240,240,'3. Valida e recalcula',12,False,'middle')
    arrow(d,[(240,205),(595,205)],'4. INSERT sob identidade da conta',(270,218))
    label(d,595,168,'GRANT RLS FK CHECK',11,False,'end')
    arrow(d,[(595,130),(240,130)],'5. Registro preservado',(330,143),True)
    arrow(d,[(240,85),(65,85)],'6. Resposta privada',(75,98),True)
    label(d,20,18,'O domínio calcula na aplicação; o banco aplica integridade e autorização.',12)
    save_diagram('persistencia',d,'''sequenceDiagram
participant U as Navegador
participant A as Next.js
participant I as Supabase Auth
participant D as Data API e PostgreSQL
U->>A: POST input e título
A->>I: getUser
I-->>A: Identidade verificada
Note over A: Valida e recalcula sem banco no motor
A->>D: INSERT com owner_id da conta
Note over D: GRANT RLS FK CHECK
D-->>A: Registro preservado
A-->>U: Resposta privada''')
    d=Drawing(660,460)
    box(d,20,320,170,80,'pending',['Aguarda horário'])
    box(d,245,320,170,80,'processing',['Token e lease'])
    box(d,470,320,170,80,'accepted',['Aceite do provedor'])
    box(d,245,145,170,90,'failed',['Falha definitiva'])
    box(d,470,145,170,90,'uncertain',['Dúvida de envio'])
    box(d,20,30,170,85,'cancelled',['Pedido do dono'])
    arrow(d,[(190,360),(245,360)],'claim',(194,376))
    arrow(d,[(415,360),(470,360)],'aceite',(420,376))
    arrow(d,[(330,400),(330,440),(105,440),(105,400)],'pré-envio: tentativa admissível',(130,447))
    arrow(d,[(330,320),(330,235)],'falha',(340,270))
    arrow(d,[(415,340),(445,340),(445,265),(555,265),(555,235)],'timeout / lease',(453,280))
    arrow(d,[(605,235),(605,320)],'aceite tardio',(505,300),True)
    arrow(d,[(105,320),(105,115)],'cancelar',(115,215))
    label(d,210,70,'Cancelamento também pode atingir processing e uncertain.',12)
    label(d,210,48,'Aceite após cancelamento pode registrar accepted_at sem mudar cancelled.',10)
    label(d,20,8,'Fluxo resumido; regras de token, janela e corrida estão descritas no texto.',12)
    save_diagram('estados',d,'''stateDiagram-v2
pending --> processing: claim
processing --> accepted: aceite
processing --> pending: falha pré-envio elegível
processing --> failed: rejeição ou limite
processing --> uncertain: envio duvidoso ou lease
uncertain --> accepted: aceite tardio correlacionado
pending --> cancelled: cancelamento
processing --> cancelled: cancelamento
uncertain --> cancelled: cancelamento''')
    d=Drawing(660,505)
    box(d,20,395,180,80,'Navegador',['Interface pt-BR'])
    box(d,255,395,385,80,'Vercel  Next.js',['Rotas SSR e dispatcher HTTP'])
    box(d,20,235,180,100,'Supabase Auth',['Identidade e sessão'])
    box(d,255,235,180,100,'Data API',['JWT e RPC'])
    box(d,20,30,415,160,'PostgreSQL no Supabase',['public: cálculos catálogos e fila','reminder_private: operação e funções','Vault: segredo de assinatura','pg_cron e pg_net: agendamento e HTTP'])
    box(d,485,120,155,150,'Brevo',['API transacional','de lembretes','SMTP Auth é','canal separado'])
    arrow(d,[(200,435),(255,435)],'HTTPS',(204,453))
    arrow(d,[(255,415),(225,415),(225,285),(200,285)])
    arrow(d,[(345,395),(345,335)],'sessão / RPC',(353,366))
    arrow(d,[(110,235),(110,190)])
    arrow(d,[(345,235),(345,190)],'RLS',(355,210))
    arrow(d,[(580,395),(580,270)],'envio HTTP',(500,350))
    arrow(d,[(435,110),(460,110),(460,365),(485,365),(485,395)],'HMAC e nonce',(465,95),True)
    label(d,20,8,'Topologia lógica documentada; sem afirmação de região, máquina ou capacidade contratada.',11)
    save_diagram('infraestrutura',d,'''flowchart TB
U[Navegador] --> A[Vercel Next.js]
A --> I[Supabase Auth]
A --> R[Data API e RPC]
R --> DB[(PostgreSQL com RLS)]
I --> DB
DB -. pg_cron pg_net HMAC nonce .-> A
A --> B[Brevo API transacional]
V[Vault] --> DB''')

NOTES={
 'id':'PK. UUID gerado na inserção.', 'title':'Rótulo de exibição com limite de tamanho.', 'url':'URL da fonte; prefixo HTTPS exigido.',
 'provision':'Dispositivo ou trecho de referência normativa.', 'consulted_at':'Instante de consulta à fonte.', 'review_status':'pending, approved ou rejected.',
 'created_at':'Instante de criação; padrão now().', 'rule_key':'Identidade lógica estável da regra.', 'version':'Identidade da revisão no catálogo.',
 'source_id':'FK para legal_sources; exclusão restrita.', 'scope':'Objeto com âmbito de aplicação.', 'valid_from':'Início da vigência.', 'valid_until':'Fim opcional, não anterior ao início.',
 'definition':'Objeto com definição da regra.', 'calendar_key':'Identidade lógica do calendário.', 'court':'Tribunal ao qual a versão se refere.', 'locality':'Localidade declarada na cobertura.',
 'coverage_start':'Primeiro dia da cobertura.', 'coverage_end':'Último dia; não anterior ao início.', 'is_complete':'Completude; necessária para approved.',
 'snapshot':'Objeto com a versão do calendário.', 'owner_id':'FK para auth.users; cascata na exclusão.',
 'input':'Objeto com entrada do cálculo; até 32 KiB em texto.', 'result_snapshot':'Objeto de memória original; até 1 MiB em texto.',
 'status':'Estado persistido do registro.', 'calculation_id':'FK para cálculo; cascata na exclusão.', 'due_date':'Vencimento civil capturado ao agendar.',
 'lead_days':'Antecedência de 0, 1 ou 3 dias corridos.', 'send_hour':'Hora local admitida: 9, 12 ou 18.', 'time_zone':'Valor fixo America/Sao_Paulo.',
 'send_at':'Instante planejado para envio.', 'snapshot_metadata':'Cópia dos metadados originais de versão.', 'attempt_count':'Número de reservas; entre zero e três.',
 'next_attempt_at':'Instante mínimo para nova tentativa elegível.', 'claim_token':'Token da reserva; necessário a prepare e settle.',
 'claimed_at':'Instante da reserva para controlar lease.', 'accepted_at':'Instante do aceite pelo serviço, se houver.',
 'error_code':'Código fixo opcional, limitado por CHECK.', 'delivery_mode':'local ou brevo; legado começa local.',
 'singleton':'PK com CHECK true; no máximo uma linha.', 'enabled':'Habilitação operacional; começa false.', 'nonce':'PK. Identificador de uso único da invocação.',
 'issued_at':'Timestamp de emissão em segundos; positivo.', 'operation':'dispatch ou probe.', 'used_at':'Marca do consumo único da invocação.',
 'request_id':'ID HTTP único quando preenchido; sem FK.', 'http_status':'Status HTTP coletado, quando disponível.', 'completed_at':'Instante de conclusão da coleta.',
 'timed_out':'Flag de timeout quando a conclusão é conhecida.', 'summary':'Objeto de diagnóstico mínimo permitido.'}

FUNCTION_NOTES={
 'public.cancel_deadline_reminders':'Usuário. Cancela um ou todos os ativos próprios.',
 'public.claim_deadline_reminders':'Serviço. Reserva lote no modo local.',
 'public.list_deadline_reminders':'Usuário. Geração mais recente por cálculo sob proprietário.',
 'public.prepare_deadline_reminder':'Serviço. Prepara destinatário e memória após validar token.',
 'public.schedule_deadline_reminder':'Usuário. Agenda uma geração local.',
 'public.settle_deadline_reminder':'Serviço. Registra resultado do processamento.',
 'public.claim_deadline_reminders_for_mode':'Serviço. Reserva lote no modo solicitado pelo servidor.',
 'public.list_deadline_reminders_for_mode':'Usuário. Listagem própria restrita ao modo.',
 'public.schedule_deadline_reminder_for_mode':'Usuário. Programa geração em modo explícito.',
 'public.consume_reminder_invocation':'Serviço. Consome nonce e operação uma única vez.',
 'reminder_private.cancel':'Usuário via wrapper. Confere identidade e cancela ativos.',
 'reminder_private.claim':'Serviço via wrapper. Delega claim_for_mode para local.',
 'reminder_private.prepare':'Serviço via wrapper. Token lease conta e snapshot.',
 'reminder_private.schedule':'Usuário via wrapper. Identidade confirmada e programação futura.',
 'reminder_private.settle':'Serviço via wrapper. Liquidação condicionada ao token.',
 'reminder_private.claim_for_mode':'Serviço via wrapper. Expiração e reserva transacional por modo.',
 'reminder_private.schedule_for_mode':'Usuário via wrapper. Agenda e fixa modo na transação.',
 'reminder_private.collect_scheduler_results':'Administração ou tick interno. Coleta HTTP e aplica retenção.',
 'reminder_private.consume_invocation':'Serviço via wrapper. Consumo atômico de nonce válido.',
 'reminder_private.dispatch_tick':'Administração ou Cron. Assina e enfileira probe ou dispatch.',
 'reminder_private.prepare_scheduler':'Administração. Configuração desligada e job único inativo.',
 'reminder_private.set_scheduler_enabled':'Administração. Habilita ou suspende sob condições de probe.',
}

def no_border(style):
    node=style.element.get_or_add_pPr()
    border=node.find(qn('w:pBdr'))
    if border is not None: node.remove(border)

def add_link(par,text,target,anchor=False):
    link=OxmlElement('w:hyperlink')
    if anchor: link.set(qn('w:anchor'),target)
    else: link.set(qn('r:id'),par.part.relate_to(target,RT.HYPERLINK,is_external=True))
    r=OxmlElement('w:r');pr=OxmlElement('w:rPr');color=OxmlElement('w:color');color.set(qn('w:val'),'000000');pr.append(color)
    r.append(pr);t=OxmlElement('w:t');t.text=text;r.append(t);link.append(r);par._p.append(link)

def bookmark(par,name,ident):
    start=OxmlElement('w:bookmarkStart');start.set(qn('w:id'),str(ident));start.set(qn('w:name'),name)
    end=OxmlElement('w:bookmarkEnd');end.set(qn('w:id'),str(ident));par._p.insert(0,start);par._p.append(end)

def table(doc,rows,widths=None):
    t=doc.add_table(rows=1,cols=len(rows[0]));t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
    if widths is None: widths=[16/len(rows[0])]*len(rows[0])
    for col,w in zip(t.columns,widths): col.width=Cm(w)
    for rnum,values in enumerate(rows):
        row=t.rows[0] if rnum==0 else t.add_row()
        trPr=row._tr.get_or_add_trPr()
        if rnum==0:
            repeat=OxmlElement('w:tblHeader');trPr.append(repeat)
        no_split=OxmlElement('w:cantSplit');trPr.append(no_split)
        for cell,value,w in zip(row.cells,values,widths):
            cell.width=Cm(w);cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            tcPr=cell._tc.get_or_add_tcPr();borders=OxmlElement('w:tcBorders')
            for edge in ['top','left','bottom','right']:
                el=OxmlElement('w:'+edge);el.set(qn('w:val'),'single');el.set(qn('w:sz'),'4');el.set(qn('w:color'),'D9D9D9');borders.append(el)
            tcPr.append(borders);shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'E4EAF0' if rnum==0 else ('F7F9FB' if rnum%2==0 else 'FFFFFF'));tcPr.append(shade)
            margins=OxmlElement('w:tcMar')
            for edge in ['top','left','bottom','right']:
                el=OxmlElement('w:'+edge);el.set(qn('w:w'),'80');el.set(qn('w:type'),'dxa');margins.append(el)
            tcPr.append(margins);p=cell.paragraphs[0]
            p.paragraph_format.line_spacing=1.05;p.paragraph_format.space_after=Pt(2);p.paragraph_format.space_before=Pt(2);p.paragraph_format.first_line_indent=Cm(0)
            run=p.add_run(str(value));run.font.size=Pt(9.5);run.bold=rnum==0
            if len(str(value))<=3:p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph().paragraph_format.space_after=Pt(2)
    return t

def build():
    diagrams()
    doc=Document();s=doc.sections[0];s.page_width=Cm(21);s.page_height=Cm(29.7)
    s.left_margin=Cm(3);s.right_margin=Cm(2);s.top_margin=Cm(3);s.bottom_margin=Cm(2)
    s.header_distance=Cm(1.25);s.footer_distance=Cm(1.1)
    for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Heading 3','Caption']:
        sty=doc.styles[name];sty.font.name='Times New Roman';sty.font.color.rgb=RGBColor(0,0,0);no_border(sty)
    normal=doc.styles['Normal'];normal.font.size=Pt(12);normal.paragraph_format.line_spacing=1.35;normal.paragraph_format.space_after=Pt(7)
    for name,pt in [('Title',20),('Heading 1',14),('Heading 2',12),('Heading 3',11),('Caption',10),('Subtitle',12)]:
        doc.styles[name].font.size=Pt(pt)
    for name in ['Heading 1','Heading 2','Heading 3']:
        doc.styles[name].font.bold=True;doc.styles[name].paragraph_format.keep_with_next=True
        doc.styles[name].paragraph_format.space_before=Pt(12);doc.styles[name].paragraph_format.space_after=Pt(7)
    doc.styles['Heading 1'].paragraph_format.page_break_before=False
    # The cover uses Title. Body chapters keep a native navigation hierarchy.
    for text,style in [('FATEC CAMPINAS','Subtitle'),('ANÁLISE E DESENVOLVIMENTO DE SISTEMAS','Subtitle'),('KEZIA CALIXTO','Subtitle')]:
        p=doc.add_paragraph(text,style);p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p=doc.add_paragraph('Banco de dados do Prazo Claro','Title');p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.space_before=Pt(85)
    p=doc.add_paragraph('Concepção modelagem e operação da infraestrutura','Subtitle');p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p=doc.add_paragraph('Relatório técnico complementar ao Trabalho de Graduação II\nOrientação do Prof. Eduardo Felipe Fonseca de Freitas');p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.space_before=Pt(55)
    p=doc.add_paragraph('Versão para revisão da autora e do orientador\nCampinas SP\n4 de novembro de 2026');p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.space_before=Pt(60)
    doc.add_page_break();p=doc.add_paragraph('Roteiro de leitura','Title');p.paragraph_format.space_after=Pt(20)
    lines=(BASE/'relatorio.md').read_text(encoding='utf8').splitlines()
    headings=[line[2:] for line in lines if line.startswith('# ')][1:]
    for i,title in enumerate(headings):
        p=doc.add_paragraph();p.paragraph_format.space_after=Pt(4);p.paragraph_format.line_spacing=1.15;add_link(p,title,'chapter'+str(i),True)
    p=doc.add_paragraph('As entradas acima são vínculos internos. O relatório reúne modelo conceitual e físico, dicionário completo, segurança, fluxos e infraestrutura. A versão descrita conserva o aceite humano do lembrete de 24/10 e não implica nova inspeção de produção em novembro.');p.paragraph_format.space_before=Pt(16)
    doc.add_page_break()
    p=doc.add_paragraph('Apresentação do relatório','Heading 1');p.paragraph_format.page_break_before=False
    i=0;chapter=-1;fig=0;inside_code=False;code=[]
    while i<len(lines):
        line=lines[i].strip()
        if line.startswith('```'):
            if inside_code:
                for code_line in code:
                    p=doc.add_paragraph();p.paragraph_format.line_spacing=1;p.paragraph_format.space_after=Pt(0);p.paragraph_format.keep_with_next=True
                    r=p.add_run(code_line or ' ');r.font.name='Consolas';r.font.size=Pt(8)
                if code:p.paragraph_format.keep_with_next=False
                doc.add_paragraph();code=[]
            inside_code=not inside_code;i+=1;continue
        if inside_code:code.append(lines[i]);i+=1;continue
        if not line:i+=1;continue
        if line=='# Banco de dados do Prazo Claro' or line=='## Concepção modelagem e operação da infraestrutura':i+=1;continue
        if line.startswith('# '):
            chapter+=1;p=doc.add_paragraph(line[2:],'Heading 1');bookmark(p,'chapter'+str(chapter),chapter+1)
            p.paragraph_format.page_break_before=line.startswith(('# 1 ', '# 4 ', '# 5 ', '# 10 ', '# Apêndice A', '# Referências'))
        elif line.startswith('## '):doc.add_paragraph(line[3:],'Heading 2')
        elif line.startswith('@figure '):
            fig+=1;name,caption=line[8:].split('|',1)
            p=doc.add_paragraph(f'Figura {fig}  {caption}','Caption');p.paragraph_format.keep_with_next=True
            p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.keep_with_next=True
            pic=p.add_run().add_picture(str(FIG/f'{name}.png'),width=Cm(16));pic._inline.docPr.set('descr',caption)
            p=doc.add_paragraph('Fonte  Elaboração a partir da DDL e da implementação versionadas do Prazo Claro.','Caption')
        elif line.startswith('@table '):
            p=doc.add_paragraph(line[7:],'Caption');p.paragraph_format.keep_with_next=True
        elif line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                cols=[c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\-\s]+',c) for c in cols):rows.append(cols)
                i+=1
            widths=[4.4,6,5.6] if len(rows[0])==3 else ([5.1,2.7,4,4.2] if len(rows[0])==4 else None)
            table(doc,rows,widths);continue
        elif line=='@dictionary':
            for name,info in SCHEMA['tables'].items():
                p=doc.add_paragraph(name,'Heading 3');p.paragraph_format.keep_with_next=True
                if name in ('public.deadline_reminders','reminder_private.scheduler_invocations'):
                    p.paragraph_format.page_break_before=True
                rows=[['Campo','Tipo SQL','Nulo','Finalidade e regra']]
                for c in info['columns']:
                    note=NOTES[c['name']]
                    if c['name']=='status':note='Somente provisional.' if name.endswith('calculations') else 'pending processing accepted failed cancelled uncertain.'
                    rows.append([c['name'],c['type'],'Sim' if c['nullable'] else 'Não',note])
                table(doc,rows,[3.8,3,1.3,7.9])
        elif line=='@indexes':
            rows=[['Índice explícito','Definição resumida']]
            for entry in SCHEMA['indexes']:
                m=re.search(r'index\s+(\w+)\s+on\s+(.+);',entry['sql'],re.I);rows.append([m[1],m[2]])
            table(doc,rows,[6.3,9.7])
        elif line=='@migrations':
            titles=['Histórico privado e catálogos','Fila e RPCs de lembretes','Modos local e Brevo','Agendador e invocações privadas']
            table(doc,[['Versão','Contribuição']]+[[m['version'],t] for m,t in zip(SCHEMA['migrations'],titles)],[4.6,11.4])
        elif line=='@functions':
            rows=[['Função','Segurança','Papel e responsabilidade']]
            for name,definition in SCHEMA['functions'].items():
                rows.append([name,definition['security'],FUNCTION_NOTES[name]])
            table(doc,rows,[7.2,2.0,6.8])
        elif line=='@references':
            for key,(title,targets) in REFERENCES.items():
                p=doc.add_paragraph(f'{key}  {title}');p.paragraph_format.keep_with_next=True
                for j,target in enumerate(targets):
                    p=doc.add_paragraph();p.paragraph_format.line_spacing=1.1;p.paragraph_format.space_after=Pt(3)
                    if target.startswith('docs/relatorio-banco/'):
                        p.add_run(target)
                    else:
                        add_link(p,target,target if target.startswith('http') else 'https://github.com/Eduwilll/TG-KEZIA2/blob/49c256d/'+target)
                    for r in p.runs:r.font.size=Pt(9)
                    p.paragraph_format.keep_with_next=j<len(targets)-1
        else:
            doc.add_paragraph(line)
        i+=1
    # Give prose before the first numbered chapter its own heading.
    header=s.header.paragraphs[0];header.text='Prazo Claro   Relatório do banco de dados';header.style=doc.styles['Caption']
    footer=s.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
    run=footer.add_run();field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');run._r.addnext(field)
    core=doc.core_properties;core.title='Banco de dados do Prazo Claro';core.author='Kezia Calixto';core.subject='Concepção modelagem engenharia e infraestrutura de persistência'
    doc.save(OUT/f'{STEM}.docx')
    all_local=sorted({p for _,targets in REFERENCES.values() for p in targets if not p.startswith('http') and (ROOT/p).is_file() and p!='docs/relatorio-banco/schema-inventario.json'})
    manifest={'edition':'2026-11-04','repository_commit':'49c256d','functional_commit':'9632fd2','schema_counts':SCHEMA['counts'], 'sources':[{'path':p,'sha256':hashlib.sha256((ROOT/p).read_bytes()).hexdigest()} for p in all_local], 'external_sources':{k:v for k,v in REFERENCES.items() if k.startswith('T')}, 'docx_sha256':hashlib.sha256((OUT/f'{STEM}.docx').read_bytes()).hexdigest()}
    (BASE/'fontes-e-manifesto.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    with (BASE/'dicionario-de-dados.csv').open('w',encoding='utf-8-sig',newline='') as stream:
        writer=csv.writer(stream);writer.writerow(['tabela','coluna','tipo_sql','aceita_nulo','default','definicao_sql','descricao'])
        for name,definition in SCHEMA['tables'].items():
            for c in definition['columns']:
                writer.writerow([name,c['name'],c['type'],c['nullable'],c['default'] or '',c['definition'],NOTES[c['name']]])
    print(json.dumps({'docx':str(OUT/f'{STEM}.docx'),'diagrams':6,'schema_counts':SCHEMA['counts'],'words':len((BASE/'relatorio.md').read_text(encoding='utf8').split())},ensure_ascii=False))

if __name__=='__main__':build()

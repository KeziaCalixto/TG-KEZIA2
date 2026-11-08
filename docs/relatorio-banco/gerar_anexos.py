"""Pranchas vetoriais ampliadas e consolidação em um único PDF compartilhável."""
from pathlib import Path
import importlib.util
import json
from reportlab.graphics.shapes import Drawing, Rect, String, Line
from reportlab.graphics import renderPDF
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A3, landscape
from reportlab.pdfgen import canvas
from pypdf import PdfReader, PdfWriter

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[1]
STEM = 'prazo-claro-relatorio-banco-de-dados-2026-11-04'
spec = importlib.util.spec_from_file_location('database_report', BASE/'gerar_relatorio.py')
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)

def node(d,x,y,w,h,title,lines,size=11):
    d.add(Rect(x,y,w,h,fillColor=white,strokeColor=HexColor('#5F6F79'),strokeWidth=1))
    d.add(Rect(x,y+h-31,w,31,fillColor=HexColor('#E6ECF0'),strokeWidth=0))
    g.label(d,x+10,y+h-21,title,12,True)
    for i,line in enumerate(lines):g.label(d,x+10,y+h-49-i*15,line,size)

def database():
    d=Drawing(1190,780)
    positions={
        'public.legal_sources':(15,570,330,175),
        'public.legal_rule_versions':(15,295,330,220),
        'public.calendar_versions':(15,25,330,235),
        'public.deadline_calculations':(430,390,330,170),
        'public.deadline_reminders':(430,25,330,330),
        'reminder_private.scheduler_config':(835,570,340,175),
        'reminder_private.scheduler_invocations':(835,295,340,220),
    }
    fk={'public.legal_rule_versions':{'source_id'},'public.deadline_calculations':{'owner_id'},'public.deadline_reminders':{'owner_id','calculation_id'}}
    for name,info in g.SCHEMA['tables'].items():
        x,y,w,h=positions[name];rows=[]
        for c in info['columns']:
            key='PK ' if c['name'] in ('id','singleton','nonce') else ('FK ' if c['name'] in fk.get(name,set()) else '   ')
            rows.append(f"{key}{c['name']} : {c['type']}"+('  [nulo]' if c['nullable'] else ''))
        node(d,x,y,w,h,name,rows,10)
        if name.endswith('legal_rule_versions'):g.label(d,x+10,y+12,'UK (rule_key, version)',10,True)
        if name.endswith('calendar_versions'):g.label(d,x+10,y+12,'UK (calendar_key, version)',10,True)
        if name.endswith('deadline_reminders'):g.label(d,x+10,y+12,'UK parcial: uma geração ativa por cálculo',9.5,True)
        if name.endswith('scheduler_config'):g.label(d,x+10,y+22,'CHECK singleton = true; inicia desligado',10)
        if name.endswith('scheduler_invocations'):g.label(d,x+10,y+12,'UK request_id; sem FK para pg_net',10,True)
    node(d,430,630,330,115,'auth.users  [gerenciada pelo Supabase]',[
        'PK id : uuid','Identidade, e-mail e estado da conta.','Demais campos pertencem ao Supabase Auth.'])
    g.arrow(d,[(180,570),(180,515)],'1 : 0..N',(192,540))
    g.arrow(d,[(595,630),(595,560)],'1 : 0..N',(605,592))
    g.arrow(d,[(595,390),(595,355)],'1 : 0..N',(610,369))
    g.arrow(d,[(760,690),(795,690),(795,180),(760,180)])
    g.label(d,770,762,'FK owner_id',9,True)
    node(d,835,25,340,235,'Leitura do modelo e fronteiras',[
        '7 tabelas próprias; 65 colunas.',
        '4 FKs: setas do pai para o filho.',
        'Exclusão do usuário: cascata nos próprios',
        'cálculos e lembretes. Fonte: RESTRICT.',
        'PK = chave primária; UK = unicidade.',
        '[nulo] = coluna que aceita NULL.',
        'Sem FK entre JSONB e catálogos.',
        'Sem FK entre scheduler e fila HTTP.',
        'Auth / cron / net / Vault são gerenciados.',
        'Dicionário: cap. 5; restrições e índices: cap. 6.',
        'RLS habilitada nas sete tabelas próprias.'
    ],10.5)
    g.save_diagram('banco-geral-completo',d,'''erDiagram
AUTH_USERS ||--o{ DEADLINE_CALCULATIONS : owner_id
AUTH_USERS ||--o{ DEADLINE_REMINDERS : owner_id
DEADLINE_CALCULATIONS ||--o{ DEADLINE_REMINDERS : calculation_id
LEGAL_SOURCES ||--o{ LEGAL_RULE_VERSIONS : source_id
AUTH_USERS { uuid id PK }
'''+ '\n'.join(name.split('.')[-1].upper()+' {\n'+ '\n'.join(' '+c['type'].replace('timestamp with time zone','timestamptz')+' '+c['name']+(' PK' if c['name'] in ('id','singleton','nonce') else (' FK' if c['name'] in fk.get(name,set()) else '')) for c in info['columns'])+'\n}' for name,info in g.SCHEMA['tables'].items()))
    return d

def architecture():
    d=Drawing(1400,875)
    # Boundaries group logical responsibilities; they do not imply separate servers.
    for x,y,w,h,title in [(310,25,455,825,'VERCEL | Monólito modular Next.js'),(810,25,365,825,'SUPABASE | Serviços gerenciados')]:
        d.add(Rect(x,y,w,h,fillColor=HexColor('#F4F6F8'),strokeColor=HexColor('#5F6F79'),strokeWidth=1.2))
        g.label(d,x+12,y+h-25,title,14,True)
    node(d,15,645,250,165,'Usuário e navegador',[
        'React / TypeScript / formulário validado',
        'Simulação e memória cronológica',
        'Histórico privado e lembretes opt-in',
        'Exportação da memória no cliente',
        'Link do e-mail abre a conta própria',
        'HTTPS; cookies e sessão da aplicação'
    ],10.5)
    node(d,330,650,415,140,'Interface e fronteiras HTTP',[
        'SSR; /api/auth/* e /auth/callback',
        '/api/calculate: simulação pública',
        '/api/history: GET / POST / DELETE privados',
        '/api/reminders: programação e cancelamento',
        'Origem, validação, sessão e respostas privadas'
    ])
    node(d,330,485,415,130,'Aplicação e adaptadores',[
        'Zod; calculateForMvp; histórico e snapshots',
        'Cliente SSR sob identidade autenticada',
        'Paginação por proprietário e filtro por regime',
        'Clock externo ao domínio; data de São Paulo'
    ])
    node(d,330,295,415,155,'Domínio puro e catálogos versionados',[
        'TypeScript / Temporal; civil, criminal e trabalhista',
        'Atos, regras, calendários e fontes no código',
        'Motor determinístico: sem rede, banco ou relógio',
        'Resultado provisional / incomplete e memória',
        'Catálogos SQL não substituem a seleção do motor',
        'Revisão jurídica e calendário parcial identificados'
    ])
    node(d,330,45,415,210,'Dispatcher de lembretes | server-only',[
        '/api/internal/reminders/dispatch',
        'Assinatura HMAC + timestamp + nonce consumível',
        'Cliente privilegiado separado; modo brevo',
        'RPCs: claim → prepare → envio → settle',
        'Token, lease e limites de tentativa / janela',
        'Incerteza: sem reenvio automático',
        'probe: diagnóstico sem claim nem e-mail',
        'Segredos somente no ambiente do servidor'
    ])
    node(d,830,650,325,140,'Auth e identidade',[
        'Cadastro / confirmação / login / recuperação',
        'OAuth Google e convites',
        'auth.users e emissão de sessão / JWT',
        'Mensagens de conta pelo SMTP Brevo',
        'Provedor Google configurado no Supabase'
    ],10.5)
    node(d,830,490,325,115,'Data API / PostgREST e RPC',[
        'Cliente comum: JWT da conta + GRANT / RLS',
        'Usuário não escolhe outro owner_id',
        'Serviço: acesso exclusivo ao dispatcher',
        'Sem conexão ORM direta no recorte atual'
    ],10.5)
    node(d,830,260,325,185,'PostgreSQL | dados e integridade',[
        'public: 3 tabelas de catálogo, cálculos e fila',
        'reminder_private: config e invocações',
        '7 tabelas próprias; 65 colunas; 4 FKs',
        'PKs, UKs, CHECKs, índices e políticas RLS',
        'Wrappers públicos; funções internas limitadas',
        'Snapshots JSONB com versões e pendências',
        'Memórias preservadas; autenticidade não atestada',
        'Reservas atômicas: FOR UPDATE SKIP LOCKED'
    ],10)
    node(d,830,45,325,175,'Agendamento e operação privada',[
        'pg_cron: tick por minuto, se habilitado',
        'Vault: segredo dedicado de assinatura',
        'pg_net: HTTPS assíncrono após commit',
        'Nonce / request_id / resposta e resumo',
        'Habilitação exige probe recente elegível',
        'Coleta de resultados e retenção de sete dias',
        'request_id é correlação, sem FK para net'
    ],10.5)
    node(d,1210,665,175,125,'Google OAuth',[
        'Identidade Google',
        'Consentimento da conta',
        'Retorno via Supabase',
        'e callback do aplicativo'
    ],10)
    node(d,1210,440,175,160,'Brevo | dois canais',[
        'SMTP: e-mails do Auth',
        'API: lembretes de prazo',
        'Credenciais separadas',
        'Aceite HTTP não prova',
        'recebimento na caixa',
        'Template com link privado'
    ],10)
    node(d,1210,200,175,115,'Caixa do usuário',[
        'Confirmação / recuperação',
        'Aviso de prazo',
        'Memória exige conta própria',
        'Recebimento: aceite humano'
    ],9.5)
    node(d,15,350,250,235,'Engenharia e entrega',[
        'GitHub privado e Git versionado',
        '4 migrations SQL imutáveis no repositório',
        'GitHub Actions: aplicação e banco',
        'check, audit, build e Playwright',
        'Banco CI: pgTAP e lint em stack descartável',
        'Vercel publica a aplicação',
        'Migrations hospedadas: etapa controlada',
        'CI não é evidência de migração remota',
        'Registros de testes / aceite / operação',
        'Backups e RPO/RTO não validados aqui'
    ],10)
    node(d,15,45,250,245,'Desenvolvimento e ensaio local',[
        'Node / pnpm; Supabase CLI fixada',
        'Docker: PostgreSQL 17 configurado',
        'API 54321; banco 54322; Studio 54323',
        'Mailpit: captura local sem envio externo',
        'Dispatcher local usa loopback',
        'Ambientes isolados: local / preview / prod',
        'Valores de segredos ausentes do relatório',
        'Leitura de código e DDL em 04/11/2026',
        'Sem reinspeção de produção nesta edição',
        'Topologia lógica; região / capacidade',
        'contratada não foram verificadas'
    ],10)
    g.arrow(d,[(265,740),(330,740)],'HTTPS',(274,758))
    g.arrow(d,[(537,650),(537,615)])
    g.arrow(d,[(537,485),(537,450)])
    g.arrow(d,[(745,715),(830,715)],'sessão',(770,729))
    g.arrow(d,[(745,550),(830,550)],'JWT / RPC',(762,565))
    g.arrow(d,[(993,490),(993,445)])
    g.arrow(d,[(993,260),(993,220)])
    g.arrow(d,[(830,120),(745,120)],'HMAC',(770,136),True)
    g.arrow(d,[(745,220),(785,220),(785,510),(830,510)],None,None,True)
    g.label(d,769,246,'RPC',10,True)
    g.arrow(d,[(1155,740),(1210,740)])
    g.arrow(d,[(1155,685),(1190,685),(1190,575),(1210,575)],None,None,True)
    g.label(d,1178,617,'SMTP',9,True)
    g.arrow(d,[(745,70),(790,70),(790,10),(1393,10),(1393,490),(1385,490)])
    g.label(d,1165,20,'Envio pela API HTTPS do Brevo',10)
    g.arrow(d,[(1298,440),(1298,315)])
    g.save_diagram('arquitetura-completa',d,'''flowchart TB
Browser[React formulário histórico e exportação] --> Next[Next.js SSR e Route Handlers na Vercel]
Next --> App[Aplicação validação sessão snapshots e paginação]
App --> Engine[Motor TypeScript determinístico sem IO ou relógio]
Catalog[Atos regras calendários e fontes versionados no código] --> Engine
App --> Auth[Supabase Auth]
Google[Google OAuth] --> Auth
Auth --> SMTP[Brevo SMTP para mensagens de conta]
App --> API[Data API e RPC sob identidade JWT]
API --> DB[(PostgreSQL public e reminder_private com RLS)]
Auth --> Users[(auth.users gerenciada)]
DB --> Scheduler[pg_cron pg_net e Vault]
Scheduler -. HMAC timestamp e nonce .-> Worker[Dispatcher server-only na Vercel]
Worker --> RPC[RPCs de serviço claim prepare settle]
RPC --> DB
Worker --> Brevo[Brevo API transacional de lembretes]
Brevo --> Mail[Caixa de e-mail do usuário]
Mail --> Browser
Git[GitHub e migrations] --> CI[GitHub Actions check build E2E pgTAP lint]
Git --> Next
Local[Docker Supabase CLI PostgreSQL e Mailpit locais] -. ensaio isolado .-> App
''')
    return d

def build():
    db=database();arch=architecture()
    path=BASE/'diagramas/pranchas-ampliadas.pdf'
    w,h=landscape(A3);c=canvas.Canvas(str(path),pagesize=(w,h))
    c.setTitle('Prazo Claro — Diagramas gerais do banco e da arquitetura')
    for number,title,subtitle,d in [
        (1,'Diagrama geral completo do banco de dados','Todas as tabelas e colunas próprias, chaves e quatro relacionamentos impostos por FK.',db),
        (2,'Diagrama completo da arquitetura do sistema','Aplicação, domínio, persistência, autenticação, lembretes, serviços externos e entrega.',arch)]:
        c.setFont('Helvetica-Bold',18);c.drawString(28,h-35,title)
        c.setFont('Helvetica',10);c.drawString(28,h-54,subtitle)
        scale=min((w-50)/d.width,(h-105)/d.height)
        renderPDF.draw(d,c,(w-d.width*scale)/2,45,showBoundary=False) if scale==1 else None
        if scale!=1:
            c.saveState();c.translate((w-d.width*scale)/2,45);c.scale(scale,scale);renderPDF.draw(d,c,0,0);c.restoreState()
        c.setFont('Helvetica',9);c.drawString(28,20,f'Prazo Claro | Edição 04/11/2026 | Prancha {number} de 2 | Fonte: migrations e implementação versionadas.')
        c.showPage()
    c.save()
    print(json.dumps({'atlas':str(path),'pages':2,'format':'A3 landscape'},ensure_ascii=False))

def consolidate(body):
    output=ROOT/'output/documents'/f'{STEM}.pdf'
    r=PdfReader(str(body));writer=PdfWriter(clone_from=r)
    start=len(r.pages);writer.append(BASE/'diagramas/pranchas-ampliadas.pdf')
    for i,title in enumerate(['Diagrama geral completo do banco de dados','Diagrama completo da arquitetura']):writer.add_outline_item(title,start+i)
    writer.add_metadata({'/Title':'Banco de dados do Prazo Claro — relatório completo e arquitetura','/Author':'Kezia Calixto','/Subject':'Concepção, engenharia, modelo de dados, segurança e infraestrutura; diagramas gerais ampliados'})
    with output.open('wb') as f:writer.write(f)
    print(json.dumps({'pdf':str(output),'pages':len(writer.pages),'body_pages':start,'atlas_pages':2},ensure_ascii=False))

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser();parser.add_argument('--consolidar',type=Path);args=parser.parse_args()
    build()
    if args.consolidar:consolidate(args.consolidar)

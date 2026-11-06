# Lembretes opcionais — primeira fatia local

Contrato de 23/10/2026, registrado em `0551e31`; fila/migration em `2777d21`. Implementação local e verificações registradas em [evidências](testing/email-reminders.md); nenhum envio externo ou agendamento de produção autorizado por esta etapa. Reutiliza as fronteiras já adotadas: Route Handlers para contrato/relógio/erros, SQL/pgTAP para permissões e transições persistidas, navegador para interação e integração local real para UI → API → banco → Mailpit → memória privada. Mocks não comprovam RLS nem entrega.

## Escolha e destinatário

- Um lembrete ativo por cálculo salvo, somente pelo proprietário com e-mail confirmado, sem sessão anônima. Ativação explícita; nunca ativar ao salvar um cálculo. Opções: 3 dias antes, 1 dia antes ou no dia, às 09h, 12h ou 18h em `America/Sao_Paulo`. Antecedência em dias corridos de calendário, independente da regra processual.
- Usar vencimento e metadados do snapshot original, sem recálculo/substituição. Memória inválida, incompleta, data passada ou instante de envio já passado não pode ser agendado. No próprio dia, somente horário ainda futuro. Registro continua não verificado e demonstrativo.
- Destinatário é o e-mail confirmado atual da própria conta, consultado novamente antes do envio. Não aceitar endereço, proprietário, vencimento, versões ou timestamp arbitrários na requisição. Mudança de e-mail acompanha o destino atual confirmado; conta excluída impede envio.
- `POST /api/reminders`: `{calculationId,leadDays,hour}`; 201 criado, 400 inválido, 401 sem identidade, 403 e-mail não confirmado/origem inválida, 404 cálculo alheio/ausente, 409 ativo ou horário inelegível, 503 indisponível. JSON estrito e cache privado. RPC valida propriedade e horário também para acesso direto pela Data API.
- `GET /api/reminders?ids=uuid,uuid`: até 50 IDs, retorna estado mais recente por cálculo da página e disponibilidade local. Totais privados e nenhum e-mail/endereço privilegiado no retorno. `DELETE /api/reminders`: `{id}` ou `{all:true}` cancela um ou todos os lembretes ativos da conta, inclusive de outras páginas. Cancelar todos requer confirmação na UI.
- Para reagendar um lembrete ativo, cancelar e criar novo lembrete explicitamente. Novos registros preservam a tentativa anterior; não sobrescrever seus metadados. Exclusão do cálculo/conta remove lembretes associados em cascata. Não existe nova política de retenção automática nesta fatia.

## Persistência e processamento

Tabela de lembretes separada, com RLS de leitura por proprietário, sem INSERT/UPDATE/DELETE diretos para usuários. Escritas são RPCs com parâmetros limitados. Implementações privilegiadas em schema não exposto, `search_path` vazio, qualificações explícitas e EXECUTE revogado de PUBLIC/anon. Wrappers públicos são invoker; funções de usuário verificam identidade/proprietário. Worker tem funções exclusivas de `service_role`; chave somente no servidor.

Estados: `pending`, `processing`, `accepted`, `failed`, `cancelled`, `uncertain`. `accepted` significa aceito pela caixa local/provedor, não entrega externa confirmada. `uncertain` significa que o envio pode ter sido aceito e exige conferência antes de nova tentativa manual.

- Claim transacional com `FOR UPDATE SKIP LOCKED`, lote máximo 20, token aleatório e até três tentativas. Execuções simultâneas não obtêm a mesma tentativa; repetir após aceite não reenvia.
- Janela de execução: até uma hora após o horário agendado, desde que o dia do vencimento não tenha passado. Ao perder a janela, marcar falha; não despejar lembretes antigos ao religar o worker. Ativação nunca aceita horários passados.
- Revalidar estado/token, existência e e-mail confirmado imediatamente antes de enviar. Cancelamento anterior a essa verificação bloqueia envio. Cancelamento concorrente com envio já em curso não recolhe uma mensagem; a UI explica esse limite, e `accepted_at` registra aceite mesmo se houve cancelamento concorrente.
- Falha antes do POST ao Mailpit pode reagendar em cinco minutos, até três tentativas e dentro da janela. Após iniciar o POST, timeout, erro de rede, resposta 5xx ou confirmação ilegível ficam incertos e não são reenviados automaticamente. Rejeição explícita 4xx é falha. Lease de processamento de cinco minutos expirada também fica incerta. Falha ao persistir aceite deixa a tentativa para conferência, sem reenvio automático.
- Logs/respostas operacionais só com contagens e códigos fixos, sem destinatário, título, conteúdo, tokens ou erros brutos do provedor.

## Entrega e interface

Primeiro adaptador: API HTTP de envio do Mailpit local. Exige modo local explícito, URLs de Supabase/app/Mailpit em loopback e segredo do dispatcher exclusivamente no servidor; sem esse conjunto, ativação indisponível. Antes do envio, `/api/v1/webui` deve confirmar `MessageRelay.Enabled:false`; retransmissão habilitada ou configuração desconhecida bloqueia o POST. Não usa SMTP de autenticação nem Brevo. `POST /api/internal/reminders/dispatch` exige Bearer secreto, lote de até cinco por execução; claim SQL suporta até 20 para eventual adaptação própria. Script local permite execução única ou a cada minuto. Nenhum cron remoto é criado.

E-mail mínimo, profissional e em pt-BR: vencimento estimado original, antecedência/horário/fuso, identificação curta do cálculo e link `/historico?calculationId=UUID`. Não inclui título livre, partes, número processual, senha ou token de sessão. Link exige login e preserva RLS; usuário sem sessão entra e reabre o link. O aviso de simulação/calendário parcial/revisão pendente é obrigatório.

Histórico mostra opções por registro elegível, estado textual, horário/fuso e cancelamento. Não exibir envio como entrega confirmada. Erros acessíveis, feedback de carregamento, confirmação de cancelamento em lote e foco visível. Consultar disponibilidade/estados somente quando houver registros carregados; mudanças de página/filtro descartam respostas antigas.

## Casos de aceite

- Vencimento 07/01/2030, três dias antes às 09h SP → 04/01/2030 12:00Z; um dia antes → 06/01/2030 12:00Z, mesmo sendo domingo. No dia às 18h → 07/01/2030 21:00Z. Calendário processual não entra nessa subtração.
- Timestamp igual ao agora, passado, vencimento passado, incompleto, versão/memória inválida: rejeitar sem criação. Capturar data original e versões; não recalcular.
- Acesso direto por anon, usuário anônimo, conta sem confirmação e segundo proprietário; forjar data/endereço/estado/token deve falhar. Não alterar privilégios do histórico existente.
- Claim repetido/concomitante, cancelamento antes da preparação e em curso, exclusão, conta sem confirmação no envio, falha antes/depois do POST, lease expirado, terceira tentativa e perda da janela.
- Navegador: ativar/cancelar, cancelar todos, erros/vazio/teclado/mobile, seguir mensagem no Mailpit até memória privada; registrar comandos, falhas e limpeza real em `docs/testing/`.

Fontes técnicas consultadas: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [funções](https://supabase.com/docs/guides/database/functions), [changelog](https://supabase.com/changelog), [locking/SKIP LOCKED](https://www.postgresql.org/docs/current/sql-select.html) e [API Mailpit](https://mailpit.axllent.org/docs/api-v1/). Markdown do changelog não pôde ser aberto pela ferramenta; HTML consultado. Alterações recentes de TLS remoto não mudam esta stack HTTP local; nenhuma atualização de SDK necessária.

## Executar localmente

1. Iniciar a stack e preparar o `.env.local` público conforme [instalação](entrega/instalacao.md). Aplicar migrations pendentes com `pnpm exec supabase migration up --local`; não resetar um banco com dados para ativar o recurso.
2. Executar `pnpm reminders:configure:local`. O helper recusa ambiente público apontando para outro servidor, obtém a credencial da stack local somente em memória e grava configuração/segredo no `.env.local` ignorado pelo Git, sem imprimir valores. Não copiar essas variáveis para Vercel ou para o browser.
3. Reiniciar o app (`pnpm dev`, ou `pnpm build` seguido de `pnpm start`). Entrar com conta local confirmada, salvar cálculo elegível, escolher opções e ativar no histórico.
4. Em outro terminal do projeto, executar `pnpm reminders:watch` para consultar a fila a cada minuto. Deixá-lo em execução durante o ensaio; Ctrl+C encerra. `pnpm reminders:dispatch` executa um lote único. Ambos só imprimem contagens/códigos, sem destinatário ou credenciais.
5. Conferir mensagens no [Mailpit local](http://127.0.0.1:54324). Se perder a janela de uma hora, o lembrete falha e exige nova escolha futura; não alterar a data de um cálculo real para ocultar a falha.

Repetir a integração isolada com `pnpm db:test:reminders`: duas identidades e cálculos fictícios, opt-in/cancelamento no browser, duas execuções simultâneas, uma mensagem, link privado e limpeza. O helper antecipa **somente o horário da linha fictícia do lembrete** no banco local para testar envio imediato; não existe parâmetro de produção para ignorar o relógio e o snapshot original não muda. Não usar essa preparação em dados reais. A integração anterior `pnpm db:test:app` permanece como regressão de Auth/histórico/perfis.

Para desativar o recurso local, encerrar o watcher e remover o valor de `REMINDERS_MODE`, depois reiniciar o app. Isso desabilita a interface/dispatcher; cancelar previamente os registros ativos evita que sejam retomados em outra execução dentro da janela. Uma implantação externa exige provedor de aplicação, scheduler, configuração segura, nova confirmação do ambiente e ensaio próprio de entrega; SMTP do Auth não resolve esses passos.

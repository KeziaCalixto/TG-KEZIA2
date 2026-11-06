# Contratos HTTP — primeira fatia

Interface JSON. Datas civis no formato `AAAA-MM-DD`, sem conversão pelo fuso da máquina. O motor usa `America/Sao_Paulo` como metadado explícito. Respostas de conta e histórico usam `Cache-Control: private, no-store`.

## POST /api/calculate

Público e sem persistência. Exemplo de corpo:

```json
{
  "regime": "civil",
  "court": "TJSP",
  "locality": "São Paulo",
  "medium": "electronic",
  "communication": "publication",
  "eventDate": "2026-10-06",
  "days": 5
}
```

`medium`: `electronic` ou `physical` (suporte dos autos). `communication`: `publication` ou `availability`, sempre no recorte de diário sem intimação pessoal. `days`: inteiro de 1 a 365, sujeito à cobertura de 2026. Campos desconhecidos são rejeitados; o cliente não pode substituir calendário ou resultado.

200 retorna `CalculationResult`: estado `provisional` ou `incomplete`, entrada normalizada, evento, publicação, marco excluído, primeiro dia computado, `dueDate` (nulo se incompleto), `trace`, `sources`, `warnings`, `metadata` e `snapshot.calendar`. Estado incompleto é resposta de domínio, não erro de transporte. Não há estado de resultado juridicamente aprovado nesta fatia.

400: entrada/JSON inválido. 413: corpo excessivo. Resposta sem cache. A interpretação jurídica de exceções não é delegada ao navegador nem a modelos de linguagem.

`locality` aceita uma das dez comarcas do [catálogo SP 2026](../legal/sources/sp-comarcas-2026.md). O servidor seleciona o calendário correspondente. Localidades fora do catálogo são recusadas.

Continuação local de 21/10: aceita também `regime: "labor"`, `court: "TRT2"`, somente `locality: "São Paulo"`; ou `regime: "criminal"`, `court: "TJSP"`, nas mesmas dez comarcas civis cadastradas. Nos dois perfis novos, `context` é obrigatório: `ordinary`, `custody`, `domestic_violence`, `urgent`, `special` ou `unknown`. Somente `ordinary` confirmado é elegível; os demais retornam estado incompleto. Ausência de contexto, combinação incompatível ou localidade não coberta retorna 400. Civil preserva o corpo anterior e não recebe `context`. Comunicação continua sendo apenas `publication`/`availability` no DJEN, sem intimação pessoal exigível.

Ampliação criminal: nove calendários municipais novos e regra de âmbito `.demo.2`; Capital conserva versões `.demo.1`. [Fonte, compatibilidade e casos](../legal/sources/criminal-sp-comarcas-2026.md). Cobertura TJSP limitada a 2026.

Trabalhista TRT-2 Capital: calendário anual 2027 e composição 2026–2027, com `snapshot.calendar.components` opcional. Cada componente identifica sua versão, âmbito, consulta, intervalo e completude; eventos/fontes permanecem no snapshot completo. Entradas de 2026 já calculáveis mantêm a seleção anterior; travessias usam o composto, sem preencher lacunas de datas. Fora de 2027/entrada em 2028 permanece incompleto. [Fonte e aceites](../legal/sources/labor-sp-2027.md). O campo é opcional para preservar a leitura de históricos anteriores; não é uma certificação de autenticidade.

Os novos resultados incluem `nominalDueDate` e `snapshot.rule` (ID, versão, regime, método, vigência do perfil, âmbito e revisão). Criminal pode gerar datas com `phase: "extension"`: prorrogação não consome unidades. A origem dos calendários é controlada pelo servidor; não há parâmetro para o cliente injetar uma regra/calendário. [Regras, limites e verificações](../testing/multi-regime.md).

## Ato processual opcional (continuação local de 22/10)

Acrescente `act: {"id":"civil-appeal","version":"2026-10-22.demo.1","eligibility":"confirmed"}` ao corpo civil com `days:15`. Outros IDs desta versão: `labor-ordinary-appeal` (trabalhista, 8 úteis) e `criminal-sentence-clarification` (criminal, 2 processuais com curso contínuo após início útil). Os demais campos e o contexto ordinário dos novos perfis continuam obrigatórios. [Cabimento, vigências e casos](../legal/rules/procedural-acts-2026-10-22.md).

`eligibility` aceita `unknown`, `confirmed` ou `excluded`, sem confirmação automática na UI. ID/versão indisponíveis, ato incompatível, duração divergente, dúvida/exclusão ou contexto excepcional retornam 200 com estado incompleto, vencimento nulo e bloqueios explícitos. Estrutura malformada/campos desconhecidos retornam 400. O servidor resolve o catálogo; não aceita duração/fonte/título do ato enviados pelo cliente como autoridade.

Resultados com ato usam motor de composição `0.4.0`; `metadata.countingEngineVersion` identifica a contagem interna quando executada. `metadata.actId`/`actVersion`, `snapshot.act` (duração, âmbito, suporte, consulta, condições, exclusões e fontes) e a declaração em `input.act` acompanham a memória. `supportFrom` é início do suporte do catálogo, não vigência da lei. Sem `act`, resultados e versões anteriores permanecem preservados.

O histórico guarda esses campos no JSON existente, sem migration. O recálculo separado compara também ID/versão do ato e versão interna de contagem; não substitui o snapshot original. O leitor aceita memórias anteriores sem esses campos. Cálculos com condições não confirmadas não são salvos (422). Não verifica admissibilidade ou efeitos de protocolo/embargos sobre outros prazos.

## Conta

| Rota | Corpo / resposta | Controle |
| --- | --- | --- |
| POST `/api/auth/signup` | `{email,password}`; mensagem genérica e confirmação por e-mail | JSON, mesma origem, Supabase Auth |
| POST `/api/auth/login` | `{email,password}`; sessão por cookie SSR | JSON, mesma origem, identidade validada |
| POST `/api/auth/logout` | encerra sessão atual | Mesma origem |
| GET `/api/auth/session` | `{configured,user}`; sem chaves ou tokens | Verifica identidade via `getUser` |
| GET `/auth/callback` | código PKCE; redireciona para `/` | Troca código por sessão; sem redirecionamento arbitrário |

E-mail até 254 caracteres; senha de 8 a 128. Sem configuração, operações dependentes retornam 503; consulta de sessão informa `configured:false`. Cadastro real/entrega de e-mail dependem do ambiente Supabase.

OAuth Google: POST `/api/auth/google`, mesma origem, provedor fixo e callback PKCE. Recuperação: POST `/api/auth/recovery` com `{email}`, mesma origem, resposta genérica (200), entrada inválida (400), limite de envio (429), indisponibilidade (503). O callback com `flow=recovery` só conduz à definição de senha após troca válida de código. POST `/api/auth/password` requer sessão verificada e `{password,confirmation}`. Essas rotas não aceitam ID de usuário ou destino externo.

## Histórico privado

GET `/api/history?page=1&pageSize=10&regime=civil`: parâmetros opcionais; página inteira 1–1.000, tamanho 1–50 (padrão 10) e ramo `civil`, `labor` ou `criminal`. Parâmetros desconhecidos/repetidos ou valores inválidos retornam 400. Filtro de proprietário é fixo no servidor, com regime sobre `input.regime` antes do intervalo/contagem; ordem decrescente por `created_at`, depois `id`. [Contrato e limites de concorrência](../history-organization.md).

Continuação de lembretes: `calculationId=UUID` opcional acrescenta igualdade por ID sob o mesmo proprietário, inclusive no fallback de contagem. `/historico?calculationId=UUID` abre a memória original se pertencer à conta; link não contém sessão ou credencial e exige login. Lista vazia não revela a existência de registro alheio.

Resposta: `{calculations,pagination,asOfDate,timeZone}`. `pagination` contém `page`, `pageSize`, `total`, `totalPages` (mínimo 1), `hasPrevious` e `hasNext`. Totais restritos ao mesmo proprietário/filtro; página além do total devolve lista vazia e metadados para recuperação da UI, inclusive após `PGRST103` do PostgREST. Erro de consulta/contagem retorna 503, sem simular conta vazia. Busca textual da interface é somente na página carregada, não um parâmetro de busca global.

Cada item mantém `result_snapshot` original e, apenas quando as versões coincidem, `recomputed` separado. Acrescenta `dueStatus: future|today|past|undetermined`, comparando vencimento do snapshot original defensivamente validado com `asOfDate`, capturado uma vez no GET em `America/Sao_Paulo`. Não usa data do recálculo, não altera memória e não indica cumprimento/validade jurídica. Memória ilegível/incompleta ou vencimento nulo fica indeterminado. `integrity:"unverified"` permanece explícito; RLS e filtros por usuário se complementam.

POST `/api/history`: `{input,title?}`. O servidor ignora resultados calculados pelo navegador, valida entrada e recalcula. Não salva estado incompleto. 201 retorna `{calculation}`. Título até 120 caracteres. DELETE recebe `{id}` UUID; exclui somente registro do proprietário e retorna 404 se ausente/inacessível.

401 sem identidade válida, 403 para origem externa em mutações, 400 entrada inválida, 422 cálculo incompleto, 503 configuração/banco indisponível. Nenhum endpoint exige ou devolve chave privilegiada.

O Data API do Supabase pode receber inserções do próprio usuário: RLS protege a propriedade, mas não assina o JSON. A interface trata snapshots como conteúdo não confiável e conserva resultados originais sem alegar validação. Evidências imutáveis/assinadas exigem uma fatia própria.

## Lembretes locais opcionais

Continuação externa de 23/10: [contrato incremental](../email-reminders-external.md). Em Brevo, GET inclui `mode:"brevo"`; a listagem sempre limita o modo escolhido no servidor, além do proprietário. POST externo requer `externalEmailConsent:true`; em modo local esse campo deve estar ausente. Divergência retorna 409 para atualizar/confirmar o destino novamente. Preview e configuração externa incompleta permanecem indisponíveis. Dispatcher passa a suportar Brevo em produção explicitamente habilitada, mantendo Bearer e fila separados por modo; scheduler hospedado ainda não implantado. Os parágrafos abaixo preservam o contrato local de entrada.

`GET /api/reminders?ids=UUID,UUID`: até 50 IDs da página; `{available,reminders}` com a geração mais recente por cálculo, sob RLS e proprietário. Inclui ID, vínculo, data original, opções/horário/fuso, estado e aceite; não retorna destinatário ou token de claim. Sem habilitação local, retorna `{available:false,reminders:[]}` sem consultar dados. Quando disponível, exige identidade válida.

`POST /api/reminders`: JSON estrito `{calculationId,leadDays:0|1|3,hour:9|12|18}`, mesma origem, proprietário com e-mail confirmado, memória original legível/provisória e instante futuro. 201 `{id}`. Validação 400, identidade 401, origem/confirmação 403, cálculo ausente/alheio 404, geração ativa/horário inelegível 409, indisponibilidade 503. Não recebe data, destinatário, proprietário ou estado arbitrários.

`DELETE /api/reminders`: `{id}` ou `{all:true}`, mesma origem/identidade. Cancela ativos da conta; retorna `{cancelled:n}`; ID não ativo/ausente/alheio retorna 404. Todos inclui outras páginas. Cancelamento não recolhe uma mensagem já em curso.

`POST /api/internal/reminders/dispatch`: endpoint de máquina, Bearer privado para execução administrativa/local ou assinatura descartável para o agendador hospedado. POST legado vazio continua sendo dispatch, inclusive stream com Content-Length zero fornecido pelo Next.js. Corpo presente exige JSON estrito `{operation:"dispatch"|"probe"}`; inválido retorna 400. Lote de até cinco, limitado ao modo escolhido no servidor; devolve contagens de obtidos/aceitos/falhas ou tentativas/incertos/ignorados. 401 sem autorização válida, 503 desativado/falha. Chave privilegiada é usada por cliente sem sessão de usuário, somente no servidor; nunca devolvida. [Contrato local](../email-reminders.md) e [externo](../email-reminders-external.md).

Assinatura hospedada usa os três headers X-Prazo-Timestamp, X-Prazo-Nonce e X-Prazo-Signature, vinculando método/caminho/modo/operação/timestamp/nonce no [formato canônico do ADR 0006](../architecture/adr/0006-agendamento-com-assinatura-descartavel.md). Recusa chamada fora da janela ou repetida; consumo transacional por RPC exclusiva de serviço ocorre antes do processamento. A chave de assinatura não atravessa o pg_net. `probe` verifica configuração/remetente sem claim/envio e pode funcionar com entrega desligada: 200 `{probe:true,providerReady:true,deliveryEnabled:boolean}` ou 503 com código fixo e, se reconhecido, IPv4 validado de bloqueio no Brevo. Não reflete mensagem bruta do provedor. Esses resultados exigem autenticação e não são endpoint público de diagnóstico. [Instalação inativa, observação e suspensão](../reminder-scheduler-operations.md).

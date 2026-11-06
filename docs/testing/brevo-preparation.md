# Preparação do Brevo — 23/10/2026

Escopo deste avanço: orientação de credencial e helper standalone de verificação sandbox. [Procedimento e fontes](../brevo-setup.md). Nenhum adaptador de produção, migration, scheduler ou envio real foi implantado neste marco.

## Verificações executadas

- `node --check supabase/scripts/check-brevo-sandbox.mjs`: exit 0.
- `pnpm exec prettier --write supabase/scripts/check-brevo-sandbox.mjs package.json`: exit 0. O helper está fora do glob padrão de `format:check` e foi formatado explicitamente.
- `git check-ignore .env.reminders.external.local`: confirmou o arquivo ignorado. Conteúdo secreto não foi exibido; a inspeção mostrou somente os booleanos `apiKeyConfigured:false` e `senderConfigured:false`.
- `pnpm reminders:check:brevo`: exit 1 esperado com os campos ainda vazios; mensagem genérica de configuração, sem tentativa HTTP depois da validação inicial.
- `pnpm check`: typecheck, lint e format:check aprovados. O Vitest falhou ao iniciar com `spawn EPERM`, restrição de criação de processos do ambiente.
- Nova execução de `pnpm test`, com autorização para criação dos processos: exit 0, **18 arquivos e 224 testes aprovados**. Nenhum teste de regra processual foi alterado.

Revisão do código: URLs fixas do Brevo, redirecionamento recusado, timeout de dez segundos por requisição, remetente ativo obrigatório, sandbox incondicional no JSON, conteúdo técnico sem dados de cálculos e ausência de dependência/conexão com Supabase. Logs usam somente mensagens fixas e status HTTP, sem corpo bruto da resposta. Nenhuma dependência nova.

## Evidências ainda pendentes

**Atualização desta mesma data:** após substituir a chave SMTP por uma chave de API restrita, o comando ainda retornou HTTP 401. A configuração foi conferida somente por booleanos: formato de API, ausência de espaços/quebras e correspondência entre arquivo e ambiente efetivo. Consultas de remetentes/conta recusadas; diagnóstico da mensagem da conta, por vocabulário permitido, apontou IP não reconhecido. O responsável informou a liberação da origem no painel. A execução seguinte de **`pnpm reminders:check:brevo` retornou exit 0**, com chave aceita, remetente ativo e **sandbox HTTP 201 com `messageId` válido**. Nenhuma mensagem real foi enviada e nenhuma fila foi processada. Não se armazenou a chave, endereço de remetente, IP ou corpo do provedor nesta evidência.

Permissões usadas: acesso restrito, e-mails transacionais Todos e Conta Lidas; demais recursos Nenhum. O helper recebeu orientação específica para IP bloqueado, reconhecendo também a grafia britânica `unrecognised`/`authorise`, sem imprimir mensagens brutas. A liberação local não comprova a futura origem da Vercel nem conclusão da configuração de produção.

Na preparação inicial, o responsável solicitou orientação para criar a chave de API; os campos estavam vazios. Após informar o preenchimento, `pnpm reminders:check:brevo` consultou o provedor e recebeu **HTTP 401**, antes de qualquer requisição transacional. Inspeção restrita a booleanos confirmou credencial com formato SMTP, sem espaços externos/quebra de linha e remetente preenchido. Nenhum valor da credencial foi exibido. O responsável foi orientado a substituir somente o campo da API, preservando o SMTP do Supabase.

Foi acrescentada detecção antecipada do formato SMTP com mensagem específica, antes de qualquer requisição HTTP. Esse era o impedimento inicial, agora superado conforme a atualização acima. As verificações de sintaxe/lint isoladamente não comprovam o contrato HTTP do provedor; a execução real do sandbox foi registrada separadamente.

Verificação da correção: execução do helper com chave SMTP **fictícia** e `fetch` substituído por uma função que falha se chamada retornou a mensagem específica e exit 1, sem atingir a função de rede. `node --check`, Prettier do helper, ESLint do helper e `git diff --check` retornaram exit 0. Apenas o helper operacional/documentação mudaram; não se repetiu a suíte do domínio nem se afirmou sucesso do provedor com esse ensaio controlado.

Mesmo um HTTP 201 em sandbox não comprova entrega: o Brevo descarta a mensagem e não cria logs de e-mail nesse modo. Ensaiar separadamente entrega real por opt-in do proprietário e agendamento hospedado, mantendo as filas locais isoladas. O dispatcher atual permanece restrito ao Mailpit local.

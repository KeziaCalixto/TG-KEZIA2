# Prazo Claro

Guia de entrega do aplicativo

Referência de 24 de outubro de 2026 · Versão funcional 9632fd2

## Finalidade deste documento

Este guia reúne o que a responsável pelo trabalho de graduação precisa saber para usar, explicar e entregar o Prazo Claro. Apresenta o recorte implementado, os principais fluxos, a instalação local, as evidências de teste e as pendências. O aplicativo e os materiais do recorte acadêmico estão implementados e publicados; o aceite de recebimento do lembrete por e-mail ainda está em andamento.

O Prazo Claro é uma aplicação acadêmica de contagem de prazos processuais, com memória que permite conferir as datas e as decisões da simulação. A cobertura dos calendários é parcial e a revisão jurídica profissional permanece pendente. As datas exibidas são estimativas demonstrativas.

Este material é um guia funcional e técnico de entrega. O relatório acadêmico deverá seguir o modelo da instituição e registrar a autoria, os objetivos, o método e os resultados efetivamente obtidos. Pesquisa com participantes e aprovação jurídica não foram declaradas concluídas.

## Acesso e arquivos

| Item | Referência |
| --- | --- |
| Aplicativo publicado | https://tg-kezia2.vercel.app |
| Repositório privado | https://github.com/Eduwilll/TG-KEZIA2 |
| Versão funcional conferida | 9632fd2 |
| Base documental consultada | db20d4b |
| Documentos de entrega | docs/entrega/ |

Para usar o site, não é necessário instalar o projeto. A calculadora pública funciona sem conta. Salvar histórico e ativar lembretes exige uma conta. O mantenedor deve conceder acesso ao repositório privado a quem precisar consultar o código.

## Estado da entrega

Estão disponíveis os perfis parciais civil, criminal e trabalhista de São Paulo, catálogo inicial de atos, calendário e fontes, memória, exportação JSON e impressão em PDF. Conta por e-mail e Google, convite, recuperação de senha e histórico privado integram o aplicativo.

O agendador de lembretes está ativo. Um novo teste foi confirmado para 24/10 às 18h de São Paulo, após um teste anterior inconclusivo. Recebimento e abertura da memória por esse e-mail continuam pendentes na elaboração deste guia. As tarefas finais estão detalhadas na última seção.

<!-- pagebreak -->

## Recorte de cálculo e cobertura

Cada perfil combina ramo, tribunal, localidade, comunicação, calendário e condições de aplicação. Escolher um ramo não significa que o sistema cobre todos os procedimentos daquele ramo. A comunicação implementada nesta entrega é a publicação ou disponibilização no DJEN.

| Perfil | Tribunal e localidade | Período do calendário | Comportamento no recorte |
| --- | --- | --- | --- |
| Civil comum | TJSP nas dez comarcas cadastradas | 2026 | Dias úteis, com marcos, suspensões e prorrogação do perfil |
| Criminal comum | TJSP nas mesmas dez comarcas | 2026 | Início útil, curso contínuo e prorrogação própria; exige contexto ordinário |
| Trabalhista comum | TRT 2 São Paulo Capital | 2026 e 2027 | Dias úteis, condições próprias e composição dos calendários anuais |

As dez comarcas cadastradas são São Paulo, Campinas, Guarulhos, Osasco, Ribeirão Preto, Santo André, Santos, São Bernardo do Campo, São José dos Campos e Sorocaba. A seleção corresponde ao município sede e às premissas registradas nas fichas de cobertura.

### Condições e exclusões

Nos perfis criminal e trabalhista, o usuário precisa conferir e confirmar o contexto ordinário. Se o contexto for desconhecido ou especial, a aplicação não emite vencimento. Essa confirmação é uma declaração de entrada, não uma revisão jurídica do caso.

O recorte criminal exclui prazo penal material, réu preso, violência doméstica, urgência e procedimentos especiais. O trabalhista é limitado ao TRT 2 Capital e às condições explicitadas no formulário. As demais especialidades e prerrogativas exigem novas regras e aceites.

Juizados, AR, mandado, citação, Domicílio Judicial Eletrônico, prazos em horas, meses ou anos, dobro de prazo, interrupções e outros contextos fora do catálogo não estão implementados nesta entrega. TRT 15 e TJSP em 2027 também não estão cobertos.

### Catálogo inicial de atos

Há um ato específico por perfil: apelação contra sentença civil, recurso ordinário contra decisão de Vara do Trabalho e declaração de sentença penal de primeiro grau. A seleção fixa a quantidade de dias e exige confirmação das condições. A quantidade manual permanece disponível. O catálogo é inicial e não decide cabimento, protocolo ou efeitos sobre outros prazos.

As fichas de fontes, vigência, condições e revisão ficam em docs/legal/. Deve-se consultar a ficha aplicável antes de ampliar o uso ou afirmar que uma unidade possui cobertura completa.

<!-- pagebreak -->

## Fazer e conferir uma simulação

1. Abrir a Calculadora e selecionar o regime processual. Conferir tribunal, comarca e período suportado.
2. Informar se a data é de publicação ou disponibilização no DJEN. Esses eventos não representam o mesmo marco.
3. Informar a data pertinente e a quantidade de dias, ou escolher um ato do catálogo. Nos perfis que o exigem, conferir o contexto ordinário.
4. Acionar Calcular prazo. Alterar uma entrada invalida o resultado anterior; calcular novamente após a alteração.
5. Ler o estado do resultado, os avisos, os marcos e a trilha diária. Abrir as referências para conferir os fundamentos.
6. Exportar o JSON, imprimir a memória ou, com conta ativa e resultado elegível, salvar no histórico.

### Exemplo inicial

Selecionar Civil, TJSP, São Paulo Capital, publicação em 06/10/2026 e cinco dias. Nas premissas demonstrativas registradas, o resultado esperado é 14/10/2026. O botão Preencher um exemplo prepara esse caso. Conferir na memória a exclusão do marco inicial e do dia 12/10.

| Campo da memória | Como interpretar |
| --- | --- |
| Evento e publicação considerada | Data informada e comunicação determinada pelo perfil |
| Dia do começo e primeiro computado | Marco inicial e primeira unidade que entra na contagem |
| Trilha diária | Inclusão, exclusão, suspensão ou prorrogação e seu motivo |
| Fontes e versões | Regra e calendário efetivamente usados na simulação |
| Pendências e avisos | Restrições que acompanham o resultado e a exportação |

### Resultado demonstrativo ou incompleto

Um resultado demonstrativo pode apresentar data estimada dentro das premissas e da cobertura declaradas. Ele mantém os avisos de calendário parcial e revisão pendente.

Um resultado incompleto não apresenta vencimento, pois faltam informações, a cobertura é insuficiente ou o contexto não é suportado. Não se deve trocar a entrada apenas para remover a pendência. O JSON conserva o estado e o motivo; cálculos incompletos não são elegíveis para salvar no histórico desta entrega.

### Exportar e imprimir

O JSON registra entradas, resultado, memória, fontes, versões e avisos. A impressão permite salvar uma cópia em PDF pelo navegador. Ao abrir um cálculo do histórico, exportar ou imprimir a memória original selecionada, sem apresentar o snapshot como uma prova de autenticidade jurídica.

<!-- pagebreak -->

## Conta e histórico privado

### Cadastro e entrada

Na tela de acesso, escolher Criar conta e preencher e-mail e senha. Após resposta aceita, o site abre Confira seu e-mail. Abrir o link da mensagem no mesmo navegador em que o cadastro foi iniciado, para concluir a confirmação e o acesso. Se a mensagem não aparecer, conferir spam e aguardar o intervalo do provedor.

A resposta de cadastro é neutra para preservar a privacidade da conta. Exibir a orientação não comprova que uma mensagem chegou. Um erro, inclusive limite de envio, mantém o formulário com a mensagem correspondente.

Também é possível usar Continuar com Google no ambiente hospedado configurado. Um convite enviado pelo administrador possui fluxo próprio: aceitar o convite no e-mail e definir a senha quando solicitado. Cadastrar novamente não substitui a aceitação de um convite.

### Recuperação de senha

Escolher Esqueci minha senha, solicitar a recuperação para a própria conta e abrir o link no mesmo navegador da solicitação. Definir a nova senha e conferir o acesso. Se o link expirou ou já foi usado, iniciar uma solicitação nova. Não compartilhar senha, código ou link de Auth.

O responsável confirmou no site publicado o cadastro, recebimento da confirmação, abertura do link e entrada com a conta nova. A recuperação de senha também foi confirmada por ele. A página de orientação foi acrescentada depois desse relato e validada por testes de navegador e integração local real.

### Salvar e consultar o histórico

Salvar uma simulação elegível com um título fictício. Abrir Histórico de cálculos, selecionar o regime e usar a paginação. O filtro por ramo consulta os registros daquele ramo no servidor; a busca textual Buscar nesta página considera apenas a página carregada.

Abrir a memória original e conferir a entrada e as versões. O histórico preserva o resultado salvo. A interface identifica o snapshot como não verificado e separa eventual recálculo disponível, sem substituir silenciosamente o original por versões novas.

As situações futura, para hoje ou vencida comparam a data estimada original à referência de São Paulo. Não indicam que um ato foi praticado ou que um prazo está juridicamente válido. Usar Atualizar histórico ou voltar o foco à janela para atualizar a consulta.

### Excluir registros

A exclusão exige confirmação. Excluir um cálculo também remove os lembretes associados. Exportações já baixadas e mensagens já recebidas permanecem fora dessa exclusão. Durante um teste de lembrete, manter o cálculo salvo até concluir a conferência do e-mail e da memória.

<!-- pagebreak -->

## Lembretes por e-mail

O lembrete é opcional e vinculado a um cálculo salvo elegível. Salvar um cálculo sozinho não agenda mensagem. É necessário e-mail confirmado, horário futuro e consentimento explícito na seção do Histórico.

| Opção | Valores disponíveis |
| --- | --- |
| Antecedência | 3 dias antes, 1 dia antes ou no dia |
| Unidade da antecedência | Dias corridos de calendário, sem alterar a contagem processual |
| Horário | 09h, 12h ou 18h |
| Fuso exibido | America/Sao_Paulo |
| Destino | E-mail confirmado atual da conta proprietária |

A confirmação do agendamento aparece no site. O e-mail é o lembrete no horário escolhido; não há uma mensagem imediata adicional de confirmação do agendamento. Não é necessário manter o navegador aberto para o processamento hospedado.

| Estado | Significado |
| --- | --- |
| Agendado | Aguardando o horário previsto |
| Em processamento | Uma execução obteve a tentativa para envio |
| Aceito pelo serviço | O provedor aceitou a mensagem; recebimento ainda não comprovado |
| Não enviado | Tentativa encerrada sem envio confirmado |
| Envio incerto | Pode ter havido aceite; conferir antes de reagendar |
| Cancelado | Geração cancelada; envio já em curso pode ter sido aceito |

### Ensaio que ainda precisa ser concluído

O teste de 24/10 às 09h ficou inconclusivo: o responsável informou que não recebeu a mensagem e excluiu o cálculo, sem lembrar o horário. A exclusão em cascata explica a fila vazia, mas não permite afirmar se ocorreu antes do envio previsto.

Um novo agendamento foi conferido às 13h44 de 24/10 para as 18h de São Paulo, com três dias de antecedência e vencimento estimado em 27/10. Estava aguardando, sem erros, com agendador ativo. Recebimento e abertura do vínculo permaneciam pendentes na elaboração deste guia.

Manter o cálculo e o lembrete ativos até receber o e-mail, conferir spam e abrir a memória sob a conta proprietária. Só então excluir o registro de teste, se desejar. Em caso de ausência da mensagem, registrar o horário e o estado antes de apagar qualquer dado. Não alterar send_at no banco para antecipar o ensaio.

<!-- pagebreak -->

## Roteiro de apresentação

Preparar dados fictícios, conta de demonstração e um PDF já exportado. O roteiro detalhado está em docs/entrega/demonstracao.md. A duração abaixo é uma proposta de ensaio, não uma medição de apresentação já realizada.

| Tempo aproximado | O que demonstrar |
| --- | --- |
| 1 minuto | Problema, recorte de São Paulo e avisos acadêmicos |
| 3 minutos | Exemplo civil, marcos, trilha diária e referências |
| 2 minutos | Comparação de comarca ou perfil e consulta do calendário |
| 2 minutos | Conta, histórico original e exportação JSON ou PDF |
| 1 a 2 minutos | Lembrete, privacidade e limites da entrega |

### Casos preparados

| Caso didático | Entrada resumida | Estimativa esperada |
| --- | --- | --- |
| Civil na Capital | Publicação 06/10/2026 e 5 dias | 14/10/2026 |
| Civil em Santos | Publicação 04/09/2026 e 1 dia | 09/09/2026 |
| Civil na Capital para comparar | Publicação 04/09/2026 e 1 dia | 08/09/2026 |
| Criminal comum na Capital | Publicação 06/10/2026 e 5 dias, contexto ordinário | 13/10/2026 |
| Trabalhista TRT 2 Capital | Publicação 17/12/2026 e 10 dias, contexto ordinário | 03/02/2027 |

Os resultados acima são casos de referência documentados para as premissas demonstrativas. No criminal, explicar a diferença entre curso contínuo e prorrogação; no trabalhista, mostrar as duas versões anuais quando a simulação atravessar 2026 e 2027. Não transferir automaticamente o calendário de um tribunal para outro.

Mostrar também um contexto desconhecido ou uma lacuna de cobertura que produza resultado incompleto. Explicar por que o sistema não inventa uma data nessa condição. Esse exemplo ajuda a apresentar o limite do recorte e o motivo dos avisos.

### Contingência

Se conta ou conexão estiver indisponível, usar a calculadora pública quando acessível e os arquivos preparados. Identificar a indisponibilidade daquele momento. Uma captura de tela ou um PDF já gerado não deve ser apresentado como uma integração acontecendo ao vivo.

O ensaio deve incluir uma passagem no celular e a leitura das mensagens de erro e avisos. Evitar projetar e-mail pessoal, senha, códigos e endereços de confirmação ou recuperação.

<!-- pagebreak -->

## Arquitetura e decisões técnicas

O sistema utiliza um monólito modular em Next.js. A interface recebe os dados, a camada de aplicação valida o contrato e seleciona regras e calendário, e o motor produz a memória. Contagem, identidade e persistência têm responsabilidades separadas.

Fluxo principal: formulário → API e aplicação → motor determinístico com catálogo versionado → resultado e memória. Quando solicitado por conta autenticada, a aplicação salva o snapshot no Supabase. A Vercel hospeda a aplicação web.

| Componente | Responsabilidade |
| --- | --- |
| React e Next.js | Páginas, formulários, navegação e endpoints do servidor |
| TypeScript e Zod | Tipos e validação dos contratos de entrada e saída |
| Motor com Temporal | Datas civis, marcos, contagem e memória sem depender de rede ou relógio |
| Catálogos versionados | Regras, atos e calendários com âmbito, fontes e revisão |
| Supabase Auth e PostgreSQL | Identidade, histórico e fila, com autorização e RLS |
| Supabase Cron e pg_net | Chamada periódica autenticada ao dispatcher hospedado |
| Brevo | SMTP do Auth configurado e API separada para lembretes |

O motor fica em src/domain/deadlines/ e a seleção da aplicação em src/application/. A apresentação não determina datas por conta própria. O servidor valida a entrada, escolhe os dados internos compatíveis e não confia em um resultado enviado pelo navegador para salvar o histórico.

O código preserva motores e versões anteriores. A composição do catálogo de atos identifica a contagem delegada, sem alterar silenciosamente as regras já congeladas. O histórico conserva os dados originais e identifica limitações de recomputação.

O banco possui quatro migrations versionadas: base de histórico e catálogos, fila de lembretes, modos de entrega e agendador. A fila local permanece distinta da fila Brevo; uma migration não promove mensagens locais para envio real.

O agendador usa assinatura temporária e nonce de uso único. O segredo permanente fica no servidor e no Vault, sem ser copiado para o comando Cron ou para os cabeçalhos da fila HTTP. O probe verifica configuração sem enviar mensagem. Mais detalhes ficam em docs/architecture/ e docs/reminder-scheduler-operations.md.

<!-- pagebreak -->

## Instalação e execução local

Ambiente ensaiado: Windows, Node.js da linha 22 a partir de 22.14, pnpm 11.0.8 e Docker Desktop para os serviços Supabase. O CLI Supabase 2.121.0 é fixado pelo projeto. A CI também executa em Linux. Consultar docs/entrega/instalacao.md para os procedimentos completos.

### Somente a calculadora

Obter acesso ao repositório privado ou extrair o pacote fonte. Na raiz do projeto, executar:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abrir http://127.0.0.1:3000. Sem configuração de Supabase, a calculadora continua disponível; conta e histórico informam indisponibilidade.

### Conta e serviços locais

Com Docker ativo, iniciar a stack e gerar a configuração local pelo PowerShell:

```powershell
pnpm db:start
./supabase/scripts/write-local-env.ps1
pnpm exec supabase migration list --local
pnpm exec supabase migration up --local
```

O helper recusa sobrescrever .env.local existente. Se já houver configuração, revisar o arquivo antes de substituí-lo. Aplicar migrations pendentes preserva os dados; não usar reset para atualizar uma instalação com registros a manter.

| Serviço local | Endereço |
| --- | --- |
| Aplicativo | http://127.0.0.1:3000 |
| Supabase Studio | http://127.0.0.1:54323 |
| Mailpit | http://127.0.0.1:54324 |

Para lembretes locais, executar pnpm reminders:configure:local, reiniciar o app e manter pnpm reminders:watch em outro terminal. O modo local usa Mailpit, sem envio externo. Não reutilizar credenciais de produção. Cadastro, confirmação e recuperação devem usar o mesmo host e navegador.

Para demonstrar o build de produção local, encerrar o servidor de desenvolvimento e executar pnpm build seguido de pnpm start. Não iniciar dois servidores na mesma porta. Google local exige configuração própria; o ensaio local padrão usa e-mail e Mailpit.

<!-- pagebreak -->

## Qualidade e evidências

A versão funcional 9632fd2 foi publicada com CI aprovada nos jobs de aplicação e banco. Os números abaixo pertencem à execução identificada, não a uma revisão jurídica ou a uma avaliação completa com usuários.

| Verificação | Resultado registrado |
| --- | --- |
| Tipos, lint e formatação | Aprovados |
| Testes unitários | 256 aprovados em 18 arquivos |
| Testes SQL | 146 aprovados em 5 arquivos |
| Testes de navegador completos | 67 aprovados e 1 omitido |
| Build | Aprovado, com a página de orientação após cadastro |
| Cadastro real local | Mailpit, confirmação PKCE, sessão, histórico, isolamento e limpeza aprovados |
| Aceite humano hospedado | Cadastro, confirmação, entrada, recuperação e histórico confirmados pelo responsável |
| Lembrete externo | Agendamento e infraestrutura conferidos; recebimento ainda pendente |

As evidências completas estão em docs/testing/. Para repetir a verificação geral, usar pnpm check, pnpm build, pnpm test:e2e e pnpm db:test conforme o ambiente. Os helpers reais de Auth e lembretes devem executar sequencialmente, com contas efêmeras locais e limpeza. Não adaptar os testes para contas reais de produção.

### Segurança e operação

Identidade é verificada no servidor e as tabelas expostas usam RLS. Mutações privadas conferem a origem. O histórico pertence à conta autenticada e os testes incluem outra conta e acesso anônimo. Credenciais privilegiadas ficam somente no servidor; nunca devem ser colocadas em variáveis NEXT_PUBLIC.

Os arquivos privados .env e as credenciais de Vercel, Supabase e Brevo não fazem parte da entrega. O pacote fonte é identificado por commit e SHA 256, mas não contém backup de banco, usuários ou sessões. Não compactar a pasta inteira do computador para compartilhar o projeto.

Não há garantia de retenção institucional, backup/restauração ensaiados, controle distribuído de abuso ou auditoria independente concluídos. Esses procedimentos exigem decisão e responsável antes de ampliar o uso. As informações públicas de privacidade descrevem os dados utilizados e a exclusão disponível.

A auditoria de dependências possui uma mitigação específica documentada para braces. Exit 0 não representa ausência universal de vulnerabilidades. Conferir docs/security/dependency-mitigation.md e sua revisão programada antes de nova publicação.

<!-- pagebreak -->

## Passagem do projeto e tarefas restantes

Antes da entrega, a responsável deve abrir o site, conferir seu acesso aos arquivos, ler os limites e ensaiar a apresentação. As situações abaixo representam o estado na elaboração deste guia.

| Prioridade | Tarefa | Evidência para encerrar |
| --- | --- | --- |
| Aceite imediato | Conferir lembrete das 18h | Mensagem recebida e memória aberta na conta, mantendo o cálculo salvo até concluir |
| Aceite imediato | Ensaiar convite no site publicado | Convite aceito e senha/acesso conferidos; teste local já aprovado |
| Entrega | Ensaiar apresentação | Passagem completa do roteiro com dados fictícios e contingência preparada |
| Acadêmica | Preparar o relatório conforme a instituição | Texto autoral com objetivos, método, resultados reais, referências e limites |
| Validação | Revisão jurídica e avaliação com participantes | Responsáveis identificados, casos e resultados efetivamente registrados |
| Operação ampliada | Definir atendimento, retenção, backup e abuso | Procedimentos aprovados e recuperação efetivamente ensaiada |

Não há um catálogo completo de processos ou de todos os atos. Organizações, equipes, administração normativa, novos meios de comunicação e ampliação de calendários são evoluções do backlog. Essas expansões não devem ser apresentadas como prontas nem acrescentadas à última hora sem especificação e testes próprios.

### Onde consultar

| Arquivo ou pasta | Finalidade |
| --- | --- |
| docs/entrega/aceite.md | Matriz vigente de requisitos e aceites |
| docs/entrega/conferencia-final.md | Passos de conta, lembrete e apresentação |
| docs/requirements.md e GLOSSARY.md | Contrato de requisitos e vocabulário |
| docs/architecture.md e docs/architecture/adr/ | Fronteiras, dados e decisões técnicas |
| docs/legal/ | Fontes, regras, cobertura e revisão |
| docs/testing/ | Comandos, resultados e limites das verificações |
| docs/backlog.md e CHANGELOG.md | Pendências e avanços por marco |

Os documentos originais recebidos em docs/ foram preservados. Este guia deve acompanhar o código e as evidências, sem substituí-los. Para alterações posteriores, conferir a versão funcional e atualizar a matriz de aceite antes de afirmar que uma pendência foi encerrada.

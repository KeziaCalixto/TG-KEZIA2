# Roteiro de demonstração — 8 a 12 minutos

Use somente dados fictícios. O roteiro pode ser executado no [site publicado](https://tg-kezia2.vercel.app) ou, com Docker, conforme [instalação local](instalacao.md). Tenha uma conta de demonstração; Mailpit pertence somente ao modo local. Não projete senhas, códigos ou links de confirmação. Para 8–12 minutos, priorize o exemplo civil, uma comparação entre perfis, calendário/fontes, histórico e exportação; atos e lembretes são módulos opcionais abaixo.

## 1. Apresentar problema e recorte

Abra a calculadora. Explique que a proposta é tornar uma contagem conferível, com entrada, fontes, versões e motivos por dia. Mostre os perfis civil/criminal TJSP nas dez comarcas de 2026 e trabalhista TRT-2 Capital em 2026–2027, todos com comunicação DJEN e limites próprios. Comece pelo civil. Mostre o aviso de calendário parcial e revisão jurídica pendente.

## 2. Fazer um cálculo explicável

Clique em Preencher um exemplo e Calcular prazo. Publicação em 06/10/2026, cinco dias úteis, Capital: estimativa 14/10/2026. Mostre marco excluído, primeiro dia computado e a exclusão de 12/10. Clique em uma referência numerada e confira a fonte. Não afirme que a simulação certifica tempestividade.

## 3. Mostrar a diferença entre comarcas

Informe publicação 04/09/2026 e um dia útil. Capital: 08/09/2026. Troque para Santos: 09/09/2026, pois a relação municipal inclui 08/09. O resultado anterior deixa de ser exibido ao mudar a entrada. Abra Calendário judicial e filtre Santos/setembro; confira o ato vinculado.

## 4. Mostrar disponibilização e incompletude

Capital, disponibilização no DJEN em 09/10/2026, um dia útil: publicação considerada em 13/10 e estimativa 14/10. Explique que disponibilização e publicação são marcos diferentes.

Em seguida, publicação em 18/12/2026, dois dias úteis: o app devolve incompleto e não emite vencimento, pois a contagem atravessa a cobertura durante a suspensão. Exporte o JSON e confira `dueDate: null`, pendência e snapshot. Não há botão para salvar esse resultado no histórico.

## 5. Conta, histórico e impressão

Entre na conta de demonstração; mostre o indicador Conectado. Faça novamente a simulação de Santos e salve com título fictício, como Aula de processo civil. Abra o histórico, busque Santos ou pelo título, abra a memória original e confira versões e aviso de integridade. A busca textual está identificada como **Buscar nesta página**; use o filtro por regime para consultar todo o ramo antes de paginar.

Exporte o original e abra a impressão. O PDF contém somente a memória selecionada, fontes com URL e avisos. [Exemplo produzido pelo aplicativo](../../output/pdf/memoria-demonstrativa-santos.pdf). Demonstre Excluir, cancele a confirmação e explique a exclusão; só confirme se o registro for descartável.

## 6. Ajuda, privacidade e limites

Abra Ajuda e Privacidade pelo rodapé. Explique dados utilizados, cookies de sessão, histórico privado e exclusão administrativa da conta. Se houver tempo, mostre a solicitação de recuperação no Mailpit, sem expor o link na projeção. O fluxo de recuperação deve iniciar e concluir no mesmo navegador.

Finalize mostrando [aceite e evidências](aceite.md). Diferencie testes técnicos, revisão jurídica e avaliação com usuários. Organizações, administração normativa e regimes além dos perfis suportados são evolução futura. Lembretes possuem um aceite próprio e só devem ser demonstrados como ativos quando isso estiver comprovado.

## Comparação entre perfis — trabalhista e criminal

Disponível no site publicado e no build local desde o marco de 23/10. Criminal cobre as dez comarcas TJSP cadastradas em 2026; trabalhista cobre somente TRT-2 Capital em 2026–2027. Prazo processual em dias, publicação/disponibilização no DJEN e contexto ordinário explicitamente confirmado. Use entradas fictícias e explique que a declaração de contexto não é revisão jurídica.

1. Selecione **Criminal · Processo comum / DJEN**. Confira as condições e, somente para o exemplo didático, selecione o contexto comum. Publicação **06/10/2026**, **5 dias**: primeiro computado **07/10**, fim nominal **11/10**, vencimento estimado **13/10**. A memória conta 10–11 como unidades e distingue prorrogação sem acrescentar unidades. Exporte o JSON e mostre `snapshot.rule`, fontes e avisos.
2. Mude o contexto para desconhecido/especial e calcule novamente: resultado incompleto, sem vencimento. Trocar perfil/contexto invalida a estimativa anterior.
3. Selecione **Trabalhista · TRT-2 Capital**, confirme o contexto fictício e use publicação **07/08/2026**, **1 dia**: estimativa **11/08**. No calendário, selecione o perfil trabalhista e agosto: o fechamento está em **10/08**, conforme ato do TRT-2. Não importar o calendário do TJSP.
4. Compare publicação **06/10**, **5 dias** nos três perfis elegíveis: civil/trabalhista **14/10**, criminal **13/10**. Os resultados são referências didáticas para as premissas e cobertura declaradas, não definição da duração de um recurso real.
5. Se houver conta local, salve uma memória de cada perfil, recarregue o histórico e confira o original. A busca aceita regime e tribunal. Não projetar e-mail pessoal nem links de Auth.

Ampliação criminal municipal: Santos, publicação **04/09/2026**, **1 dia** → **09/09**; Capital, mesma entrada → **08/09**. Depois Santos, publicação **03/09**, **5 dias** → fim nominal **08/09**, vencimento **09/09**: o feriado intermediário é computado e o fim nominal é prorrogado. Veja calendário criminal/Santos/setembro e a fonte municipal. Trocar para trabalhista reduz a seleção à Capital. TJSP 2027 permanece fora da cobertura calculável.

Travessia trabalhista: Capital/TRT-2, publicação **17/12/2026**, **10 dias úteis** → **03/02/2027**. Abra Fontes e versões e mostre os dois componentes anuais, além da suspensão CLT e do aniversário em 25/01. Exporte ou abra o [PDF A4 real](../../output/pdf/memoria-travessia-trt2-2026-2027.pdf). No calendário, selecione trabalhista/2027/agosto: 11/08 está fechado, em vez da antecipação de 2026 para 10/08. Publicação **10/08/2027**, um dia → **12/08**. [Evidências e limites](../testing/labor-2027.md).

[Pesquisa, testes, falhas corrigidas e limites](../testing/multi-regime.md). Não demonstrar prazo material, réu preso, Maria da Penha, urgência, júri ou outras exceções como se fossem cobertos.

## Plano de contingência

Se Auth/Docker estiver indisponível, demonstre cálculo público e PDF/JSON já preparados. Identifique que a integração está indisponível naquele momento; não apresente imagem de teste como uma integração ao vivo. Não altere datas para esconder uma pendência jurídica.

## Demonstração do catálogo inicial de atos

1. Na calculadora, selecione Civil, Capital, publicação em 06/10/2026 e ato “Apelação contra sentença civil”. A duração fica em 15 dias; o enquadramento começa desconhecido. Calcular assim deve ficar incompleto, sem vencimento.
2. Após ler as condições, confirme-as para o exemplo fictício e calcule: 28/10/2026. Abra fontes/versões e confira ato, declaração, versão, fontes e aviso de simulação. Exporte JSON ou imprima; a ficha acompanha a memória.
3. Repita com trabalhista TRT-2 Capital, contexto ordinário, mesma publicação e recurso ordinário da Vara: 8 úteis, vencimento 19/10. Exclua casos com sentença comunicada em audiência ou outro marco anterior.
4. No criminal, contexto ordinário e declaração da sentença de primeiro grau: 2 processuais, vence 08/10. O recorte exige defesa de réu solto com advogado constituído; acórdão não pertence à seleção. Com publicação 08/10, fim nominal 10/10 e prorrogação até 13/10.
5. Volte a quantidade manual: identificação e confirmação do ato devem desaparecer. Para histórico, use conta de demonstração e confira a memória original após recarregar. Não afirmar cabimento jurídico, completude de calendários ou efeitos sobre outros prazos.

Os roteiros anteriores permanecem válidos para a quantidade manual.

## Organização do histórico

1. Use uma conta fictícia com cálculos dos três perfis. Abra Histórico e confira **Todos os regimes**, **10 registros**, total e página. Para demonstrar duas páginas, prepare mais de dez registros descartáveis; não afirme navegação observada se a conta tiver menos.
2. Vá à próxima página; o foco passa ao resumo da paginação. Selecione Trabalhista: o filtro consulta o ramo inteiro e volta à página 1. Alterne o tamanho para 20 ou 50; o total do filtro permanece independente do tamanho.
3. Digite um título em **Buscar nesta página**. Explique que essa busca considera somente os registros carregados; limpe-a para ver a página completa. Uma busca vazia ou um regime sem registros mantém os controles disponíveis.
4. Mostre **Referência**, `America/Sao_Paulo` e os rótulos de estimativa futura, para hoje ou vencida que existirem nos dados da conta. Eles usam a data original salva; não indicam protocolo, cumprimento do ato ou validade jurídica. **Atualizar histórico** consulta novamente a data e os registros; voltar foco à janela também atualiza.
5. Abra uma memória original, confira o aviso de integridade e exporte. Exclua somente registros descartáveis; ao esvaziar a última página, a lista volta à página disponível. Lembretes exigem ativação própria, descrita abaixo. [Contrato](../history-organization.md) e [evidências](../testing/history-organization.md).

## Lembretes opcionais — primeira fatia local

Prepare [configuração e watcher](../email-reminders.md#executar-localmente). Use conta fictícia confirmada e data dentro da cobertura, com vencimento e horário de aviso futuros. O exemplo trabalhista de publicação em 09/11/2027, um dia, gera 10/11/2027 nas premissas de demonstração; não demonstra cabimento de um ato real.

1. Salve o cálculo e abra Histórico. Confirme a indicação de teste local; escolha antecedência/horário e marque explicitamente a solicitação antes de ativar. Mostre Agendado e fuso. Salvar cálculo sozinho não agenda.
2. Cancele um lembrete; mostre a mensagem. Para todos, abra a confirmação, demonstre Manter lembretes e depois confirme somente com registros descartáveis. Outras páginas também estão abrangidas. Envio já em curso pode ainda ser aceito.
3. Um ensaio ao vivo de entrega depende de chegar o horário futuro com watcher ativo. Não manipule relógio/data de caso real para antecipar. Para demonstração imediata com fixtures, use o helper isolado `pnpm db:test:reminders`, que prepara seu próprio horário de teste e limpa os dados.
4. Mostre a mensagem no Mailpit, sem expor e-mail real ou link de Auth. O e-mail de lembrete contém apenas vínculo público de identificação; exige login na conta proprietária. Clique em Conferir memória original, confira data/versões/avisos e use Voltar ao histórico completo.
5. Explique aceito versus entrega confirmada e envio incerto. O modo local usa Mailpit/watcher; a operação hospedada usa Brevo/Cron com configuração própria. Confira o estado em [evidências hospedadas](../testing/reminders-production.md). [Evidências e capturas locais](../testing/email-reminders.md) não comprovam entrega externa e não devem ser apresentadas como envio ao vivo.

## Lembrete no site publicado

Entre na conta proprietária, salve uma simulação com vencimento futuro e abra Histórico. Escolha antecedência de 3, 1 ou 0 dias e horário de 09h, 12h ou 18h; marque o consentimento para envio ao e-mail confirmado. Confira a data e o fuso mostrados antes de ativar. Para mudar uma escolha já agendada, cancele e crie o novo agendamento pela conta. Não altere send_at no banco para acelerar a apresentação.

O recebimento ocorre no horário salvo, com Cron/Brevo habilitados. Confira caixa de entrada e spam e abra o vínculo na conta proprietária; a memória continua privada. Registre recebimento e acesso separadamente do estado aceito pelo provedor. Se o horário não couber na apresentação, mostre o agendamento e identifique que o recebimento será conferido depois.

A confirmação imediata do agendamento aparece no próprio site. O e-mail é somente o lembrete no horário escolhido; não existe uma segunda mensagem imediata de confirmação. O ajuste de clareza foi verificado localmente em [24/10](../testing/reminder-schedule-feedback.md) e [publicado em 3e16db6](../testing/release-2026-10-24.md).

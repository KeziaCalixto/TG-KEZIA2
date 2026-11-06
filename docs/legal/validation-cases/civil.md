# Casos independentes para validação do motor civil

Preparados em 18/10/2026 a partir das [fontes oficiais](../sources/index.md) e [regras candidatas](../rules/civil-mvp.md). Estado: **referências aritméticas verificadas; revisão jurídica pendente**. Não são decisões judiciais nem casos reais anonimizados.

Os dias abaixo foram enumerados independentemente do motor. Quando se menciona calendário controlado, trata-se de fixture de teste definida para a experiência, não de declaração de completude do TJSP. **C01, C02 e C05 desconsideram deliberadamente a indisponibilidade oficial conhecida de 05/10/2026 para isolar a aritmética do diário; nunca são oráculos de um cálculo real. No catálogo de aplicação com essa ocorrência cadastrada, vale C11 e não se emite vencimento.**

## C01 — Fixture didática de outubro, sem a indisponibilidade conhecida

- Regime civil comum, TJSP São Paulo, publicação DJEN em **05/10/2026 (segunda)**, cinco dias úteis.
- Premissas artificiais: publicação válida informada; fixture contém apenas fins de semana e feriado de 12/10 e omite deliberadamente a certidão e-SAJ de 05/10. Não representa o calendário histórico real, nem permite concluir tempestividade.
- Dia do começo excluído: 05/10. Primeiro computado: 06/10. Vencimento sob essas premissas: **13/10/2026**.

| Data | Dia da semana | Tratamento | Acumulado |
| --- | --- | --- | --- |
| 05/10/2026 | Segunda | Publicação, excluída | 0 |
| 06/10/2026 | Terça | Computado | 1 |
| 07/10/2026 | Quarta | Computado | 2 |
| 08/10/2026 | Quinta | Computado | 3 |
| 09/10/2026 | Sexta | Computado | 4 |
| 10/10/2026 | Sábado | Fim de semana | 4 |
| 11/10/2026 | Domingo | Fim de semana | 4 |
| 12/10/2026 | Segunda | Feriado, não computado | 4 |
| 13/10/2026 | Terça | Computado, vencimento | 5 |

O exemplo entregue na documentação original chega a 12/10 apenas sob a hipótese expressa de inexistência de feriados. A [Lei 6.802/1980](https://www.planalto.gov.br/ccivil_03/leis/l6802.htm) fundamenta excluir 12/10 nesta fixture. A [certidão e-SAJ de 05/10](https://www.tjsp.jus.br/Indisponibilidade/Comunicado?codigoComunicado=79261&pagina=1) impede transportar o resultado didático para o catálogo de aplicação sem resolver a exceção conhecida: nesse catálogo, o MVP devolve incompleto conforme C11. Chamar o resultado apenas de “simulação” não autoriza ignorar silenciosamente a ocorrência já cadastrada.

## C02 — Disponibilização não é publicação

Entrada: disponibilização em **02/10/2026 (sexta)**; cinco dias úteis; mesma fixture artificial de C01, sem a indisponibilidade conhecida. Publicação considerada nessa experiência: **05/10 (segunda)**. Primeiro contado: **06/10**. Sequência computada: 06, 07, 08, 09 e 13/10. Resultado didático: **13/10/2026**. Esse caso detecta contagem iniciada indevidamente em 05/10 e também o erro inverso de excluir dois dias após a publicação. No catálogo da aplicação, a normalização toca a ocorrência de 05/10 e deve produzir incompleto conforme C11.

Fundamento: [Lei 11.419/2006, art. 4º, §§ 3º–4º](https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11419.htm); material [CNJ sobre DJEN](https://www.cnj.jus.br/wp-content/uploads/2025/05/prazos-integracao-dje-e-djen-e-mail-v5.pdf).

## C03 — Suspensão preserva o acumulado

Fixture controlada de 17/12/2026 a 21/01/2027: fins de semana, ausência de outros eventos e suspensão inclusiva 20/12/2026–20/01/2027. Publicação informada em **17/12/2026 (quinta)**; prazo de **dois** dias úteis. Conta **18/12 (sexta)** como dia 1; 19/12 é sábado; 20/12–20/01 ficam suspensos; **21/01/2027 (quinta)** é dia 2 e resultado condicional. Não reiniciar a quantidade em janeiro. Fonte da suspensão: [CPC, art. 220](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm).

Esse resultado é oráculo de algoritmo em fixture. Não foi verificado calendário TJSP 2027. Uma chamada real que só recebeu cobertura 2026 deve falhar conforme C04, mesmo que o motor conheça a regra anual de suspensão.

## C04 — Cobertura insuficiente ao atravessar o ano

Mesma entrada C03, com calendário cuja cobertura acaba em **31/12/2026**. Resultado esperado: **incompleto, sem data final**, motivo “calendário não cobre 2027”. Nunca assumir dias comuns após a cobertura nem importar silenciosamente a fixture C03.

## C05 — Disponibilização no fim de semana

Fixture artificial de outubro sem evento em 03–09/10, omitindo deliberadamente a indisponibilidade conhecida de 05/10. Disponibilização informada em **03/10/2026 (sábado)**; prazo de um dia. Publicação considerada **05/10**; primeiro computado e vencimento didático **06/10**. Não apresentar esse caso como prova de que o DJEN efetivamente disponibilizou um ato naquele sábado: o evento é um dado de teste para exercitar a normalização. Com a ocorrência real cadastrada, a chamada deve ser incompleta conforme C11.

## C06 — Calendário alterado: 28/10 útil, 30/10 excluído

Fixture contendo a alteração do [Provimento CSM 2.845/2026](https://www.tjsp.jus.br/atc/dejesp/consultaSimples.do?cdCaderno=10&cdVolume=4532&nuDiario=4532&nuSeqpagina=1), 02/11 sem expediente e nenhum outro evento. Publicação em **27/10/2026 (terça)**; três dias úteis. Contados: **28/10 (1), 29/10 (2), 03/11 (3)**. Excluídos 30/10 (ato), 31/10 e 01/11 (fim de semana), 02/11 (Finados). Resultado sob a fixture: **03/11/2026**. Um calendário que ainda excluir 28/10 deve ser reprovado.

## C07 — Data de publicação inválida/ambígua

Entrada selecionada como **publicação em 12/10/2026**. Fixture identifica feriado sem expediente. Esperado: pedir correção/confirmar qual é o evento, devolvendo incompleto. Não reinterpretar automaticamente como disponibilização nem alterar para 13/10 sem registrar a mudança.

## C08 — Sobreposição e validação estrutural

Fixture atribui a uma mesma data feriado e suspensão: uma exclusão, com ambos os motivos, sem modificar o acumulado duas vezes. Entradas `2026-02-30`, zero, número negativo ou fracionário: erro de validação e ausência de vencimento. Uma suspensão específica sem ato/fonte ou localidade deve impedir classificação operacional como validada.

## C09 — Expediente parcial ou indisponibilidade

Evento informa que o extremo coincide com expediente alterado ou falha eletrônica comprovada. Como essa regra ainda não está automatizada no recorte, esperado: **incompleto/revisão necessária**, sem descartar o dado e emitir resultado normal. Exigir alcance, horários, sistema, unidade, ato ou certidão antes de decidir a prorrogação.

## C10 — Meio de comunicação incompatível

Entrada de Domicílio/intimação pessoal/citação eletrônica enviada ao perfil DJEN: **não suportado/incompleto**, sem usar o algoritmo C02. Um aviso informativo de portal não substitui a publicação válida do diário no perfil de intimação sem exigência pessoal, conforme [Comunicado Conjunto TJSP 371/2025](https://www.tjsp.jus.br/Corregedoria/Comunicados/Comunicado?codigoComunicado=52007&pagina=1).

## C11 — Exceção conhecida de 05/10 bloqueia o catálogo da aplicação

Usar o calendário demonstrativo da aplicação com a ocorrência **TJSP-ESAJ-0510-2026**, baseada na [certidão oficial](https://www.tjsp.jus.br/Indisponibilidade/Comunicado?codigoComunicado=79261&pagina=1): peticionamento e-SAJ indisponível em **05/10/2026, 15h15–17h05**, por mais de 60 minutos. A comunicação DJEN, o sistema de tramitação e o efeito sobre os extremos ainda não possuem regra de indisponibilidade integralmente modelada/revisada neste MVP.

Entradas de regressão:

1. Publicação informada em **05/10/2026**, cinco dias úteis.
2. Disponibilização em **02/10/2026**, cuja normalização alcançaria **05/10**.
3. Disponibilização em **03/10/2026**, cuja normalização alcançaria **05/10**.
4. Prazo cujo intervalo percorrido alcance 05/10, ainda que a data original seja anterior.

Para todas: estado **incompleto**, `dueDate = null`, fonte/intervalo/motivo visíveis na memória. Não devolver 13/10 por transportar C01/C02 ao calendário da aplicação. Não deslocar automaticamente para 14/10 ou excluir 05/10 como feriado: não foi estabelecida essa interpretação jurídica.

O bloqueio de toda chamada que toca a ocorrência é uma **limitação conservadora de suporte do MVP**, não conclusão de que a falha do e-SAJ afetou o DJEN, o eproc ou todos os prazos civis. Uma futura regra por sistema pode refinar o bloqueio com versão nova e novos casos revisados.

## C12 — Indisponibilidade de junho atravessa a meia-noite

O [comunicado STI de 25/06/2026](https://portal.tjsp.jus.br/Indisponibilidade/Comunicado?codigoComunicado=70654&pagina=1) identifica consulta e peticionamento de **primeiro grau do e-SAJ**, indisponíveis de **24/06 às 22h31 até 25/06 às 02h26**. As duas datas pertencem ao intervalo do evento; a certidão não transforma ambas em feriados.

Em um calendário que recebeu esse evento e ainda não possui regra por sistema/horário: uma publicação informada em **25/06/2026**, ou uma contagem que alcance essa data, deve retornar **incompleto**, com intervalo e fonte. Um teste que só bloqueia 24/06 porque possui expediente parcial pode mascarar a ausência do segundo dia da certidão. Separar as duas ocorrências na memória: expediente parcial e indisponibilidade.

## Critérios de reprodução

Cada teste deve fixar as entradas, IDs/versões, escopo e cobertura do calendário, além de comparar publicação, primeiro dia, sequência contada/excluída e estado do resultado. A mesma entrada e versões devem gerar o mesmo resultado. Trocar o calendário alterado pelo anterior deve mudar a versão auditável; nunca reescrever memória histórica. A passagem dos testes não muda o estado de revisão jurídica.

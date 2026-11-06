# Auditoria dos documentos originais — 21/10/2026

## Objetivo e limites

Esta leitura identifica o que os materiais originais propõem, os conflitos internos e os trechos que são exemplos de relatório. Ela não certifica a implementação atual nem valida juridicamente as regras descritas. A matriz consolidada deve comparar estes achados com o master prompt, as decisões posteriores, o backlog e o código.

Os três originais foram preservados:

- [note.txt](note.txt): referências por linha do arquivo em 21/10/2026.
- [Documentação sobre Contagem de Prazos Processuais — Brasil](<Documentação sobre Contagem de Prazos Processuais.md>): referências por linha do arquivo em 21/10/2026.
- [6-Template_Relatorio_TG-II.pdf](6-Template_Relatorio_TG-II.pdf): 23 páginas físicas. A numeração impressa do corpo começa na página física 11; por exemplo, página física 18 corresponde à impressa 8. Todas as páginas foram lidas por extração de texto; os diagramas das páginas físicas 13–15 também foram renderizados e inspecionados visualmente.

## Achado principal

Os originais não se limitam ao processo civil. O `note.txt` prevê expressamente CPP e contagem contínua, além de descrever regimes **Cível, Trabalhista e Corridos**. A documentação nacional distingue **civil, penal e trabalhista** e exige separar ramo jurídico, evento inicial e regra de contagem. Portanto, o recorte exclusivamente civil não corresponde à totalidade da proposta original, mesmo que tenha sido adotado depois como primeira entrega.

Isso não autoriza reutilizar a contagem civil com outro rótulo. Estes documentos não contêm, por si, uma especificação jurídica suficientemente completa para implementar e declarar concluídos os regimes penal e trabalhista. Fontes, marcos, calendários, exceções e casos de validação próprios precisam acompanhar cada ampliação.

## Funcionalidades e abrangência descritas

| Item | Evidência original | Leitura para a rastreabilidade |
| --- | --- | --- |
| Contagem de prazo por datas e quantidade de dias | `note.txt`, linhas 13, 71, 143–156; PDF, p. física 13 / impressa 3, RF1; p. 17–18 / impressas 7–8, RF01–RF03 | Requisito explícito da calculadora. A natureza da data informada precisa ser definida; publicação e intimação não são rótulos intercambiáveis. |
| Dias úteis **e corridos** | `note.txt`, linhas 13, 89–90, 135–140 e 210–212; PDF, p. 18 / impressa 8, RF04–RF05 | Previsão explícita, além do civil em dias úteis. O exemplo de código distingue apenas úteis/corridos e não implementa todas as regras descritas no texto. |
| Regime penal/criminal | `note.txt`, linhas 88–90 e 254–255; documentação nacional, linhas 14, 21 e 140 | CPP está explicitamente no escopo de domínio. O rótulo “Corridos” no protótipo não demonstra implementação completa do regime penal. |
| Regime trabalhista | `note.txt`, linhas 132–140 e 172–177; documentação nacional, linhas 15, 21 e 141 | Está previsto na descrição do protótipo e na base nacional, embora não apareça como RF separado no primeiro conjunto RF1–RF6. |
| Atalhos de prazos comuns | `note.txt`, linhas 132 e 146–147 e 172–177 | Descreve contestação, apelação e recurso ordinário, com nome, dias, regime e base legal. É funcionalidade proposta, distinta de selecionar ramo jurídico ou classe processual. Não fornece catálogo completo e validado de prazos. |
| Identificação do processo | Documentação nacional, linhas 173–175 | Propõe ramo, tribunal, comarca, instância, classe processual e legislação aplicável. Um título de cálculo não equivale automaticamente a uma entidade Processo nem a todos esses campos. |
| Cadastro de processos | `note.txt`, linhas 13, 50, 73, 98, 113–118; PDF, p. 13 / impressa 3, RF3 e diagrama | Exigência explícita no planejamento. Tem conflito com a conclusão do próprio PDF, que a coloca como evolução futura. A auditoria consolidada deve registrar a decisão de escopo, sem declarar atendido apenas por haver histórico. |
| Alertas de vencimento | `note.txt`, linhas 13 e 74; PDF, p. 13 / impressa 3, RF4 e diagrama com serviço de notificações | Requisito planejado. Não estão definidos canal, antecedência, destinatário, recorrência, autorização e comportamento em falhas. Mostrar uma data de vencimento não comprova alerta automático. |
| Histórico de prazos | `note.txt`, linhas 13 e 75; PDF, p. 13 / impressa 3, RF5 | Requisito explícito, também contradito pelo enquadramento como evolução futura na conclusão do PDF. |
| Login por e-mail/senha ou Google | `note.txt`, linha 76 | Exigência explícita. O mesmo trecho pede não confirmar o e-mail; isso precisa ser tratado como divergência documental frente à política de autenticação efetivamente escolhida. |
| Recuperação de senha e permissões | PDF, p. 7, figura prevista 3; p. 19 / impressa 9, seção 4.1; diagrama p. 15 / impressa 5 | O texto e as figuras previstos indicam temas a documentar. O diagrama mostra validação de e-mail e usuário sem permissão. Não especifica matriz de papéis nem prova que qualquer mecanismo está implementado. |
| Calendário com feriados e fins de semana | `note.txt`, linhas 3, 72 e 157–170; PDF, p. 13 e 18 / impressas 3 e 8, RF2/RF06 | Requisito explícito. A descrição inicial é nacional; a documentação nacional amplia as dependências para atos locais e forenses. |
| Calendário por tribunal, localidade e situação | Documentação nacional, linhas 157–169 | Exige considerar feriados nacionais, estaduais, municipais e forenses, expediente, suspensões, regulamentação dos sistemas e certidões de indisponibilidade. A existência de feriados nacionais não comprova cobertura completa de uma comarca. |
| Suspensões, recesso e prorrogação | `note.txt`, linhas 138–156; documentação nacional, linhas 143–147, 163–169 e 178–180 | Há preocupação explícita, porém o texto do protótipo não deve ser usado como regra jurídica validada. |
| Diferentes comunicações e autos físicos/eletrônicos | Documentação nacional, linhas 3–5, 71–84 e 175–182 | Abrange AR, oficial, diário impresso, DJEN, intimação eletrônica pessoal, citação eletrônica confirmada, carga e edital. São cenários distintos a especificar, não simples opções de interface. |
| Unidades e exceções | Documentação nacional, linhas 177–179 | Menciona úteis, corridos, meses, anos, horas, prazo em dobro, indisponibilidade, justa causa e regras específicas. Trata-se da abrangência documental nacional, não de prova de implementação nem de detalhamento suficiente para todas as hipóteses. |
| Resultado e memória detalhada | `note.txt`, linhas 179–187; documentação nacional, linha 180 | Prevê vencimento, publicação, início, dias descontados e detalhamento dia a dia; a base nacional acrescenta fundamento legal. |
| Situação relativa ao vencimento | `note.txt`, linha 183 | Prevê quantos dias faltam, vencido ou vence hoje. É diferente de gerar notificações. |
| Interface Web responsiva e acessível | `note.txt`, linhas 79–80; PDF, p. 13–14 / impressas 3–4; p. 18 / impressa 8, RNF01–RNF02 | Requisito explícito; uso offline é apresentado separadamente como opcional. |
| Uso offline | `note.txt`, linha 81; PDF, p. 13–14 / impressas 3–4 | Expressamente opcional. A ausência não deve ser classificada como descumprimento obrigatório sem decisão posterior que o torne obrigatório. |
| Relatórios, gráficos e painel operacional | PDF, p. 7, figuras previstas 4–6; p. 10, sumário; p. 20 / impressa 10, seções 4.2–4.3 | Predominantemente estrutura-modelo do relatório, com instruções entre colchetes. Não basta para impor um módulo de BI ou relatórios gerenciais específico ao app. A memória de cálculo e a impressão devem ser avaliadas pelos requisitos específicos do produto. |

## Conflitos que precisam aparecer na matriz consolidada

1. **Planejamento versus conclusão do relatório.** Na página física 13 / impressa 3, RF3–RF5 e o diagrama preveem processos, alertas e histórico. Na página física 22 / impressa 12, esses mesmos itens são apresentados como possibilidades da versão 2.0, junto da integração com calendários judiciais. Não há no PDF uma matriz final preenchida que resolva o que foi retirado, adaptado ou mantido. Esse conflito impede tratar todos esses itens como critérios inequívocos de aceite da primeira entrega. Não se deve escolher silenciosamente um dos trechos.
2. **Autenticação presente versus ausente.** `note.txt`, linha 76, requer login; linha 195 afirma “Não usa banco de dados nem login”. O PDF, página física 15 / impressa 5, desenha validação de e-mail e acesso, enquanto a página física 12 / impressa 2 determina só declarar autenticação e persistência como entregues com evidência. São registros de estágios diferentes, não uma especificação única coerente.
3. **Confirmação de e-mail.** `note.txt`, linha 76, pede login sem confirmação; o diagrama de sequência do PDF, página física 15, contém validação de e-mail. A política final precisa estar explícita em documento derivado e na rastreabilidade, sem adulterar o original.
4. **Numeração de requisitos incompatível.** RF3 da lista inicial significa cadastrar processos; RF03 da matriz nas páginas físicas 17–18 significa calcular vencimento. RF4 inicial significa alertas; RF04 posterior significa dias úteis/corridos. A referência deve sempre identificar documento e seção, evitando alegar cobertura apenas pelo número.
5. **Regimes jurídicos misturados com modos de contagem.** `note.txt`, linhas 135–140, usa Cível, Trabalhista e Corridos como alternativas. A documentação nacional, linhas 175–179, separa ramo e regra de contagem. “Criminal” é ramo/regime; “dias corridos” é modo de contar e não encapsula suas exceções. “Contestação” ou “apelação” são atalhos de atos/prazos, não sinônimos de ramo.
6. **Regras resumidas sem validação suficiente.** O protótipo descreve recesso civil entre 20/12 e 06/01 e trabalhista sem recesso (`note.txt`, linhas 138–139), agrupa datas móveis como feriados (linha 170) e apresenta um algoritmo genérico (linhas 150–156). A documentação nacional exige fontes, regras próprias e atos locais. Esta auditoria identifica a inconsistência de especificação; não endossa tais resumos nem os corrige juridicamente sem pesquisa própria.
7. **Ferramentas e arquitetura de estágios diferentes.** `note.txt` menciona Figma/Lucidchart/Bravo/Notion (linha 57), Lovable/Firebase opcional (102–104, 122–124), React/TanStack/Tailwind/TypeScript (189–195) e um exemplo Streamlit (199–244). Esses trechos não podem ser todos tratados como stack obrigatória simultânea. As decisões técnicas posteriores devem ser comparadas e justificadas, sem instalar uma segunda stack para reproduzir o rascunho.
8. **Persistência e GitHub.** “Armazenamento local ou em nuvem (GITHUB)” aparece no rascunho (linha 82) e no PDF (páginas físicas 13–14). O diagrama explicita GitHub como opção de armazenamento/versionamento, mas não define contrato de banco para dados pessoais. A implementação deve distinguir versionamento de código e persistência de dados da aplicação.

## O que é modelo, exemplo ou entrega acadêmica a produzir

O PDF mistura texto autoral com um template parcialmente preenchido. A própria página física 12 / impressa 2 diz que autenticação, dados, APIs, relatórios, testes e usabilidade só podem ser tratados como entregues quando houver implementação ou documentação correspondente. O sumário e as listas de figuras não comprovam entrega.

| Trecho | Classificação e consequência |
| --- | --- |
| PDF, páginas físicas 1–4: titulação, banca, data, coorientador e dedicatória com campos abertos | Pendências editoriais do relatório; não funcionalidades do aplicativo. |
| PDF, páginas físicas 7–10: figuras, tabelas, numeração `[Página]`, siglas e sumário | Estrutura prevista a reconciliar com o produto real. A presença de JWT, ORM, dashboard ou Swagger não impõe automaticamente usar cada tecnologia ou criar cada módulo. |
| PDF, páginas físicas 17 e 19 / impressas 7 e 9: arquitetura e persistência entre colchetes | Pedem documentação da solução real. O exemplo “API em container Docker” não demonstra uma decisão obrigatória de hospedagem. |
| PDF, página física 19 / impressa 9: `/api/v1/recursos`, Bearer Token, Admin/Gestor | Tabela genérica de endpoints para substituir pelos contratos reais. Não é evidência de uma exigência de papéis administrativos ou dessa rota específica. |
| PDF, página física 20 / impressa 10: relatórios, gráficos, casos CT01/CT02 já rotulados “Aprovado” | Exemplos e instruções de preenchimento. Resultados precisam ser sustentados por execução real; não copiar aprovação nem criar requisitos de analytics apenas para manter o template. |
| PDF, página física 21 / impressa 11: SUS, performance, custos e lições aprendidas | Materiais de avaliação e relato a produzir com dados reais. Não inventar amostra de usuários, score SUS, cobertura ou teste de carga. |
| PDF, página física 23 / impressa 13: gateway de pagamentos e IA generativa como exemplos de trabalhos futuros | Não são requisitos obrigatórios do aplicativo. A IA usada como apoio ao desenvolvimento não implica IA integrada ao produto ou ao motor de cálculo. |
| `note.txt`, linhas 199–244: exemplo de código Streamlit | Demonstração simplificada. Não considera feriados no laço, apesar de o texto exigi-los; tampouco equivale a motor validado de CPP/CLT. |
| Documentação nacional, linhas 94–134: exemplo de cinco dias no DJEN | O próprio texto o declara meramente ilustrativo e sem calendário real. A data 12/10 do exemplo não é um caso de referência oficial do aplicativo. |

Para o relatório acadêmico permanecem tarefas de redação e comprovação: matriz TG-I versus TG-II preenchida; arquitetura e modelo de dados reais; contratos da API; capturas e fluxos reais; resultados de testes e limitações; avaliação com usuários quando realizada; custos; lições aprendidas; bibliografia e anexos efetivamente existentes. Isso é separado de completar o aplicativo e não exige aceitar todos os exemplos do template como requisitos de software.

## Encaminhamento para a revisão consolidada

- Classificar explicitamente penal/criminal, trabalhista, dias corridos e presets como abrangências previstas nos originais, comparando-as com a decisão posterior de primeira entrega civil.
- Confrontar cadastro de processos e alertas com a implementação, mantendo seu conflito de priorização visível.
- Tratar histórico, autenticação, exportações e documentação como itens separados, com evidência própria; um não substitui automaticamente outro.
- Registrar escopo, fonte, testes e revisão jurídica antes de ampliar qualquer regime. Não marcar como entregue apenas por adicionar opções indisponíveis ou aplicar a mesma regra a todos os ramos.
- Na matriz final, distinguir requisito obrigatório, decisão posterior de recorte, item opcional, trabalho futuro e exemplo-modelo. Esta auditoria não decide novas prioridades nem altera o produto.

## Evidência da leitura

Leitura efetuada em 21/10/2026 por numeração de linhas dos dois arquivos de texto, extração das 23 páginas com `pypdf` e renderização das páginas físicas 13–15 com Poppler para inspecionar os três diagramas. Não foram abertos links externos nem verificados atos legais atuais; a validade normativa requer a pesquisa específica do projeto. Não houve execução de testes, alteração de regras, código, originais, autenticação, banco ou deploy nesta tarefa.

# Roteiro de apresentação do TG II

Kezia Calixto. FATEC Campinas, ADS. Edição 24/10/2026.
Tempo de ensaio sugerido: 16 min 5 s, incluindo demonstração. Ajustar ao tempo oficial da banca. Slides 19 e 20 são apoio.

## 1. PRAZO CLARO

Tempo sugerido: 35 segundos.

Apresentar o tema como uma aplicação web acadêmica para produzir estimativas explicáveis. A contribuição central é mostrar como cada data resulta das entradas, das regras e do calendário selecionados. Explicar que a entrega possui um recorte definido e revisão jurídica pendente.

Fontes: docs/relatorio-tg2/conteudo.md, capítulos 1 e 7

## 2. Problema e justificativa

Tempo sugerido: 50 segundos.

Explicar a dificuldade sem afirmar que houve pesquisa de campo ou medição da frequência de erros. O problema foi delimitado por análise documental e desenvolvimento do artefato. A proposta organiza evidências para conferência e não certifica tempestividade.

Fontes: docs/relatorio-tg2/conteudo.md, capítulo 1

## 3. Objetivos

Tempo sugerido: 45 segundos.

Distinguir o objetivo geral dos três objetivos específicos. Relacionar a rastreabilidade normativa à especificação, a separação do motor à implementação e as evidências técnicas à verificação. A avaliação com participantes não foi executada.

Fontes: docs/relatorio-tg2/conteudo.md, objetivos e conclusão

## 4. Recorte implementado

Tempo sugerido: 65 segundos.

As dez comarcas são São Paulo, Campinas, Guarulhos, Osasco, Ribeirão Preto, Santo André, Santos, São Bernardo do Campo, São José dos Campos e Sorocaba. Os perfis são ordinários e possuem condições próprias. Não anunciar cobertura de todo o estado, de todos os ritos, TRT-15, juizados ou todas as formas de comunicação. Fora da cobertura, o cálculo pode ficar incompleto.

Fontes: docs/relatorio-tg2/conteudo.md, delimitação e resultados; docs/requirements.md

## 5. Fundamentação do trabalho

Tempo sugerido: 50 segundos.

As normas definem regras distintas por perfil. Exemplo: a contagem civil em dias úteis não pode ser aplicada indiscriminadamente ao criminal. SWEBOK orienta atividades de engenharia, ASVS e WCAG orientam verificações delimitadas. Não afirmar auditoria integral ou aprovação jurídica.

Fontes: docs/relatorio-tg2/conteudo.md, capítulo 2

## 6. Materiais e métodos

Tempo sugerido: 55 segundos.

Descrever a evolução do trabalho e a estratégia de teste nas regras de negócio. Diferenciar testes automatizados com mocks, integrações locais reais e aceites humanos no ambiente hospedado. Não atribuir entrevistas, amostra, SUS ou desempenho medido ao estudo.

Fontes: docs/relatorio-tg2/conteudo.md, capítulo 3; docs/testing/documentacao-tg2.md

## 7. Requisitos e rastreabilidade

Tempo sugerido: 50 segundos.

Usar um exemplo concreto: preservar o resultado exige guardar as versões e a memória, e não somente a data final. A matriz de rastreabilidade relaciona requisitos, módulos e registros de teste. A lembrança por e-mail tem um aceite próprio, distinto do cálculo.

Fontes: docs/relatorio-tg2/conteudo.md, capítulo 4 e apêndice D

## 8. Arquitetura da solução

Tempo sugerido: 65 segundos.

Ler o diagrama a partir da interface. A aplicação valida a requisição e seleciona entradas versionadas. O domínio realiza a contagem sem depender de React, Next.js, Supabase, rede ou relógio. Adaptadores cuidam de autenticação, persistência e e-mail. Vercel hospeda a aplicação. Fonte da figura: diagrama do relatório, elaborado a partir da arquitetura implementada.

Fontes: docs/relatorio-tg2/figuras/arquitetura.png; docs/architecture.md; docs/relatorio-tg2/conteudo.md, capítulo 4

## 9. Persistência e acesso privado

Tempo sugerido: 50 segundos.

O banco possui cinco tabelas públicas de domínio e fila, além do schema privado do agendador e das tabelas gerenciadas de autenticação. Os catálogos ativos do motor estão no código versionado. RLS complementa a autorização no servidor. A memória histórica aparece como original não verificado, sem promessa de assinatura criptográfica.

Fontes: docs/relatorio-tg2/conteudo.md, capítulo 4 e apêndice B; supabase/migrations/

## 10. Motor e memória de cálculo

Tempo sugerido: 60 segundos.

A captura real mostra um caso criminal diferente do exemplo civil do próximo slide: evento em 28/10/2026, cinco dias, fim nominal em 02/11 e prorrogação para 03/11. A tela identifica calendário parcial e revisão pendente. Não confundir quantidade informada, início útil e dias contínuos do curso criminal. A memória preserva fontes e versões.

Fontes: docs/relatorio-tg2/figuras/tela-calculadora.png; docs/relatorio-tg2/conteudo.md, capítulos 5 e 6

## 11. Exemplo civil demonstrativo

Tempo sugerido: 65 segundos.

Percorrer a contagem na tabela. O exemplo usa publicação, não a data de disponibilização. O marco de 06/10 é excluído, 07/10 é o primeiro computado, 12/10 é feriado e 14/10 é o quinto dia útil. Na demonstração ao vivo, selecionar exatamente o perfil civil, São Paulo, publicação e cinco dias. A fonte do caso está no relatório e nos testes de referência.

Fontes: docs/relatorio-tg2/conteudo.md, apêndices C e D; docs/entrega/guia-do-aplicativo.md

## 12. Conta, histórico e exportação

Tempo sugerido: 45 segundos.

Cadastro, confirmação e recuperação hospedados foram confirmados pelo responsável. Google retornou com a indicação Conectado. O convite tem verificação local e reensaio hospedado específico ainda pendente. No histórico, a busca textual é restrita à página disponível. Se a demonstração não tiver conta preparada, usar o caso público e o material estático, sem expor credenciais.

Fontes: docs/relatorio-tg2/conteudo.md, capítulos 5 e 6; docs/testing/signup-confirmation-page.md; docs/testing/google-login.md

## 13. Lembretes por e-mail

Tempo sugerido: 55 segundos.

O agendamento mostra confirmação no site. Não existe e-mail imediato de confirmação do lembrete. O e-mail é previsto para o horário escolhido, com consentimento e destinatário confirmado. Supabase Cron aciona o despacho hospedado, Brevo recebe a solicitação de envio. Estado accepted significa aceitação pelo provedor e não entrega comprovada na caixa. O corte documental não confirma o recebimento externo. Não enviar e-mail ao vivo para demonstrar sem preparar o aceite.

Fontes: docs/relatorio-tg2/conteudo.md, capítulos 5 e 6; docs/testing/reminders-production.md; docs/testing/documentacao-tg2.md

## 14. Verificação técnica registrada

Tempo sugerido: 55 segundos.

Os números pertencem à execução de CI identificada no relatório, não a testes executados ao produzir estes slides. Há também registros de integrações reais locais para conta, isolamento e Mailpit. Explicar os limites: testes não demonstram cobertura jurídica universal, avaliação de usuários, desempenho sob carga nem recebimento do e-mail externo. O cenário omitido não é contado como aprovado.

Fontes: https://github.com/Eduwilll/TG-KEZIA2/actions/runs/40061653068; docs/relatorio-tg2/conteudo.md, capítulo 6; docs/testing/documentacao-tg2.md

## 15. Resultados e limitações

Tempo sugerido: 55 segundos.

Relacionar cada resultado aos objetivos, mantendo as pendências visíveis. Não usar termos como sistema definitivo, ausência de erros ou pronto para uso jurídico irrestrito. O trabalho demonstra uma implementação técnica rastreável no recorte descrito.

Fontes: docs/relatorio-tg2/conteudo.md, capítulos 6 e 7

## 16. Continuidade do projeto

Tempo sugerido: 40 segundos.

Apresentar como trabalhos futuros, sem prometer expansão automática. Administração normativa, retenção e restauração precisam de definição e validação operacionais próprias. Mais fontes não substituem revisão humana. O relatório e o backlog preservam as pendências para a continuidade.

Fontes: docs/relatorio-tg2/conteudo.md, trabalhos futuros; docs/backlog.md

## 17. Conclusão

Tempo sugerido: 35 segundos.

Retomar a pergunta de pesquisa: a implementação mostra como produzir estimativas explicáveis e reproduzíveis, com limites explícitos. A conclusão é técnica e limitada ao artefato e às evidências apresentadas. Não constitui certificação de tempestividade. Agradecer e passar à demonstração ou às perguntas.

Fontes: docs/relatorio-tg2/conteudo.md, capítulo 7

## 18. Demonstração e perguntas

Tempo sugerido: 90 segundos.

Roteiro sugerido de demonstração de 90 segundos: abrir o endereço canônico, usar civil TJSP São Paulo Capital, publicação em 06/10/2026 e cinco dias, conferir 14/10/2026, mostrar trilha e exportar. Histórico requer conta previamente preparada. Usar título fictício, sem dados de processos ou partes. Se não houver rede, os slides 10 e 11 e o PDF permitem continuar. O tempo proposto deve ser ajustado às regras da banca.

Fontes: docs/entrega/guia-do-aplicativo.md; docs/relatorio-tg2/conteudo.md, apêndice D

## 19. Referências selecionadas

Slide de apoio, fora do tempo-base.

Slide de apoio. A bibliografia completa, as URLs e os dispositivos examinados estão nas 21 referências do relatório. Os itens selecionados não representam transcrição integral das normas nem aprovação jurídica dos perfis.

Fontes: docs/relatorio-tg2/referencias.json

## 20. Casos de apoio à banca

Slide de apoio, fora do tempo-base.

Slide de apoio. Os casos compartilham o significado de publicação no DJEN, mas seguem regras próprias de início, curso, suspensão e prorrogação. Não comparar apenas as quantidades sem contexto. O caso trabalhista atravessa suspensão e calendários anuais. Consultar a memória para explicar os dias e as versões de cada exemplo.

Fontes: docs/entrega/guia-do-aplicativo.md; docs/relatorio-tg2/conteudo.md, apêndice D

## Cuidados para a apresentação

Usar conta de teste preparada e títulos fictícios. Não exibir senha, chave, painel administrativo nem dados de processos reais. Manter o PDF disponível sem rede. Confirmar o tempo, os contatos acadêmicos e as exigências finais de impressão com a orientação. A apresentação não acrescenta aceite externo, revisão jurídica ou estudo de usuários às evidências do relatório.

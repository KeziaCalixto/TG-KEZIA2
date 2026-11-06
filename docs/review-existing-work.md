# Leitura do trabalho existente

Levantamento em 18/10/2026. Os documentos originais foram preservados. Esta revisão separa material aproveitável, divergências e trabalho ainda necessário; não substitui a orientação acadêmica ou a revisão jurídica.

## Material lido

| Documento original | Contribuição e limite |
| --- | --- |
| `note.txt` | Problema, público, requisitos iniciais, narrativa de uso, ideias de diagramas, descrição de protótipo e trecho Streamlit. Mistura decisões de tecnologias e regras de momentos diferentes. |
| `Documentação sobre Contagem de Prazos Processuais.md` | Base de pesquisa com links oficiais, separação de meios de comunicação e alerta sobre calendário local. Não constitui catálogo exaustivo ou revisão profissional das regras. |
| `MASTER PROMPT — Sistema de Contagem de Prazos Processuais Brasileiros.md` | Especificação alvo: motor independente, fontes, versões, auditabilidade, skills e primeira fatia civil. É a referência para evolução. |
| `REQUISITO ADICIONAL OBRIGATÓRIO — Vercel + Supabase.md` | Consolida hospedagem e backend obrigatórios; prevalece sobre sugestões anteriores de Firebase/backend opcional. Integração só termina com evidência operacional. |
| `6-Template_Relatorio_TG-II.pdf` | Modelo de relatório de 23 páginas, parcialmente preenchido com introdução, fundamentação e conclusão sobre uma calculadora web simplificada. Contém textos genéricos de endpoints/testes e seções ainda a preencher; declarações-modelo de testes aprovados não são evidência de execução. A inspeção do PDF foi realizada na tarefa principal. |

## O que aproveitar

O problema de reduzir erros manuais, o foco em estudantes/profissionais, a interface móvel e o histórico são coerentes. A documentação complementar já reconhece que suporte dos autos e meio de comunicação são coisas distintas, e que uma contagem depende do tribunal, normas locais e evento correto. Esses pontos orientam `requirements.md` e `GLOSSARY.md`.

O relatório pode manter a estrutura acadêmica, mas metodologia, tecnologias, figuras e avaliação precisam refletir a implementação efetivamente entregue. A conclusão não deve afirmar redução mensurada de erros ou aprovação de usuários sem estudo correspondente.

## Divergências a resolver na versão acadêmica

| Trecho/ideia original | Encaminhamento |
| --- | --- |
| Civil com recesso de 20/12 a 06/01 | O art. 220 do CPC estabelece suspensão dos prazos processuais de 20/12 a 20/01, inclusive. Recesso/expediente e suspensão processual são conceitos diferentes; a primeira regra civil usa a suspensão aplicável, sujeita ao âmbito e às exceções. [CPC, arts. 219–224](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm). |
| Trabalhista sem recesso e botão “Corridos” como regime | Generalização inadequada. Cada ramo exige pesquisa e regra próprias; a primeira fatia oferece somente civil comum em dias úteis. |
| Carnaval, Sexta-feira Santa e Corpus Christi gerados como feriados nacionais | A data móvel calculada não comprova natureza jurídica ou efeito no prazo. Confirmar normas e atos do calendário local; armazenar a proveniência de cada ocorrência. |
| Ajustar automaticamente qualquer “publicação/intimação” para o dia útil seguinte | É necessário saber qual evento a data representa. Disponibilização, publicação, consulta e juntada exigem tratamento próprio; datas ambíguas não recebem vencimento fabricado. |
| Atalho “contestação 15d” decide sozinho a contagem | A quantidade não resolve termo inicial, pluralidade de réus, prerrogativas ou regra especial. O MVP solicita quantidade e meio suportado, com escopo declarado. |
| Exemplo 05/10/2026 + 5 úteis termina em 12/10 | O próprio documento o qualifica como ilustrativo sem calendário real. Não usá-lo como oráculo do TJSP sem considerar feriados e suspensões aplicáveis. |
| “Armazenamento em nuvem (GitHub)” | GitHub hospeda código e CI; o banco da aplicação é PostgreSQL no Supabase. |
| Figma/Bravo/Notion/Lovable/Firebase, depois TanStack Start, depois código Streamlit | São propostas ou protótipos distintos. A implementação alvo usa Next.js/React/TypeScript e Supabase, hospedada na Vercel. Notion/Figma só podem ser descritos como usados se houver evidência. |
| Não usa banco/login; depois requisitos de cadastro e autenticação | Distinguir protótipo inicial da integração prevista. Histórico privado depende de Auth, migrations e RLS verificados. |
| Login Google ou senha sem confirmar e-mail | OAuth Google é expansão. Configuração de confirmação de e-mail exige decisão de segurança e ambiente, não decorre automaticamente da nota inicial. |
| Teste de usabilidade com usuários simulados | Identificar como inspeção/cenário quando não houver participantes; testes empíricos reais exigem procedimento e evidências próprios. |

## Estado desta evolução

O recorte é TJSP, Comarca de São Paulo (Capital), civil comum em dias úteis. A data de um resultado pode ser simulada com calendário versionado de demonstração; o estado `provisional` significa provisório, com pendências e sem validação jurídica final. `incomplete` usa vencimento nulo quando os dados/cobertura não bastam. Fontes oficiais de alguns eventos não tornam o calendário completo.

Documentação nova organiza os requisitos, o vocabulário, as fronteiras técnicas, quatro skills locais e o backlog. A presença desses artefatos não demonstra deploy, autenticação real, migrations aplicadas, testes aprovados ou revisão jurídica. Os registros de execução e o README devem apresentar somente fatos observados.

## Próximos ajustes no relatório

1. Substituir descrições conflitantes pela arquitetura efetivamente entregue e justificar o recorte.
2. Completar casos de uso, domínio, componentes e modelo de dados com diagramas consistentes.
3. Inserir capturas reais da interface, memória e estados incompletos/provisórios.
4. Descrever seleção de fontes, revisão de casos, estratégia de testes e limitações jurídicas.
5. Reportar comandos/resultados e eventual avaliação com participantes sem reutilizar exemplos do template como evidência.

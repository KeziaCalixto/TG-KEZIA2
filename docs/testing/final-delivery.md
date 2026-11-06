# Verificação final da entrega local — 20/10/2026

Ambiente: Windows, Node 22, pnpm 11.0.8, Supabase local e Mailpit, Next.js em `127.0.0.1:3000`. Etapa sobre os marcos `a424ed9` e `25bc3a4`. Não houve push, deploy, migration nova ou mudança de Auth hospedado.

## Alterações verificadas

Ajuda/privacidade acessíveis pelo rodapé; título opcional fora do contrato do motor; busca por título/comarca/data entre os registros carregados, insensível a acentos; exclusão com confirmação, cancelamento e foco; exportação e impressão completas, incluindo memória incompleta. O título respeita o limite já validado no servidor. Identidade, RLS e calendário não foram relaxados.

## Comandos e resultados reais

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | Exit 0 |
| `pnpm check` | Exit 0 na execução final: tipos, lint, formatação e 81 unitários |
| `pnpm lint` | Exit 0; helper ajustado posteriormente também formatado e conferido |
| `pnpm format:check` | Exit 0 |
| `pnpm test` | 81 testes aprovados, 11 arquivos, exit 0 |
| `pnpm audit --audit-level high` | Exit 0, um advisory alto especificamente ignorado; patch/testes de mitigação preservados |
| `pnpm build` | Exit 0; 20 páginas/rotas geradas, TypeScript aprovado |
| `pnpm test:e2e` | 29 aprovados, um omitido, exit 0; aproximadamente 1,5 minuto |
| `pnpm db:test` | 28 testes pgTAP em dois arquivos, exit 0 |
| `pnpm db:test:auth` | Identidades reais, permissões próprias, isolamento e recusa anônima aprovados, exit 0 |
| `pnpm db:test:app` | Cadastro/PKCE, login/logout/recarga, título e memória original, isolamento, exclusão confirmada e limpeza aprovados, exit 0 |
| `pnpm db:test:invite` | Convite em navegador novo, senha, sessão SSR, indicador/375px, replay/fragmento inválido e limpeza aprovados, exit 0 |
| `pnpm db:test:recovery` | Template Mailpit, PKCE, nova senha, histórico privado, senha antiga/replay recusados e limpeza aprovados, exit 0 |

O caso omitido é a duplicação do PDF A4 no projeto mobile: o PDF foi gerado e conferido no desktop; exportação incompleta, privacidade, título, busca e exclusão rodaram em ambas as viewports. Emulação não equivale a teste em aparelhos físicos.

Axe não apontou violações nos cenários automatizados cobertos. Foram ensaiados foco no resumo de erro, cancelamento de exclusão e retorno do foco ao disparador/mensagem. Não há avaliação com participantes, ensaio completo com leitor de tela ou certificação WCAG.

## Falhas de harness corrigidas

As duas primeiras tentativas de `db:test:app` falharam por seletores antigos: o seletor genérico de submit passou a encontrar e-mail e Google, e a espera por JSON visível desconsiderava que o conteúdo técnico fica em details recolhido. O helper passou a selecionar o botão de e-mail, verificar a memória legível e abrir explicitamente os dados técnicos. A tentativa final completou todas as etapas, incluindo título e confirmação de exclusão. As fixtures foram removidas também nas tentativas com falha.

Inspeção adicional confirmou que os helpers de cadastro/convite já usam DELETE `/api/v1/messages` com IDs não vazios; a pendência de padronização registrada anteriormente estava desatualizada. As execuções finais confirmaram limpeza. O helper de recuperação verifica ainda consulta individual 404 das suas mensagens. Nenhuma conta real ou mensagem externa foi usada.

## Artefatos e inspeção

- [Ajuda local](artifacts/ajuda-local.png) e [Privacidade local](artifacts/privacidade-local.png), conferidas pelo navegador do Codex sem sessão real.
- [Calculadora desktop](artifacts/calculadora-desktop.png) e [mobile](artifacts/calculadora-mobile.png), atualizadas pela suíte.
- [Memória PDF e inspeção das duas páginas](export-print.md), com fontes/versões/avisos e sem outro registro do histórico.

## Limites do aceite

Conferência final dos materiais: nove documentos de entrada/entrega/revisão, 54 links locais resolvidos, nenhum destino ausente. Nenhuma mensagem de integração temporária restante no Mailpit; app respondeu HTTP 200. A CI foi atualizada para usar `pnpm check`, incluindo formatação; a nova configuração passou na verificação de sintaxe/formatação local, mas não foi executada remotamente porque os commits permaneceram locais.

Revisão jurídica, completude por comarca/foro, 2027 e estudo de usabilidade continuam pendentes. A instalação hospedada anterior não foi atualizada ou reensaiada nesta etapa. Backup/restauração, retenção institucional, CAPTCHA/rate limiting distribuído, MFA e exclusão autônoma de conta não são anunciados como implantados. O procedimento administrativo e os limites reais estão em [operação](../entrega/operacao.md) e [revisão técnica de segurança](../security/release-review.md).

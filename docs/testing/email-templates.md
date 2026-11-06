# Templates locais — 19/10/2026

Atualização posterior: o envio testado aqui evoluiu para [aceitação de convite, definição de senha e indicação de sessão](invitation-login.md). As limitações de onboarding relatadas abaixo descrevem a etapa anterior.

Ambiente: Supabase CLI 2.121.0, Auth em Docker, Studio/Mailpit locais. Nenhum envio externo ou configuração remota foi utilizado.

## Reprodução e causa

`config.toml` continha somente `auth.email.template.invite`; o HTML de convite tinha texto padrão em inglês e o assunto alterado pelo usuário referenciava `SiteName`. A inspeção filtrada de `docker inspect supabase_auth_TG-KEZIA2` não encontrou variáveis `GOTRUE_MAILER_SUBJECTS_*` ou `GOTRUE_MAILER_TEMPLATES_*` aplicadas. A stack em execução não havia incorporado a configuração.

Um harness temporário criou dois usuários fictícios, chamou `auth.admin.inviteUserByEmail` e `auth.signUp`, consultou apenas suas mensagens no Mailpit e comparou assunto/HTML esperados. Antes da correção: exit 1, ambos falharam. Assuntos observados: `You've been invited` e `Confirm your email address`; nenhum corpo personalizado. Fixtures e mensagens foram removidas.

## Correção e verificação

- Templates separados `invite.html` e `confirmation.html`, associados às seções correspondentes do TOML; assuntos explícitos em português e `ConfirmationURL` preservada.
- `pnpm exec supabase stop`: exit 0, `backup: true`.
- `supabase start` pelo executável local: exit 0, banco restaurado do backup. Não houve reset de banco nem exclusão de volumes.
- Inspeção filtrada após reinício: os dois assuntos e URLs internos `/email/invite.html` e `/email/confirmation.html` estavam presentes no ambiente Auth.
- Mesmo harness após reinício: exit 0. Convite com assunto `Você foi convidado para o Prazo Claro`; confirmação com `Confirme seu e-mail no Prazo Claro`. Ambos com HTML personalizado, link `/auth/v1/verify` renderizado e sem expressões de template não preenchidas. Usuários/mensagens efêmeros removidos.
- `pnpm db:test:app`: exit 0. Teste passou a exigir assunto/corpo personalizados antes de seguir o link: cadastro, e-mail local, PKCE/SSR, login/logout, recarga, cálculo/histórico, isolamento entre contas e exclusão aprovados; fixtures removidas.
- Prettier dos dois HTMLs e do harness permanente de aplicação: aprovado.

O harness temporário foi removido; a regressão de confirmação permanece em `supabase/scripts/verify-local-app.mjs`. [Instruções para repetir pelo Studio e aplicativo](../../supabase/templates/README.md). O teste de convite cobre envio/renderização; não foi implementado fluxo de definição de senha para convidados. Esta execução não reavalia o lint pendente da revisão anterior nem comprova SMTP remoto.

## Design profissional — verificação adicional em 19/10/2026

Convite e confirmação receberam a identidade do Prazo Claro, com layout por tabelas, estilos essenciais inline, fontes do sistema, preheader, CTA e endereço alternativo. O primeiro envio após editar o HTML ainda trouxe a cópia anterior: foi necessário recarregar a stack pelo CLI. Stop padrão com backup e start concluíram sem reset.

Um harness temporário enviou as duas modalidades ao Mailpit e verificou presença do novo HTML, variáveis preenchidas e destinos `/auth/v1/verify`. Para capturas, os links reais foram substituídos em memória por endereços fictícios antes de renderizar. Foram removidos somente os usuários e mensagens do teste.

Os quatro cenários (convite/confirmação × 800px/375px) passaram: sem rolagem horizontal, uma ação principal com altura mínima de 44px e nenhuma violação nas regras Axe WCAG A/AA automatizadas executadas. As quatro capturas foram inspecionadas visualmente:

- [Convite desktop](artifacts/email-invite-desktop.png) e [celular](artifacts/email-invite-mobile.png).
- [Confirmação desktop](artifacts/email-confirmation-desktop.png) e [celular](artifacts/email-confirmation-mobile.png).

`pnpm db:test:app` passou novamente com o HTML redesenhado, incluindo confirmação PKCE/SSR, sessão e histórico. `prettier --check` dos dois HTMLs e `git diff --check` passaram. Não houve mudança de código TypeScript ou regras processuais nesta etapa de design.

Após o ajuste final da orientação do convite, a stack foi recarregada com backup padrão e o harness de envio/renderização repetiu os quatro cenários com exit 0, incluindo uma asserção do texto final. As capturas vinculadas acima foram atualizadas com esse envio. O harness temporário de design foi removido.

As capturas usam Edge/Chromium sobre o HTML recebido no Mailpit; não representam testes em Gmail, Apple Mail ou Outlook nativos, modo escuro forçado ou leitor de tela. Os estilos inline e fallbacks reduzem diferenças entre clientes, sem comprovar equivalência visual completa.

# E-mails locais do Prazo Claro

Os assuntos e caminhos são definidos em `supabase/config.toml`, na raiz do projeto:

| Fluxo | Seção | HTML |
| --- | --- | --- |
| Convidar pelo Studio / `auth.admin.inviteUserByEmail` | `auth.email.template.invite` | `invite.html` |
| Cadastro pelo aplicativo / `auth.signUp` | `auth.email.template.confirmation` | `confirmation.html` |

O nome do arquivo não escolhe o fluxo: quem faz essa associação é a seção do TOML. Ambos usam `{{ .ConfirmationURL }}`, mantendo o link gerado pelo Auth. `SiteName` não é uma variável documentada; o nome Prazo Claro está escrito explicitamente nos assuntos.

Após alterar a configuração ou os arquivos HTML, execute **na raiz do repositório**:

```sh
pnpm exec supabase stop
pnpm exec supabase start
```

Use o stop padrão, que preserva os dados locais. Não é necessário `db reset` nem `stop --no-backup`. Reiniciar apenas o container Docker não reaplica o TOML.

Envie uma **mensagem nova**: o Mailpit não altera o conteúdo de e-mails recebidos antes da mudança. Em [Studio local](http://127.0.0.1:54323), Authentication → Users → Invite user exercita `invite`; em [Criar conta](http://127.0.0.1:3000/entrar), o cadastro exercita `confirmation`. Confira o assunto e corpo em [Mailpit](http://127.0.0.1:54324).

O fluxo de cadastro e confirmação PKCE é testado por `pnpm db:test:app`, com stack e aplicativo ativos. `pnpm db:test:invite` testa o convite administrativo real em navegador sem sessão: recebimento no Mailpit, aceitação, cookies reconhecidos no servidor, definição de senha, login posterior e indicador de conta. Não são salvos traces ou URLs de autenticação. Usuário e mensagem efêmeros são removidos.

Convites usam `ConfirmationURL` normalmente: o Supabase verifica o link e retorna tokens no fragmento, que a aplicação consome explicitamente antes de encaminhar para `/conta/definir-senha`. Esse fluxo não depende do navegador usado pelo administrador para enviar o convite. Links consumidos ou inválidos mostram erro genérico; para um novo ensaio, use endereço fictício ainda não cadastrado. [Evidências](../../docs/testing/invitation-login.md).

Configuração remota é independente: templates de um projeto hospedado são aplicados no Dashboard correspondente. Não houve alteração remota nesta correção.

Referências: [customização local e reinício](https://supabase.com/docs/guides/local-development/customizing-email-templates), [variáveis de template](https://supabase.com/docs/guides/auth/auth-email-templates).

## Design dos e-mails

Os dois modelos usam a identidade do Prazo Claro: cabeçalho azul, faixa e botão âmbar, tipografia editorial e cartão com largura máxima de 600px. O CSS essencial é inline, com layout por tabelas e fontes do sistema. Ajustes para celular ampliam o botão e reduzem os recuos. Não há imagens/fontes externas ou scripts.

O link alternativo abaixo da ação também usa `ConfirmationURL`; preserve as três ocorrências da variável em cada HTML. Os detalhes de design ficam em `design-system/prazo-claro/pages/emails.md` e a verificação em `docs/testing/email-templates.md`.

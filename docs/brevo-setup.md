# Preparar o Brevo para os lembretes

Etapa iniciada em 23/10/2026. O SMTP do Supabase continua responsável pelos e-mails de autenticação. Os lembretes da aplicação precisam de uma credencial própria da API v3. A preparação abaixo não habilita envios nem cria um scheduler.

## Obter e guardar a credencial

1. No Brevo, abrir **Configurações → SMTP e API → API Keys & MCP** e escolher **Gerar uma nova chave de API**. Concluir pessoalmente a verificação de identidade, se solicitada.
2. Nomear a chave **Prazo Claro — lembretes**, escolher a validade e gerar. Deixar **Create MCP server API key** desmarcado: a aplicação usa a API transacional comum.
3. Copiar a chave enquanto está visível e preencher `BREVO_API_KEY` em `.env.reminders.external.local`, na raiz do projeto. Não usar a chave SMTP, não colar em mensagens e não criar variável `NEXT_PUBLIC_`.
4. Preencher `BREVO_SENDER_EMAIL` com o endereço do remetente já verificado no Brevo; pode ser o mesmo usado no SMTP do Supabase. Manter `BREVO_SENDER_NAME=Prazo Claro`.
5. Salvar o arquivo. `.env*` é ignorado pelo Git, com exceção de `.env.example`. Confirmar essa proteção antes de qualquer commit.

Modelo sem credenciais, caso o arquivo ainda não exista:

```dotenv
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=Prazo Claro
```

O Brevo só mostra a chave completa na criação. Perda exige nova chave; não substituir/revogar a chave SMTP usada pelo Auth para configurar os lembretes. Validade e eventual desativação por inatividade precisam ser acompanhadas pelo responsável.

Na tela de permissões, escolher **Acesso restrito**, **E-mails transacionais: Todos**, **Conta: Lidas** e **Nenhum** nos demais recursos. Isso atende ao envio e à consulta do remetente feita pelo helper; não concede acesso total a todos os produtos. Essa configuração foi validada em sandbox nesta etapa.

## Verificar em sandbox

Executar na raiz do projeto:

```powershell
pnpm reminders:check:brevo
```

O helper consulta os remetentes, exige correspondência com um remetente ativo e faz uma requisição transacional com `headers: {"X-Sib-Sandbox":"drop"}` no JSON. O destino da requisição é o próprio remetente. A documentação do Brevo especifica que esse modo não entrega e-mails nem cria logs de mensagens. O resultado esperado é HTTP 201 com `messageId`; o helper imprime somente um resumo fixo, sem credencial, endereço ou resposta bruta.

O script tem URLs HTTPS fixas, recusa redirecionamentos, limita o tempo das requisições e não oferece opção para remover o sandbox. Não conecta ao Supabase, não consulta cálculos e não altera a fila. Uma confirmação sandbox não é evidência de entrega real nem deve marcar lembretes como enviados.

Quando o Brevo informar IP de origem não reconhecido, o helper mostra uma orientação específica e, se houver IPv4 válido na mensagem, somente esse endereço. Não imprime o corpo da resposta. Comparar a tentativa/chave no painel antes de autorizar; o IP local não determina o IP de saída da futura Vercel.

Em HTTP 401/403, conferir chave ativa, tipo de chave e eventual restrição de IP no painel. Autorizar somente atividade reconhecida; não desativar os controles de segurança por tentativa. Configuração inválida, remetente ausente/inativo, rejeição ou falha de rede encerram com código 1 e mensagem genérica.

Se aparecer **“BREVO_API_KEY contém uma chave SMTP”**, a credencial foi criada na aba SMTP. Gerar uma chave na aba **API Keys & MCP**, com a opção MCP desmarcada, e substituir somente `BREVO_API_KEY` no arquivo local. Não modificar a configuração SMTP já funcional do Supabase. O helper reconhece o formato SMTP e recusa a requisição antes de usar a rede.

## Próximos aceites

- Adaptador Brevo no servidor, com opt-in explícito e isolamento entre filas locais/externas e ambientes de preview/produção.
- Scheduler hospedado com segredo em armazenamento apropriado, observação dos resultados HTTP e procedimento de desativação.
- Credenciais exclusivamente no ambiente de produção, remetente conferido, cotas atuais e ensaio controlado pelo proprietário da conta.
- Evidências de envio real, recebimento e link privado, separadas da resposta sandbox. Não afirmar entrega apenas por aceite da API.

## Fontes primárias consultadas em 23/10/2026

- [Criar e gerenciar chaves de API](https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys).
- [Consultar remetentes](https://developers.brevo.com/reference/get-senders).
- [Modo sandbox](https://developers.brevo.com/docs/using-sandbox-mode).
- [Escopos por recurso](https://developers.brevo.com/docs/oauth-scopes) e [segurança por IP](https://help.brevo.com/hc/en-us/articles/5740111683858-Authorize-and-block-IP-addresses-for-API-and-SMTP-security).

Verificações realizadas e limites: [evidências desta etapa](testing/brevo-preparation.md).

# Conferência final da versão publicada

Usar o [site oficial](https://tg-kezia2.vercel.app), dados fictícios e uma conta de teste própria. O estado de cada aceite está na [matriz vigente](aceite.md); seguir este roteiro não marca os itens automaticamente. Não compartilhar senha, código, cookies ou endereço completo de confirmação/recuperação.

## Conta — responsável pelo teste

1. Cadastrar com um e-mail de teste que possa receber mensagens. O site abre “Confira seu e-mail.”; seguir a orientação e abrir a confirmação no mesmo navegador do cadastro, entrar e conferir o indicador Conectado.
2. Sair e entrar com e-mail/senha. Para uma conta com senha, iniciar a recuperação no site e concluí-la no mesmo navegador, com senha nova; conferir novo login. Usar somente conta descartável ou própria.
3. Se for demonstrar convite administrativo, gerar convite para conta de teste própria pelo Supabase, aceitar e definir senha no site. Esse fluxo é distinto do cadastro; não reutilizar um link já consumido.
4. Registrar apenas resultado e horário de cada fluxo. Falha deve incluir a mensagem visível e a etapa; nenhum link de Auth ou valor privado deve ser anexado.

As integrações locais desses fluxos já têm evidências; esse ensaio registra o comportamento real de SMTP/callbacks no ambiente publicado. Não repetir envio desnecessariamente se o provedor aplicar limite.

Resultado informado em 24/10: cadastro recebeu a mensagem, link confirmou a conta e retorno ficou conectado; recuperação funcionou normalmente. A tela dedicada foi adicionada depois desse relato e validada por navegador e integração local real, conforme [evidências](../testing/signup-confirmation-page.md). Convite mantém aceite separado na matriz.

## Histórico e memória

Salvar um cálculo fictício elegível, recarregar, abrir a memória original e exportar JSON/PDF. Conferir ramo, tribunal, localidade, fontes, versões e avisos. O responsável já confirmou salvar/recarregar/exportar na versão ampliada; repetir apenas se houver mudança relacionada ou necessidade de ensaio da apresentação.

## Lembrete de 24/10

O responsável agendou para **24/10/2026 às 09h, America/Sao_Paulo**, três dias antes do vencimento estimado de 27/10. A confirmação do agendamento aparece no site; o e-mail é somente o lembrete no horário escolhido.

**Resultado desse primeiro ensaio: inconclusivo.** Às 13h30 a fila estava vazia e o agendador ativo. O responsável não recebeu o e-mail e confirmou que excluiu o cálculo, sem lembrar o horário da exclusão. Excluir o cálculo também remove o lembrete; não é possível provar se foi removido antes das 09h. Recebimento segue pendente.

No horário agendado, conferir caixa de entrada e spam, destinatário da conta e o botão de acesso à memória. O vínculo exige login na conta proprietária. Informar separadamente se a mensagem chegou e se a memória abriu. Estado accepted no histórico/banco comprova somente aceite pelo serviço de e-mail.

Se o horário passou sem mensagem, registrar o relato e conferir fila, tentativa, error_code e invocação conforme [operação](../reminder-scheduler-operations.md). Não antecipar send_at nem recriar uma tentativa incerta para forçar entrega. Um teste novo deve ser solicitado pelo proprietário para horário futuro.

### Repetição proposta para 24/10 às 18h

1. No site, usar Civil → TJSP → São Paulo, publicação **26/10/2026**, **1 dia**. Conferir vencimento estimado **27/10/2026** nas premissas demonstrativas e salvar com título fictício que lembre de manter o registro.
2. No Histórico, escolher **3 dias antes**, **18:00**, marcar o consentimento para e-mail e ativar. Conferir a data efetivamente mostrada: **24/10/2026 às 18h, America/Sao_Paulo**. Se esse horário já passou, escolher outro futuro suportado; não alterar o banco.
3. **Manter o cálculo salvo e o lembrete ativo até concluir a conferência.** Não excluir nem cancelar durante o ensaio. Não é necessário deixar o navegador aberto; o processamento é hospedado.
4. Após o horário, conferir caixa de entrada e spam. Abrir o vínculo na conta proprietária, informar recebimento e abertura da memória separadamente. Só então encerrar o teste e excluir o registro, se desejar.

O agendamento novo depende de ação do proprietário; os passos acima não significam que já foi criado. [Evidências e limites](../testing/reminders-production.md).

## Apresentação

Ensaiar o [roteiro de 8 a 12 minutos](demonstracao.md), com conta disponível, exemplo civil e comparação de perfis, fontes, histórico e exportação. Ter o PDF preparado como contingência. No celular, conferir navegação, formulário e memória sem cortes. Registrar os limites da cobertura parcial e a revisão jurídica pendente.

O fechamento técnico do aplicativo e dos materiais não encerra revisão jurídica profissional, avaliação com participantes, relatório acadêmico ou operação institucional. Esses itens têm responsáveis e evidências próprios no [backlog](../backlog.md).

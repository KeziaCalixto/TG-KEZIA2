# Lembretes de prazo por e-mail

## Solicitação

Salve um cálculo provisório na sua conta e abra o histórico. Se os lembretes estiverem disponíveis, escolha **3, 1 ou 0 dias corridos antes** do vencimento original e o horário **09h, 12h ou 18h**, no fuso **America/Sao_Paulo**. O instante precisa estar no futuro.

Confirme explicitamente o envio externo para o e-mail confirmado da sua conta. O destinatário não é um campo arbitrário: o serviço verifica a conta proprietária antes do envio. Cada cálculo admite no máximo uma geração ativa, inclusive entre os modos local e Brevo.

## Quando a mensagem chega

A confirmação do agendamento aparece no site. O e-mail é previsto para o horário escolhido; não existe uma mensagem imediata separada prometida apenas para confirmar o agendamento. A antecedência usa dias corridos e não altera a regra de contagem processual.

Exemplo didático: vencimento original em 27/10, antecedência de três dias e horário 09h correspondem a uma solicitação para 24/10 às 09h de São Paulo. Esse exemplo já passou e não deve ser usado como horário futuro para um teste novo.

## Estados e acompanhamento

| Estado técnico | Significado |
| --- | --- |
| pending | Programado ou aguardando tentativa elegível |
| processing | Reservado pelo processador |
| accepted | Aceito pelo serviço de e-mail; não equivale a prova de entrega ou leitura |
| failed | Falha definitiva ou janela/limite excedido |
| uncertain | O envio pode ter ocorrido; não há repetição automática silenciosa |
| cancelled | Cancelado pelo proprietário |

O link da mensagem abre a memória original e exige a conta proprietária. Se for necessário entrar, reabra o vínculo depois do login.

## Cancelamento e teste

Cancele pelo histórico antes do envio quando não quiser mais o aviso. Cancelamento não recolhe uma requisição já em curso. Excluir o cálculo remove a fila associada; isso pode eliminar a evidência necessária para investigar uma tentativa.

Para testar, programe um horário futuro permitido, mantenha o cálculo, confira o estado depois do horário e verifique caixa de entrada/spam. Recebimento é uma confirmação humana distinta do aceite do provedor. [Aceite registrado de 24/10](../../../docs/testing/reminder-receipt-2026-10-24.md).

No desenvolvimento, Mailpit captura mensagens locais sem representar entrega externa. SMTP de autenticação e API de lembretes são canais separados. [Operação do agendador](../../../docs/reminder-scheduler-operations.md).

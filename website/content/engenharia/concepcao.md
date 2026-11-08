# Da concepção ao recorte entregue

## Necessidade de informação

O projeto procura tornar a simulação explicável: preservar evento, perfil, calendário, regra e trilha, em vez de guardar só o vencimento. O master prompt previa um sistema mais amplo; a implementação avança por fatias com requisitos, fontes e testes próprios.

A primeira fatia foi civil comum na Capital. A evolução adicionou dez comarcas TJSP, perfis criminal/trabalhista ordinários, composição trabalhista 2026–2027, catálogo inicial de atos, histórico e lembretes. Essas entregas não anunciam suporte universal aos ramos processuais.

## Fronteiras da solução

- **Domínio:** cálculo determinístico e catálogos versionados, sem banco, rede ou relógio.
- **Aplicação:** valida entradas, seleciona versões e compõe resultados e snapshots.
- **Interface HTTP e UI:** formulários, memória, conta, histórico e contratos de erro.
- **Persistência:** identidade, propriedade, integridade, políticas e operações transacionais.
- **Infraestrutura:** hospedagem, sessão, e-mail e agendamento.

O monólito modular Next.js reduz a operação enquanto não existe necessidade demonstrada de separar serviços. Data API/SSR preservam a identidade da conta na passagem ao banco; um ORM não foi introduzido como segunda via de acesso.

## Decisões documentadas

Os ADRs registram motivo, alternativas e consequências: stack, acesso via Data API, histórico individual, preservação de versões civis, fila com estado incerto e agendamento assinado. Cada decisão é um ponto de continuidade para quem mantiver o projeto.

## Da engenharia à evidência

Requisito e fonte orientam casos de referência; os testes de domínio verificam a contagem sob versões explícitas. Testes SQL verificam propriedade e transições. Contratos HTTP e E2E conferem o comportamento observável. Integrações reais e aceite humano acrescentam o que mocks e fixtures não comprovam.

A ausência de UPDATE para o usuário preserva o fluxo comum de leitura do snapshot, mas não cria assinatura criptográfica ou prova jurídica. Aprovação técnica e revisão jurídica permanecem estados separados.

[Arquitetura detalhada](../../../docs/architecture.md) · [Requisitos](../../../docs/requirements.md) · [Dicionário e relatório do banco](../../../docs/relatorio-banco/relatorio.md).

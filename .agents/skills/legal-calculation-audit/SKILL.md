---
name: legal-calculation-audit
description: Auditar memória de cálculo, comparar casos de referência e investigar divergências ou regressões entre versões do motor, regras e calendários.
---

# Auditoria de cálculo

## Ativação e responsabilidades

Use para conferir um resultado/exportação/histórico ou investigar divergência. Leia [glossário](../../../GLOSSARY.md), [arquitetura](../../../docs/architecture.md) e os casos em `docs/legal/validation-cases/`. Preserve o artefato original para comparação.

## Procedimento

1. Reúna entrada, versão do motor/regra/calendário, cobertura, fontes, fuso, estado de revisão e memória. Separe dados informados, dados normativos e resultados.
2. Reexecute com as mesmas versões e snapshots, sem substituí-los pelos dados atuais. Se faltarem, classifique a reprodução como bloqueada e liste o material necessário.
3. Confira evento, comunicação considerada, dia do começo, primeiro dia computado, sequência inclusões/exclusões e vencimento/prorrogação. Cada motivo deve remeter à regra ou ocorrência usada.
4. Compare com caso de referência: classifique diferença como entrada, calendário, regra, implementação ou expectativa/oráculo. Caso sem revisão profissional não vira oráculo jurídico definitivo.
5. Confira que impressão/exportação/histórico preservam avisos, fontes e estado provisório/incompleto. Vencimento nulo não pode virar data aparente na UI.
6. Para defeito técnico confirmado, acrescente regressão do comportamento afetado e registre o resultado dos comandos. Mudança de interpretação exige nova versão e referência, preservando o resultado histórico.

## Limites e qualidade

Auditoria técnica demonstra rastreabilidade e reprodução; validação jurídica exige responsável habilitado e registro separado. Não declare imutabilidade ou autenticidade de evidência apenas por existir hash/JSON. Redija exemplos e logs com dados mínimos, evitando nomes, credenciais e números reais desnecessários.

## Formato de saída

Identificação do caso e versões; entrada resumida; esperado e observado; divergências por categoria com evidência; reprodução e comandos/resultados; impacto, correção/regressão e pendências. A auditoria está concluída quando cada divergência está explicada ou explicitamente pendente, com fonte e responsável necessários indicados.

---
name: procedural-deadline-engine
description: Modelar e implementar o motor determinístico quando mudar contrato de cálculo, marcos iniciais, contagem, suspensão ou prorrogação de prazos.
---

# Motor de contagem

## Ativação e responsabilidades

Use para mudanças no motor e em sua seleção de regras. Preserve a independência de React, Next.js, Supabase, rede e relógio. Leia [arquitetura](../../../docs/architecture.md), [requisitos](../../../docs/requirements.md) e os casos em `docs/legal/validation-cases/` antes de mudar comportamento.

## Procedimento

1. Determine regra/versão, âmbito, vigência, meio, unidade e cobertura necessários. Se o caso exigir informação ausente, especifique resultado incompleto com vencimento nulo.
2. Expresse uma tabela de referência com evento original, comunicação considerada, dia do começo, primeiro dia computado e vencimento. Confirme o fundamento no registro jurídico; casos sem revisão profissional continuam identificados assim.
3. Escreva teste inicialmente falho do comportamento observável; implemente a menor alteração e execute o teste. Refatore e rode regressão pertinente, registrando resultados reais.
4. Use datas civis Temporal sem conversão implícita por UTC. Entrada explícita inclui regra/calendário versionados; horário atual pertence à aplicação.
5. Para cada data examinada, preserve inclusão/exclusão e motivo/fundamento. Diferencie suspensão que preserva saldo, interrupção que reinicia quando prevista e prorrogação de vencimento.
6. Confira que mesmas entradas/versões geram mesmo resultado e que exportação/histórico mantêm estado e pendências.

## Limites e qualidade

A fatia inicial calcula civil comum em dias úteis para TJSP Capital, nos meios efetivamente especificados. Outras unidades ou exceções exigem contratos e fontes próprios. Resultado `provisional` pode conter data simulada dentro da cobertura; `incomplete` permanece sem data final. Calendário demonstrativo nunca vira juridicamente validado por uma suíte verde. Modelos de linguagem não decidem o vencimento.

## Formato de saída

Resumo da regra/versão e mudança, cenários cobertos, entrada/saída, trilha explicável, comandos executados e seus resultados, limitações e pendências jurídicas. O trabalho técnico só termina quando os cenários afetados e a regressão pertinente foram executados ou o bloqueio foi identificado sem alegar aprovação.

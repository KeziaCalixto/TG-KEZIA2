---
name: judicial-calendar
description: Manter calendários forenses ao incluir eventos, suspensões ou indisponibilidades, alterar cobertura territorial/temporal ou publicar nova versão.
---

# Calendário com proveniência

## Ativação e responsabilidades

Use para qualquer alteração que torne uma data computável ou excluída ou altere a cobertura/revisão do calendário. Leia [arquitetura](../../../docs/architecture.md) e os registros em `docs/legal/sources/`; identifique tribunal, UF, município, comarca e eventual foro/unidade.

## Procedimento

1. Determine o intervalo que será coberto, inclusive a possível travessia de ano. Declare o grau de precisão territorial e as unidades ainda não levantadas.
2. Consulte atos e calendários oficiais do [TJSP](https://www.tjsp.jus.br/) para o recorte inicial e as normas nacionais aplicáveis. Registre fonte, dispositivo/ato, órgão, URL, consulta, vigência e efeito processual de cada ocorrência.
3. Classifique separadamente feriado, suspensão, expediente alterado e indisponibilidade certificada. Indisponibilidade exige sistema, intervalo e regra de efeito; não a transforme automaticamente em feriado integral.
4. Datas móveis podem ser calculadas como candidatas. Só atribua efeito jurídico após vincular norma/ato e âmbito; domingo de Páscoa não torna automaticamente todas as datas relacionadas feriados nacionais.
5. Crie nova versão preservando a anterior. Registre eventos adicionados/alterados, cobertura, completude e revisão. Cálculos históricos continuam ligados ao snapshot usado.
6. Execute casos do motor afetados: feriado local, sobreposição de motivos, suspensão inclusiva, travessia de ano e saída da cobertura. Registre lacunas de atos extraordinários.

## Limites e qualidade

O calendário inicial TJSP Capital é demonstrativo enquanto a cobertura e revisão não estiverem concluídas, mesmo que parte dos eventos tenha fonte oficial. Fonte de evento e completude do conjunto são evidências diferentes. Dentro da cobertura declarada, mantenha estado provisório quando aplicável; fora dela, devolva cálculo incompleto. Nenhuma abrangência nacional se presume de um ato local.

## Formato de saída

Versão/âmbito/período, tabela de eventos com natureza/datas/efeito/fonte, mudanças frente à versão anterior, estado de completude/revisão, casos executados e pendências. Termine apenas quando todos os eventos adicionados possuem proveniência ou identificação explícita de demonstração sem alegação de oficialidade.

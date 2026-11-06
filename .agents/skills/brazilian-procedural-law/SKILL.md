---
name: brazilian-procedural-law
description: Pesquisar e registrar normas brasileiras ao criar ou revisar regras processuais, vigência, meio de comunicação ou exceções jurídicas deste projeto.
---

# Pesquisa normativa

## Ativação e responsabilidades

Use ao introduzir ou alterar fundamento, âmbito, vigência, interpretação ou exceção de uma regra. Produza evidência consultável a partir de fonte primária e separe texto legal, interpretação, ato administrativo e decisão de implementação.

## Procedimento

1. Leia [requisitos](../../../docs/requirements.md) e o [glossário](../../../GLOSSARY.md). Identifique regime, tribunal/localidade, evento e data relevante. O recorte inicial é civil comum, TJSP Capital.
2. Consulte a redação consolidada oficial e, para evento histórico, a versão aplicável. Priorize [Planalto](https://www.planalto.gov.br/), [atos CNJ](https://atos.cnj.jus.br/) e [TJSP](https://www.tjsp.jus.br/). Se acesso ou histórico faltar, registre exatamente a lacuna.
3. Registre dispositivo, URL, órgão, vigência, alterações/revogação, data de consulta e âmbito. Identifique marcos distintos de evento, comunicação, começo, primeiro dia computado e vencimento.
4. Descreva condições/exceções e crie casos de referência vinculados a cada interpretação implementada. Marque a revisão jurídica como pendente até haver responsável habilitado identificado.
5. Atualize `docs/legal/sources/`, `docs/legal/rules/` e `docs/legal/validation-cases/` conforme o artefato. A revisão termina quando cada comportamento proposto está ligado à fonte ou a uma pendência explícita.

## Limites e qualidade

A quantidade de dias não identifica sozinha a regra do ato. Disponibilização, publicação, intimação pessoal e citação eletrônica têm hipóteses próprias. Consulta automatizada não certifica completude, vigência histórica ou revisão jurídica. Suporte futuro exige pesquisa própria antes de aparecer funcionalmente na interface.

## Formato de saída

Ficha com ID/versão, descrição, regime/âmbito, fonte/dispositivo/URL, vigência/alterações, evento/meio, marcos, método, condições, exceções, casos/testes necessários e estado de revisão. Conclua com pendências e impacto no contrato do motor, sem inventar dispositivo ou interpretação para preencher campos.

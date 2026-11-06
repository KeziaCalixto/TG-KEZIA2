# Motor independente e versões preservadas

O cálculo precisa poder ser reproduzido depois que normas e calendários mudarem. Mantemos um motor determinístico sem React, banco, relógio ou rede, alimentado por regras e calendários versionados, e guardamos snapshots usados em cada cálculo; acoplar o cálculo à consulta do calendário atual seria mais simples inicialmente, mas alteraria resultados históricos sem explicação.

Estado: aceito para a primeira fatia. Snapshot preserva evidência de entrada; a correção jurídica e a integridade contra alterações administrativas ainda exigem revisão e controles próprios.

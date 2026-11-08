# Clareza para conferir cada prazo

O **Prazo Claro** é uma aplicação acadêmica para simular a contagem de prazos processuais brasileiros e explicar como se chegou à data estimada. Este portal reúne o manual, as decisões de engenharia, o banco de dados, a operação e os materiais do Trabalho de Graduação II de **Kezia Calixto**, de Análise e Desenvolvimento de Sistemas da **FATEC Campinas**, com orientação do Prof. Eduardo Felipe Fonseca de Freitas.

## Escolha um percurso

| Seu objetivo | Comece por |
| --- | --- |
| Usar a demonstração | [Manual da simulação](../manual/uso.md) |
| Entender a solução | [Concepção e decisões](../engenharia/concepcao.md) |
| Instalar e desenvolver | [Instalação](../../../docs/entrega/instalacao.md) |
| Entender a persistência | [Banco e diagramas](../banco/visao-geral.md) |
| Apresentar o trabalho | [Biblioteca acadêmica](../entrega/biblioteca.md) |
| Conferir o que foi validado | [Estado e evidências](estado.md) |

## O problema e a proposta

Uma data final isolada não explica quais dias entraram na contagem, qual calendário foi aplicado ou quais hipóteses ficaram de fora. O projeto recebe um evento e um perfil de cálculo, seleciona regras e calendários versionados e apresenta marcos, trilha diária, fontes e pendências. O histórico preserva a memória original para consulta posterior, e o usuário pode solicitar um lembrete associado àquela memória.

O motor é determinístico e separado da interface, do banco, da rede e do relógio do sistema. Next.js organiza a aplicação; Supabase fornece identidade e persistência; Vercel hospeda a demonstração; Brevo atende os canais de e-mail. O Docusaurus desta documentação é um site estático separado do aplicativo.

## Escopo acadêmico

Os resultados têm estado **provisório** ou **incompleto**. Calendários parciais e revisão jurídica pendente permanecem identificados. Um resultado incompleto não apresenta vencimento inventado. O projeto não certifica tempestividade em processos reais.

[Abra a demonstração publicada](https://tg-kezia2.vercel.app) ou consulte o [estado documentado da entrega](estado.md). A existência de uma URL não representa uma nova verificação de disponibilidade nesta edição.

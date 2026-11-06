# Estratégia de verificação

As fronteiras públicas vêm do master prompt: motor tipado independente, Route Handler de cálculo e fluxo completo da calculadora. Os testes não acessam métodos privados de contagem. Valores esperados são datas trabalhadas nos casos documentais; fixtures condicionais são identificadas, sem alegação de revisão jurídica profissional.

1. Vitest observa `calculateDeadline(input,calendar)` e `calculateForMvp(input)`: dias úteis, feriados, suspensão inclusiva, saldo preservado, passagem de ano, dados inválidos, meios distintos, cobertura, bloqueios de exceções, proveniência, reprodução e ausência de mutação.
2. fast-check testa invariantes do recorte civil com semente fixa: quantidade computada, último dia igual ao vencimento, datas únicas e vencimento posterior ao evento. Não generaliza esses invariantes para outros regimes.
3. Contratos HTTP exercitam handlers reais para validação, resposta, cache, payload adulterado, estado incompleto, origem e ausência de configuração. Clientes de banco simulados nesses testes não comprovam RLS.
4. Playwright observa formulário → POST → motor → resultado, exportação real de arquivo, alteração das entradas, erros/foco, calendário e navegação, em 1440px e 375px. Axe verifica regras automatizáveis WCAG A/AA nas páginas observadas. Falhas de seletor são distintas de falhas do produto.
5. pgTAP exercita o banco real isolado: propriedade, anônimo, tentativa de inserir/excluir dado de outro usuário, imutabilidade por ausência de UPDATE e catálogo publicado. SQL e Auth só são considerados verificados após execução real.

Não há medição de cobertura, benchmark, teste de carga, teste SUS com participantes ou revisão completa por leitor de tela nesta entrega. Consulte `results.md` para os comandos realmente executados e resultados; configuração de CI não comprova execução no GitHub.

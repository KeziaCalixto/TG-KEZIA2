# E-mails transacionais

Adaptação do MASTER ao HTML de e-mail: azul `#1E3A8A`, CTA âmbar `#B45309`, cartão branco e fundo `#F1F5F9`. Cabeçalhos em Georgia/Times e corpo em Arial/Helvetica, sem carregar fontes externas. O monograma PC é texto decorativo ao lado da marca.

Dois templates independentes para Supabase Auth: convite administrativo e confirmação de cadastro. Compartilham estrutura de 600px, cabeçalho institucional, faixa âmbar, identificação do evento, título, explicação, CTA, orientação, link alternativo e rodapé acadêmico. O texto varia conforme a ação.

Layout por tabelas `role="presentation"` e estilos essenciais inline. O bloco de estilo acrescenta ajustes abaixo de 620px, foco, hover e redução de movimento. Regras web do MASTER que exigem JavaScript, fontes remotas, SVG ou animações não se aplicam ao e-mail. Há fallback condicional para largura/botão no Outlook, sem alegar validação no cliente nativo.

Corpo em 16px/26px, título 36px/42px (30px/36px em telas estreitas), ação com mais de 44px de altura. Link alternativo permite quebra de endereços longos. Preheader oculto traz resumo pertinente na caixa de entrada. A mensagem continua compreensível sem imagens externas ou media queries.

Preservar `{{ .ConfirmationURL }}` nos dois destinos e no texto do link alternativo. Não inserir tokens reais em previews, capturas ou documentação. Capturas em `docs/testing/artifacts/email-*.png` usam endereços fictícios.

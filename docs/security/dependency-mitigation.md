# Mitigação temporária da dependência de lint

Consulta e aplicação: 18/10/2026. **Revisar até 18/11/2026 e antes de qualquer publicação.** Responsabilidade: mantenedor do projeto. Nenhum aviso de outra dependência é aceito por esta decisão.

O audit completo encontrou GHSA-vfj7-8cjw-p6xm / CVE-2026-93687, severidade alta, em `braces@3.0.3`, usado pela cadeia de ferramentas `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch`. A auditoria somente de produção não encontrou alertas conhecidos. O [advisory oficial](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) informa ausência de versão oficial corrigida; a suposta 3.0.4 indicada no texto de uma resposta do audit não existia no registro npm consultado.

O comportamento vulnerável foi reproduzido no pacote original: AST profundamente aninhada provoca `Maximum call stack size exceeded`. O patch local `patches/braces@3.0.3.patch` limita profundidade a 128 no parser (chaves e parênteses) e nos walkers compile, expand e stringify, inclusive quando recebem AST diretamente. Ele é uma mitigação do projeto, não uma correção homologada pelo mantenedor de braces.

`patchedDependencies` e o hash no lockfile tornam a alteração reproduzível. `braces` também foi fixado explicitamente como dependência de desenvolvimento para testar a mitigação. O teste resolve a mesma instância transitiva usada pelo plugin ESLint: antes do patch, cinco casos de proteção falharam; após aplicar, os seis casos passaram (ataques e compatibilidade com globs normais).

O audit identifica versões e não avalia o conteúdo do patch. Por isso, há uma exceção **somente** para esse GHSA em `pnpm-workspace.yaml`, vinculada a esta evidência e aos testes obrigatórios de regressão. A saída “sem alertas” da auditoria filtrada não significa que uma versão upstream corrigida foi publicada. Remover o patch faz os testes de segurança falharem, bloqueando a CI mesmo com a exceção.

Ao surgir correção oficial: revisar fonte, atualizar a dependência/cadeia, retirar patch e exceção e repetir testes/lint/build. Se a mitigação se mostrar insuficiente ou incompatível, bloquear publicação e revisar a ferramenta de lint. O patch não deve ser ampliado silenciosamente a outros advisories.

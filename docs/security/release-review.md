# Revisão técnica da entrega local — 20/10/2026

Referência de organização: [OWASP ASVS 5.0.0](https://asvs.owasp.org/), versão estável conferida nesta data. A tabela é um recorte de controles/evidências do projeto, **sem declaração de conformidade com um nível ASVS**, pentest ou auditoria independente. Não se atribuem IDs de requisitos que não tenham sido individualmente mapeados.

| Tema do recorte | Implementação observada | Evidência / limite |
| --- | --- | --- |
| Validação e codificação | Zod no servidor; payloads limitados; React escapa texto; links de snapshot exigem HTTPS sem credenciais | Testes API/snapshot, entradas inválidas e links executáveis. Não há editor HTML, SQL do usuário ou upload. |
| Autenticação | Supabase Auth, e-mail confirmado, convite validado, OAuth Google PKCE e recuperação PKCE | Integrações locais com fixtures. Google hospedado validado na versão anterior; nova publicação com callbacks/template de recuperação em 20/10. Ensaio externo de recuperação, MFA e controles de abuso operacionais pendentes. |
| Sessão | Adaptador SSR oficial, identidade `getUser` para autorização, respostas privadas `no-store` | Testes de sessão/recarga/logout, código inválido e replay. Logout/exclusão não implica revogação instantânea universal de JWT. |
| Autorização | Owner no servidor e RLS; SELECT/INSERT/DELETE próprios; sem UPDATE nem edição de catálogo por usuário | 28 pgTAP e duas identidades reais locais; tentativa anônima e acesso cruzado. Não existe modelo de organizações nesta entrega. |
| CSRF e redirecionamento | Mutações exigem Origin exata; callbacks fixos; destinos externos recusados | Testes de Auth/history/recovery/OAuth e origem local. Sem CORS permissivo. |
| Segurança do navegador | `nosniff`, frame denial, política de referências, permissões restritas e CSP parcial | Teste HTTP real dos headers. CSP não restringe todos os scripts e não é alegada como proteção completa contra XSS. |
| Proteção de dados | Sem dados de partes/processos necessários; snapshots privados identificados; política real descrita em Privacidade | Exportação individual e exclusão confirmada. Retenção automática, atendimento administrativo e backups exigem responsável/decisão operacional. |
| Dependências | Versões fixadas, lockfile, patch de braces e seis regressões de segurança | Audit exit 0 com um advisory alto especificamente ignorado/mitigado. Não significa ausência de vulnerabilidades. Revisão até 18/11/2026 e antes de publicar. |
| Logs e falhas | Erros genéricos; helpers autenticados sem capturas/traces/token URLs; fixtures locais e limpeza | Logs hospedados e alertas não foram implantados nesta finalização. Artefatos públicos de UI usam dados controlados. |

Fontes e procedimentos de operação estão em [operacao.md](../entrega/operacao.md). Evidências da verificação final em [final-delivery.md](../testing/final-delivery.md). Testes de segurança cobrem os cenários descritos, não todas as classes de ataque.

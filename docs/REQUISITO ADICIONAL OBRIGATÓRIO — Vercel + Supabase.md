# REQUISITO ADICIONAL OBRIGATÓRIO — Vercel + Supabase

Este projeto utilizará obrigatoriamente **Vercel para hospedagem e deploy** e **Supabase como plataforma de backend gerenciado**.

Essas integrações são decisões arquiteturais já estabelecidas, não alternativas a avaliar.

## 1. Integração com Supabase

Documentação oficial: https://supabase.com/docs

Utilizar:

- Supabase PostgreSQL como banco principal.
- Supabase Auth para autenticação e gerenciamento de usuários.
- Supabase Row Level Security (RLS) para isolamento de dados.
- Supabase Storage para arquivos, quando necessário.
- Supabase CLI para desenvolvimento local e migrations.
- `@supabase/supabase-js` e `@supabase/ssr` para integração com Next.js.
- Supabase Realtime apenas quando houver necessidade concreta.
- Supabase Edge Functions apenas quando houver justificativa arquitetural.

### Banco de dados

Criar migrations versionadas para as entidades jurídicas e de aplicação.

Organizar:

- Usuários e perfis
- Organizações
- Tribunais
- Unidades judiciais
- Calendários forenses
- Eventos de calendário
- Fontes jurídicas
- Regras jurídicas versionadas
- Processos cadastrados
- Cálculos realizados
- Memórias de cálculo
- Registros de auditoria

Projetar índices, integridade referencial, constraints e políticas de segurança.

### Segurança

- Ativar RLS em todas as tabelas expostas pela API.
- Aplicar políticas de acesso por usuário e organização.
- Testar acessos não autorizados.
- Nunca expor `service_role` ou secret keys no navegador.
- Usar chaves publicáveis apenas nos contextos permitidos.
- Verificar sessões no servidor.
- Armazenar papéis e permissões em dados não editáveis pelo usuário.
- Proteger arquivos privados com políticas apropriadas.
- Não confiar exclusivamente em verificações de autorização no frontend.
- Executar verificações de segurança do banco antes do deploy.

### Desenvolvimento local

Configurar o ambiente de desenvolvimento com Supabase CLI.

Criar migrations reproduzíveis e dados de teste separados dos dados de produção.

Validar as migrations em um ambiente isolado antes de aplicá-las em produção.

Não criar nem modificar recursos remotos sem identificar o projeto e o ambiente de destino.

## 2. Integração com Vercel

Documentação oficial: https://vercel.com/docs

Utilizar Vercel como plataforma principal de hospedagem do Next.js.

Configurar:

- Projeto Vercel
- Integração GitHub
- Preview Deployments
- Ambiente de produção
- Variáveis de ambiente
- Build otimizado
- Observabilidade
- Tratamento de erros
- Monitoramento de execução

Manter desenvolvimento, preview e produção isolados.

### Integração Vercel + Supabase

Configurar a comunicação segura entre Next.js e Supabase.

Utilizar as variáveis apropriadas à versão atual dos SDKs, incluindo, quando aplicável:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Credenciais privilegiadas devem permanecer exclusivamente no servidor e somente existir quando estritamente necessárias.

Não armazenar secrets no repositório.

Não imprimir credenciais em logs, respostas ou artefatos.

Usar os recursos oficiais de integração entre Vercel e Supabase quando forem compatíveis com a arquitetura.

## 3. CI/CD

Implementar pipeline com GitHub Actions e Vercel.

Etapas obrigatórias:

1. Verificação de tipos.
2. Lint.
3. Testes unitários.
4. Testes do motor jurídico.
5. Testes de integração.
6. Auditoria de dependências.
7. Build.
8. Testes E2E.
9. Verificação de migrations.
10. Aprovação e deploy.

Configurar previews para pull requests.

Produção somente poderá receber versões aprovadas e testadas.

Evitar deploys de produção quando houver falhas críticas.

Executar migrations com procedimentos seguros, considerando compatibilidade com versões anteriores e rollback da aplicação.

## 4. Arquitetura do motor de cálculo

O motor jurídico deve permanecer independente do Supabase e da Vercel.

Organizar responsabilidades:

- Motor de cálculo: regras jurídicas determinísticas.
- Supabase: persistência, autenticação e dados versionados.
- Next.js: interface e endpoints da aplicação.
- Vercel: execução, hospedagem e distribuição.

O motor deve funcionar integralmente em testes locais sem conexão com Supabase.

## 5. Skills e documentação

Além das skills anteriormente definidas, utilize instruções especializadas para:

- Integração Supabase com Next.js
- Supabase Auth e SSR
- PostgreSQL e RLS
- Supabase migrations
- Deployments Vercel
- Segurança de variáveis de ambiente
- CI/CD com GitHub Actions
- Monitoramento e diagnóstico de produção

Verifique as versões atuais das bibliotecas e as documentações oficiais antes da implementação.

## 6. Critérios de aceitação

A integração estará concluída somente quando:

- Next.js estiver conectado ao Supabase.
- Autenticação funcionar.
- RLS estiver implementado e testado.
- Migrations forem reproduzíveis.
- Os cálculos puderem ser armazenados e consultados.
- Um usuário não conseguir acessar dados privados de outro.
- Os ambientes estiverem isolados.
- O projeto compilar na Vercel.
- O pipeline de CI executar com sucesso.
- Os deployments de preview forem testáveis.
- A produção estiver protegida contra mudanças não verificadas.

Não declarar integração concluída apenas porque as variáveis de ambiente foram configuradas.

**Prioridade: segurança dos dados jurídicos, integridade do banco, precisão dos cálculos e confiabilidade dos deployments.**
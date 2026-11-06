# Supabase Data API e RLS na primeira fatia

Vercel e Supabase são requisitos estabelecidos. Adotamos `supabase-js` e `@supabase/ssr`, migrations SQL e acesso à Data API sob identidade de usuário, adiando o Drizzle inicialmente previsto no master prompt: isso concentra autorização na RLS sem acrescentar uma conexão SQL com contexto de identidade a manter. PostgreSQL permanece o banco principal.

Estado: aceito para o MVP. Reavaliar Drizzle quando consultas complexas, operações transacionais ou serviços internos justificarem acesso direto; a revisão deve demonstrar propagação de identidade, políticas e testes equivalentes de isolamento. A ausência de ORM não dispensa constraints, integridade, índices ou migrations reproduzíveis.

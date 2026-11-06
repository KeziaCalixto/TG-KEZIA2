# Login com Google

Fluxo: botão **Continuar com Google** → `POST /api/auth/google` → Supabase Auth → Google → callback do Supabase → `/auth/callback` da aplicação → sessão do usuário. O Supabase concentra o cadastro e a sessão; a aplicação continua autorizando histórico por usuário verificado e RLS.

## Google Cloud: configuração manual

1. Abra [Google Auth Platform](https://console.cloud.google.com/auth/overview) e selecione/crie o projeto do Prazo Claro.
2. Configure **Branding** com nome do aplicativo e e-mails de suporte/contato do responsável. Em **Audience/Público-alvo**, escolha **External/Externo** para contas fora de uma organização Google Workspace. Enquanto estiver em teste, cadastre as contas Google da equipe e dos avaliadores como usuários de teste.
3. Em **Data Access/Acesso a dados**, use somente identidade básica: `openid`, e-mail e perfil. Não solicite Gmail, Drive ou permissões adicionais.
4. Em **Clients/Clientes → Create client/Criar cliente**, escolha **Web application/Aplicativo da Web**, nome `Prazo Claro Web`.
5. Em **Authorized JavaScript origins/Origens JavaScript autorizadas**, adicione as duas origens, sem caminhos:

   ```text
   https://tg-kezia2.vercel.app
   https://tg-kezia2-eduwillls-projects.vercel.app
   ```

6. Em **Authorized redirect URIs/URIs de redirecionamento autorizados**, adicione o callback do **Supabase**:

   ```text
   https://yjukuzgowqtkxvhozhbm.supabase.co/auth/v1/callback
   ```

7. Crie o cliente e preencha o Client ID e o Client Secret diretamente no painel Supabase abaixo. Não copie o segredo para o chat, código, Git ou variáveis públicas da Vercel.

## Supabase hospedado

Em [Authentication → Sign In / Providers → Google](https://supabase.com/dashboard/project/yjukuzgowqtkxvhozhbm/auth/providers?provider=Google), habilite o provedor, informe Client ID/Client Secret e salve. Preserve a verificação de nonce e a exigência de e-mail; esta implementação usa o fluxo OAuth Web pelo servidor.

Em [URL Configuration](https://supabase.com/dashboard/project/yjukuzgowqtkxvhozhbm/auth/url-configuration), os callbacks permitidos da **aplicação** são:

```text
https://tg-kezia2.vercel.app/auth/callback
https://tg-kezia2-eduwillls-projects.vercel.app/auth/callback
```

O callback cadastrado no Google é diferente dos callbacks finais da aplicação. O código escolhe o callback da mesma origem em que o usuário clicou; Site URL continua sendo o padrão quando um fluxo não informa destino.

Nenhuma variável nova nem Client Secret é necessário na Vercel. O projeto já usa URL/chave publicável Supabase. Não publique dados de teste como dados reais nem anuncie o login integrado antes de concluir o teste real.

## Local

O fluxo local pode ser verificado sem habilitar Google até a geração da URL e do cookie PKCE, sem seguir o redirecionamento ao provedor. Para um teste real local independente, configure um cliente de desenvolvimento com origem `http://127.0.0.1:3000`, callback Google `http://127.0.0.1:54321/auth/v1/callback` e provedor Google na stack local conforme [documentação oficial](https://supabase.com/docs/guides/auth/social-login/auth-google#local-development). Segredo local deve usar substituição de variável de ambiente, nunca texto literal no TOML. Não substitua `.env.local` pelo projeto hospedado para simular isolamento local.

## Aceite

- Entrar com uma conta Google de teste e retornar à mesma origem do aplicativo.
- Confirmar indicador Conectado, recarga, histórico privado e logout.
- Cancelar a autorização e verificar mensagem genérica acessível.
- Repetir cadastro por e-mail e aceitação de convite sem regressão.
- Confirmar identidade/histórico ao usar e-mail já existente; não mesclar registros por e-mail no aplicativo.

Credenciais, consentimento real e teste Google dependem do responsável pelas contas. [Evidências técnicas](testing/google-login.md) distinguem testes automatizados do acesso real.

Referências: [Supabase Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [OAuth Web Google](https://developers.google.com/identity/protocols/oauth2/web-server), [marca e origem do ícone](https://developers.google.com/identity/branding-guidelines). O ícone `public/google-g.png` foi obtido do recurso oficial vinculado nesse guia; nenhuma biblioteca Google de rastreamento foi adicionada à página.

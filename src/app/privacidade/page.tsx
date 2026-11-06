import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = { title: "Privacidade" };
export default function PrivacyPage() {
  return (
    <AppShell active="/privacidade">
      <div className="page-heading">
        <div>
          <p className="eyebrow">TRANSPARÊNCIA SOBRE DADOS</p>
          <h1>Privacidade e seus registros.</h1>
          <p className="page-description">
            Informações sobre a versão acadêmica · atualizadas em 23/10/2026.
          </p>
        </div>
      </div>
      <article className="content-card document-page">
        <h2>Calcular sem conta</h2>
        <p>
          A calculadora envia ao servidor o contexto, a comarca, a data e a
          quantidade de dias para produzir a memória. Esse cálculo não é gravado
          no histórico automaticamente. Você não precisa informar nome de parte,
          CPF, documento ou número de processo.
        </p>
        <h2>Conta e cálculos salvos</h2>
        <p>
          A autenticação é gerenciada pelo Supabase. São tratados e-mail,
          identidade de acesso e dados de sessão. Senhas são enviadas ao serviço
          de autenticação e não aparecem nas memórias ou nas respostas do
          aplicativo. Se você escolher Google, o provedor também participa da
          autenticação e o Supabase pode receber dados do perfil; o aplicativo
          usa a identidade e o e-mail para o acesso.
        </p>
        <p>
          Ao salvar, armazenamos título opcional, entrada do cálculo, resultado,
          memória, fontes, calendário, versões, data de criação e vínculo com a
          sua conta. Cada usuário acessa seu próprio histórico. O responsável
          técnico pela instalação pode administrar o banco; a área privada não é
          uma garantia de sigilo contra o administrador do serviço.
        </p>
        <h2>Lembretes opcionais</h2>
        <p>
          Se você ativar um lembrete, armazenamos o vínculo com o cálculo e a
          conta, vencimento e versões originais, antecedência, horário, fuso e
          modo de entrega e estado das tentativas. O destinatário é o e-mail
          confirmado atual da própria conta, conferido antes do envio. A
          mensagem contém data estimada, identificação curta e link privado; não
          inclui o título livre do cálculo nem senha ou token de sessão.
        </p>
        <p>
          A interface identifica se o lembrete fica no Mailpit local ou se você
          está solicitando envio real. Quando o envio externo está habilitado, o
          Brevo recebe o endereço confirmado e o conteúdo mínimo da mensagem.
          Você pode cancelar lembretes ativos no histórico. A exclusão do
          cálculo ou da conta remove os lembretes associados; cancelar não apaga
          mensagens que já foram aceitas pela caixa de testes ou pelo provedor,
          e um envio em curso pode ainda ser aceito. A exclusão do cálculo não
          recolhe mensagens já encaminhadas. Cópias locais ficam no Mailpit até
          sua remoção pelo responsável; mensagens externas e registros do
          provedor seguem as configurações do serviço e as cópias mantidas pelo
          destinatário.
        </p>
        <h2>Cookies e serviços utilizados</h2>
        <p>
          Cookies necessários mantêm e renovam a sessão. Não há ferramenta de
          publicidade, rastreamento analítico ou envio de cálculos para uma
          ferramenta de IA instalada neste aplicativo.
        </p>
        <p>
          Na execução local, o app e o Supabase usam o computador do responsável
          e o Mailpit recebe os e-mails de teste. Na instalação hospedada,
          Vercel hospeda o aplicativo, Supabase fornece autenticação e banco e o
          SMTP configurado, atualmente Brevo, entrega e-mails de acesso. Esses
          serviços podem manter registros técnicos conforme a configuração e
          suas políticas.
        </p>
        <h2>Conservação, exportação e exclusão</h2>
        <p>
          Não existe expiração automática dos cálculos nesta versão. O registro
          permanece até sua exclusão ou remoção administrativa. O{" "}
          <Link href="/historico">histórico</Link> permite filtrar por regime,
          navegar pelos cálculos em páginas de até 50 registros, exportar cada
          memória original e excluir um registro após confirmação.
        </p>
        <p>
          A exclusão remove o registro ativo. Ela não apaga arquivos que você já
          baixou nem garante remoção imediata de cópias de backup e registros
          técnicos dos provedores. A política operacional dessas cópias precisa
          ser definida pelo responsável antes de ampliar o uso da instalação.
        </p>
        <p>
          A exclusão integral da conta é administrativa nesta versão. Solicite
          ao responsável que lhe forneceu acesso, sem enviar senha ou código de
          confirmação. Ele deve verificar a identidade, tratar sessões e
          registros e confirmar o atendimento. Não há formulário automático de
          exclusão de conta no aplicativo.
        </p>
        <h2>Uso de dados de demonstração</h2>
        <p>
          Use dados fictícios na avaliação acadêmica. Evite informações pessoais
          ou processuais reais nos títulos e registros. Antes de compartilhar
          uma exportação ou impressão, confira o conteúdo. As regras e o
          calendário permanecem com revisão jurídica pendente.
        </p>
        <p>
          <Link href="/ajuda">Voltar ao guia de uso</Link> ·{" "}
          <Link href="/entrar">Acessar minha conta</Link>
        </p>
      </article>
    </AppShell>
  );
}

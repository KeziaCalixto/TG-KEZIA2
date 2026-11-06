import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = { title: "Ajuda" };
export default function HelpPage() {
  return (
    <AppShell active="/ajuda">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GUIA DE USO</p>
          <h1>Como usar o Prazo Claro.</h1>
          <p className="page-description">
            Um roteiro para calcular, conferir e guardar sua memória de cálculo.
          </p>
        </div>
      </div>
      <article className="content-card document-page">
        <h2>1. Escolha o contexto</h2>
        <p>
          Os perfis civil comum e criminal oferecem dez comarcas do TJSP. O
          trabalhista cobre somente TRT-2, São Paulo Capital. Os calendários são
          parciais: TJSP em 2026 e TRT-2 Capital em 2026–2027, com precisão de
          município sede. Não certificam todas as suspensões de cada foro ou
          vara.
        </p>
        <p>
          Nos novos perfis, confira o contexto e confirme expressamente o
          procedimento comum descrito no formulário. Exceções ou contexto
          desconhecido produzem resultado incompleto. No criminal, o primeiro
          dia computado é útil; depois a contagem é contínua, com suspensão
          aplicável e eventual prorrogação do fim nominal. Não calcula prazo
          penal material.
        </p>
        <p>
          <Link href="/calendario">Confira o calendário da comarca</Link> antes
          de interpretar o resultado. No calendário, o ano 2027 aparece somente
          no trabalhista. A memória de uma travessia trabalhista identifica as
          duas versões anuais. Outras comarcas, TJSP 2027 e datas de 2028 ainda
          não estão cobertos.
        </p>
        <h2>2. Identifique a data que você possui</h2>
        <p>
          Selecione publicação ou disponibilização no DJEN. São eventos
          diferentes: a disponibilização ainda exige determinar a data
          considerada para publicação. O suporte dos autos, físico ou
          eletrônico, é outra informação.
        </p>
        <p>
          Citação, intimação pessoal, prazo em dobro e outros procedimentos não
          são calculados nesta versão.{" "}
          <Link href="/base-normativa">Consulte os critérios e fontes</Link>.
        </p>
        <p>
          Em <strong>Ato processual</strong>, escolha quantidade manual ou um
          dos atos do catálogo inicial: apelação civil (15 úteis), recurso
          ordinário contra decisão de Vara do Trabalho (8 úteis) ou declaração
          da sentença penal (2 processuais, com curso contínuo após início
          útil). Leia as condições e exclusões antes de confirmar o
          enquadramento; dúvidas deixam o resultado incompleto. No modo manual,
          você informa e confere a duração legal.
        </p>
        <p>
          Sentença comunicada em audiência ou ciência anterior pode ter outro
          marco. O ato criminal exige defesa de réu solto com advogado
          constituído e sentença de primeiro grau; acórdãos e comunicação
          pessoal estão fora dessa seleção. Trocar o regime ou escolher outro
          ato exige nova confirmação. A memória salva guarda o ato, sua versão,
          fontes e a declaração feita, sem certificar seu cabimento.
        </p>
        <h2>3. Confira o resultado</h2>
        <p>
          <strong>Simulação · revisão pendente:</strong> há uma estimativa nas
          premissas e na cobertura cadastradas. Ela não é uma validação jurídica
          do prazo.
        </p>
        <p>
          <strong>Dados insuficientes:</strong> falta cobertura ou existe uma
          exceção ainda não modelada. Nenhum vencimento é emitido. Leia a
          pendência; mudar a data apenas para obter um resultado não resolve a
          lacuna.
        </p>
        <p>
          A memória mostra as datas computadas e excluídas. As referências
          numeradas levam às fontes. A regra, o calendário, a cobertura e as
          versões acompanham o resultado.
        </p>
        <h2>4. Exporte, imprima ou salve</h2>
        <p>
          Use <strong>Exportar memória</strong> para baixar o arquivo JSON
          completo, inclusive quando o cálculo estiver incompleto. Use o ícone
          de impressão para imprimir ou escolher Salvar como PDF no navegador.
        </p>
        <p>
          Para guardar uma simulação no histórico, entre na conta, preencha um
          título opcional e use o botão Salvar no resultado. Evite nomes de
          partes, documentos ou números de processos reais. Cálculos incompletos
          podem ser exportados, mas não são salvos no histórico.
        </p>
        <h2>5. Acesse a conta e o histórico</h2>
        <p>
          Você pode cadastrar e confirmar seu e-mail, aceitar um convite e
          definir a senha, ou continuar com Google quando o provedor estiver
          habilitado na instalação. A confirmação e a recuperação por e-mail
          devem ser abertas no mesmo navegador em que foram solicitadas. Se
          esquecer a senha, use{" "}
          <Link href="/conta/recuperar-senha">Recuperar senha</Link>.
        </p>
        <p>
          No <Link href="/historico">histórico</Link>, busque por título,
          comarca ou data entre os registros da página exibida. Use o filtro por
          regime para consultar todo o ramo, navegue pelas páginas e escolha 10,
          20 ou 50 registros por página. Ver memória original apresenta os dados
          como foram salvos, sem substituir pela versão atual do calendário.
          Registro não verificado não equivale a certificado de autenticidade ou
          revisão jurídica.
        </p>
        <p>
          Futuro, vence hoje e vencido comparam a data original estimada com a
          referência exibida em America/Sao_Paulo. Não indicam cumprimento do
          ato. Memória incompleta ou ilegível aparece sem vencimento definido.
          Use Atualizar histórico para consultar mudanças; voltar o foco à
          janela também atualiza a lista, sem modificar as memórias salvas.
        </p>
        <p>
          Exporte a memória antes de excluir se quiser guardar uma cópia. A
          exclusão requer confirmação e remove o registro da conta; um arquivo
          que você já baixou continua no seu computador.
        </p>
        <h2>6. Lembretes opcionais por e-mail</h2>
        <p>
          Quando habilitados na instalação, os lembretes aparecem em cada
          cálculo salvo elegível. Escolha 3 dias antes, 1 dia antes ou no dia,
          às 09h, 12h ou 18h em America/Sao_Paulo. A antecedência usa dias
          corridos e não altera a contagem processual. Confirme a escolha antes
          de ativar; é necessário ter e-mail confirmado e horário ainda futuro.
        </p>
        <p>
          A tela informa o destino antes de ativar: caixa local de testes ou
          e-mail confirmado da sua conta. No modo local, as mensagens ficam no
          Mailpit e dependem do serviço local ativo. O envio externo depende da
          configuração do serviço de e-mail e do agendador da instalação. O
          aviso usa a memória original estimada, sem atualizar silenciosamente
          versões. O link exige a conta proprietária; se precisar entrar, reabra
          o link após o login.
        </p>
        <p>
          Você pode cancelar um lembrete ou confirmar o cancelamento de todos os
          ativos, inclusive em outras páginas. Um envio já em curso pode ainda
          ser aceito. Aceito pelo serviço de e-mail não significa entrega
          confirmada; envio incerto exige conferir a caixa antes de cancelar e
          reagendar. Uma janela de envio perdida não gera avisos retroativos ao
          religar o serviço.
        </p>
        <h2>Uso acadêmico</h2>
        <p>
          Este é um demonstrador acadêmico. Para apresentar o projeto, use dados
          fictícios e explique as limitações. Testes técnicos não substituem a
          revisão de um profissional do Direito.
        </p>
        <p>
          <Link href="/">Abrir a calculadora</Link> ·{" "}
          <Link href="/privacidade">Informações de privacidade</Link>
        </p>
      </article>
    </AppShell>
  );
}

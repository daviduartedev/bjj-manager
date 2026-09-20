import type { Metadata } from "next";

import { MarketingLegalLayout } from "@/components/marketing/marketing-legal-layout";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de Privacidade do Casca, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <MarketingLegalLayout title="Política de Privacidade" updated="19 de setembro de 2026">
      <p>
        Esta política descreve como o Casca, produto da Utopia, trata dados pessoais no contexto da gestão de academias de jiu-jitsu, em linha com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>

      <h2>Quem controla os dados</h2>
      <p>
        A academia que usa o Casca é, em regra, a controladora dos dados dos seus alunos, responsáveis e colaboradores. A Utopia trata esses dados como operadora, para prestar o software, na medida das instruções da academia e da operação técnica da plataforma.
      </p>

      <h2>Que dados entram no Casca</h2>
      <ul>
        <li>Dados de conta: nome, e-mail e credenciais de acesso da equipe.</li>
        <li>Dados de alunos: identificação, contato, faixa, grau, histórico de graduação, plano e situação de mensalidade.</li>
        <li>Dados técnicos: registos de sessão, segurança e diagnóstico necessários para manter o serviço.</li>
      </ul>

      <h2>Para que servem</h2>
      <p>
        Operar o cadastro da escola, a graduação, o financeiro do mês e o painel. Cumprir obrigações legais. Proteger a conta contra acesso indevido. Melhorar a estabilidade do sistema.
      </p>

      <h2>Partilha</h2>
      <p>
        Não vendemos dados. Infraestrutura de hospedagem e autenticação (incluindo o fornecedor de base de dados) pode processar dados na medida estritamente necessária à prestação do serviço. Cada academia não vê dados de outra academia.
      </p>

      <h2>Conservação e direitos</h2>
      <p>
        Os dados permanecem enquanto a conta da academia estiver ativa e pelo prazo adicional exigido por lei. Titulares podem solicitar acesso, correção, eliminação e informação sobre o tratamento junto da academia controladora e, quando aplicável, junto da Utopia em utopia.app.br.
      </p>

      <h2>Segurança</h2>
      <p>
        O acesso é autenticado. Políticas de isolamento por academia restringem a leitura e a escrita aos dados da própria escola. Nenhum sistema é isento de risco. Comunicamos incidentes relevantes nos termos da LGPD.
      </p>

      <h2>Alterações</h2>
      <p>
        Esta política pode ser atualizada. A versão vigente fica nesta página.
      </p>
    </MarketingLegalLayout>
  );
}

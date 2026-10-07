import type { Metadata } from "next";

import { MarketingLegalLayout } from "@/components/marketing/marketing-legal-layout";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos de Uso do Casca, software de gestão para academias de jiu-jitsu.",
};

export default function TermosPage() {
  return (
    <MarketingLegalLayout title="Termos de Uso" updated="19 de setembro de 2026">
      <p>
        Estes Termos regulam o uso do Casca, produto de software da Utopia (utopia.app.br) para gestão de academias de jiu-jitsu. Ao entrar na plataforma, a academia e os utilizadores autorizados aceitam estas regras.
      </p>

      <h2>O que o Casca oferece</h2>
      <p>
        O Casca é um sistema web para cadastro de alunos, registro de graduações, acompanhamento de mensalidades e painel operacional da academia. O acesso é autenticado. Cada academia opera no seu espaço isolado.
      </p>

      <h2>Conta e responsabilidades</h2>
      <p>
        O acesso é pessoal e intransmissível. A academia é responsável por guardar as credenciais, pelos dados que insere e pela conformidade da operação com a legislação aplicável, incluindo regras de proteção de dados de alunos e responsáveis.
      </p>
      <p>
        O Casca não substitui assessoria jurídica, contabilística ou desportiva. Status de mensalidade e registros de graduação são lançados pela própria escola.
      </p>

      <h2>Pagamentos no produto</h2>
      <p>
        O Casca não processa cobrança automática nem opera como gateway. Confirmar um pagamento no sistema documenta a operação da academia. Não constitui liquidação bancária.
      </p>

      <h2>Disponibilidade</h2>
      <p>
        O serviço pode ser interrompido para manutenção, falha técnica ou motivo de força maior. A Utopia esforça-se por manter o sistema disponível, sem garantir funcionamento ininterrupto.
      </p>

      <h2>Propriedade</h2>
      <p>
        Marca, interface e código do Casca pertencem à Utopia. Os dados cadastrais da academia e dos alunos pertencem à academia responsável pela conta.
      </p>

      <h2>Alterações e contato</h2>
      <p>
        Estes Termos podem ser atualizados. A versão vigente fica nesta página. Dúvidas: utopia.app.br.
      </p>
    </MarketingLegalLayout>
  );
}

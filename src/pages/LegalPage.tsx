import { Separator } from "@/components/ui/separator";

const LegalPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-playfair font-bold text-center mb-12">Política de Privacidade & Termos de Serviço</h1>
      
      {/* Política de Privacidade */}
      <section className="mb-12">
        <h2 className="text-2xl font-playfair font-bold mb-6 text-barber-gold">Política de Privacidade</h2>
        
        <div className="space-y-6 text-gray-700">
          <p>
            A Studio53 valoriza a privacidade dos seus clientes e compromete-se a proteger os dados pessoais recolhidos através dos nossos serviços.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3">1. Dados Recolhidos</h3>
          <p>Recolhemos os seguintes dados pessoais:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nome completo</li>
            <li>Endereço de e-mail</li>
            <li>Número de telefone</li>
            <li>Histórico de agendamentos</li>
            <li>Preferências de serviço</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2. Utilização dos Dados</h3>
          <p>Os seus dados são utilizados para:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Processar agendamentos</li>
            <li>Enviar confirmações de marcação</li>
            <li>Comunicar alterações de horários</li>
            <li>Melhorar os nossos serviços</li>
            <li>Enviar promoções e novidades (mediante o seu consentimento)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3. Proteção de Dados</h3>
          <p>
            Implementamos medidas de segurança técnicas e organizacionais para proteger os seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Termos de Serviço */}
      <section>
        <h2 className="text-2xl font-playfair font-bold mb-6 text-barber-gold">Termos de Serviço</h2>
        
        <div className="space-y-6 text-gray-700">
          <h3 className="text-xl font-semibold mt-6 mb-3">1. Agendamentos</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Os agendamentos devem ser feitos com antecedência mínima de 1 hora</li>
            <li>Cancelamentos devem ser realizados com no mínimo 2 horas de antecedência</li>
            <li>Em caso de atraso superior a 15 minutos, o atendimento estará sujeito à disponibilidade</li>
            <li>O não comparecimento sem aviso prévio pode resultar em restrições para futuros agendamentos</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2. Pagamentos</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Aceitamos pagamentos em dinheiro e cartão</li>
            <li>Os preços podem ser alterados sem aviso prévio</li>
            <li>Promoções e descontos não são cumulativos</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3. Responsabilidades</h3>
          <p>
            A Studio53 compromete-se a fornecer serviços de alta qualidade em um ambiente limpo e profissional. No entanto, não nos responsabilizamos por:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Reações alérgicas a produtos utilizados</li>
            <li>Insatisfação com o resultado quando de acordo com o solicitado</li>
            <li>Objetos pessoais deixados no estabelecimento</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">4. Conduta</h3>
          <p>
            Reservamo-nos o direito de recusar atendimento a clientes que apresentem comportamento inadequado, incluindo, mas não se limitando a:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Conduta agressiva ou desrespeitosa</li>
            <li>Estado de embriaguez</li>
            <li>Descumprimento das normas de higiene e segurança</li>
          </ul>
        </div>
      </section>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>Última atualização: {new Date().toLocaleDateString()}</p>
        <p>Para dúvidas ou esclarecimentos, entre em contato através do e-mail: info@studio53.com</p>
      </div>
    </div>
  );
};

export default LegalPage; 
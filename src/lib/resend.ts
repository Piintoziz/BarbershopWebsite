import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Nome da barbearia para os emails
const shopName = 'STUDIO53';

/**
 * Gera o HTML para o email de confirmação de agendamento
 */
export const generateBookingConfirmationEmail = (
  clientName: string,
  serviceName: string,
  barberName: string,
  appointmentDate: string,
  startTime: string,
  endTime: string
) => {
  // Formatar a data para exibição amigável
  const formattedDate = format(new Date(appointmentDate), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmação de Agendamento - ${shopName}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
        }
        .header { 
          background-color: #111111; 
          padding: 20px; 
          text-align: center;
          color: white;
        }
        .logo {
          color: #D4AF37;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .content { 
          padding: 20px; 
          background-color: #f9f9f9;
        }
        .booking-details {
          background-color: white;
          border: 1px solid #eee;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .booking-detail {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .booking-detail:last-child {
          border-bottom: none;
        }
        .footer { 
          text-align: center; 
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          background-color: #D4AF37;
          color: black;
          padding: 10px 20px;
          margin: 20px 0;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">${shopName}</h1>
        </div>
        <div class="content">
          <h2>Agendamento Confirmado!</h2>
          <p>Olá, ${clientName}!</p>
          <p>O seu agendamento na ${shopName} foi confirmado com sucesso. Abaixo estão os detalhes:</p>
          
          <div class="booking-details">
            <div class="booking-detail">
              <strong>Serviço:</strong> ${serviceName}
            </div>
            <div class="booking-detail">
              <strong>Barbeiro:</strong> ${barberName}
            </div>
            <div class="booking-detail">
              <strong>Data:</strong> ${formattedDate}
            </div>
            <div class="booking-detail">
              <strong>Horário:</strong> ${startTime} - ${endTime}
            </div>
          </div>
          
          <p>Em caso de qualquer dúvida ou necessidade de reagendamento, por favor entre em contato conosco.</p>
          
          <a href="#" class="button">Gerenciar Agendamento</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${shopName} - Todos os direitos reservados.</p>
          <p>Rua Principal, 123 - Lisboa</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Envia um email usando a função do Netlify
 * @param to Email do destinatário
 * @param subject Assunto do email
 * @param html Corpo do email em HTML
 * @param cc Emails CC (opcional)
 * @param bcc Emails BCC (opcional)
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  cc?: string[],
  bcc?: string[]
) => {
  try {
    console.log(`Iniciando envio de email para: ${to}`);
    console.log('Dados do email:', { subject, cc, bcc });
    
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        cc,
        bcc
      })
    });

    console.log('Resposta recebida:', response.status);
    const data = await response.json();
    console.log('Dados da resposta:', data);

    if (!response.ok) {
      const errorMessage = data.error || 'Erro desconhecido ao enviar email';
      console.error('Erro ao enviar email:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('Email enviado com sucesso:', data);
    return { data };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

/**
 * IMPORTANTE: PARA USAR UM DOMÍNIO PERSONALIZADO COM O RESEND
 * 
 * 1. Registre-se em https://resend.com
 * 2. Adicione seu domínio (por exemplo, studio53.pt)
 * 3. Siga as instruções para verificar seu domínio
 * 4. Uma vez verificado, você pode usar emails como "agendamentos@studio53.pt"
 * 
 * Caso contrário, você pode usar o domínio gratuito "resend.dev", 
 * que é limitado a 100 emails/dia e só pode enviar para seu próprio email
 * durante o período de testes.
 */ 
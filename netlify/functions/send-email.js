const { Resend } = require('resend');

exports.handler = async (event) => {
  // Configuração de CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responde a requisições OPTIONS (pre-flight CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Só aceita POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    console.log('Recebendo requisição de envio de email');
    
    const { to, subject, html, cc, bcc } = JSON.parse(event.body);
    console.log('Dados recebidos:', { to, subject, cc, bcc });

    // Validação básica
    if (!to || !subject || !html) {
      console.error('Campos obrigatórios faltando:', { to, subject, html: !!html });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Verifica se a API key está presente
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY não encontrada nas variáveis de ambiente');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing RESEND_API_KEY' })
      };
    }

    console.log('Inicializando Resend com API key');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Prepara os dados do email
    const emailData = {
      from: 'STUDIO53 <no-reply@studio53.pt>',
      to: [to],
      subject,
      html,
      ...(cc && { cc }),
      ...(bcc && { bcc })
    };
    console.log('Dados do email preparados:', emailData);

    // Envia o email
    console.log('Enviando email via Resend...');
    const result = await resend.emails.send(emailData);
    console.log('Resposta do Resend:', result);

    if (result.error) {
      console.error('Erro retornado pelo Resend:', result.error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: result.error.message || 'Failed to send email' })
      };
    }

    console.log('Email enviado com sucesso');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data: result })
    };
  } catch (err) {
    console.error('Erro inesperado:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' })
    };
  }
}; 
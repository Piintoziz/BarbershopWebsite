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
    const { to, subject, html, cc, bcc } = JSON.parse(event.body);

    // Validação básica
    if (!to || !subject || !html) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Inicializa o Resend com a API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Envia o email
    const { error } = await resend.emails.send({
      from: 'STUDIO53 <no-reply@studio53.pt>',
      to: [to],
      subject,
      html,
      ...(cc && { cc }),
      ...(bcc && { bcc })
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to send email' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Erro inesperado:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 
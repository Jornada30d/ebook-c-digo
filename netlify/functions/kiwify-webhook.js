const fetch = require('node-fetch');

// Função para enviar o e-mail de convite usando a API do Brevo
async function sendInvitationEmail(customerEmail, inviteLink) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

  const emailPayload = {
    // IMPORTANTE: Altere o 'sender' para o seu e-mail e nome
    sender: {
      name: 'Jornada 30 Dias',
      email: 'seu-email@seudominio.com.br' // Use um e-mail de um domínio que você controla
    },
    to: [{ email: customerEmail }],
    subject: 'Seu acesso à Jornada 30 Dias chegou! 🚀',
    htmlContent: `
      <html>
        <body>
          <h1>Seja bem-vindo(a) à Jornada 30 Dias!</h1>
          <p>Parabéns por dar o passo mais importante. Para aceder ao conteúdo, clique no botão abaixo para criar a sua senha pessoal.</p>
          <a href="${inviteLink}" style="background-color: #10B981; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Criar Minha Senha</a>
          <p>Se o botão não funcionar, copie e cole este link no seu navegador: ${inviteLink}</p>
          <p>Nos vemos lá dentro!</p>
        </body>
      </html>
    `
  };

  await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailPayload)
  });

  console.log(`E-mail de convite personalizado enviado para ${customerEmail} via Brevo.`);
}


exports.handler = async (event) => {
  try {
    const rawPayload = JSON.parse(event.body);
    const kiwifyPayload = rawPayload.order ? rawPayload.order : rawPayload;
    
    const eventType = kiwifyPayload.webhook_event_type;
    const customerEmail = kiwifyPayload.Customer.email;
    const productId = kiwifyPayload.Product.product_id;
    const expectedProductId = '909edec0-4fae-11f0-9d11-ad6e516f6910';
    
    if (eventType === 'order_approved' && productId === expectedProductId) {
      const NETLIFY_API_URL = `https://api.netlify.com/api/v1`;
      const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_API_ACCESS_TOKEN;
      const SITE_ID = process.env.SITE_ID; // Netlify injeta esta variável automaticamente

      // 1. Convidar o usuário (sem que a Netlify envie o e-mail)
      const inviteResponse = await fetch(`${NETLIFY_API_URL}/sites/${SITE_ID}/identity/invite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, roles: ['member'] }),
      });
      const newUserData = await inviteResponse.json();

      // 2. Gerar um link de recuperação (que serve para definir a primeira senha)
      const recoveryResponse = await fetch(`${NETLIFY_API_URL}/identity/admin/users/${newUserData.id}/recover`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}` }
      });
      const recoveryData = await recoveryResponse.json();
      const inviteLink = recoveryData.recovery_url;
      
      // 3. Enviar o nosso e-mail personalizado via Brevo
      await sendInvitationEmail(customerEmail, inviteLink);

      return { statusCode: 200, body: 'Usuário convidado e e-mail personalizado enviado com sucesso.' };
    }

    return { statusCode: 200, body: 'Evento não relevante, ignorado.' };

  } catch (error) {
    console.error('Erro na função do webhook:', error);
    return { statusCode: 500, body: 'Erro interno do servidor.' };
  }
};





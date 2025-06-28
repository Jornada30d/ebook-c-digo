const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const kiwifyPayload = JSON.parse(event.body);

    // --- CORREÇÃO: Lendo os dados da forma correta ---
    // Usamos os nomes exatos que vimos no log, incluindo letras maiúsculas.
    const eventType = kiwifyPayload.webhook_event_type;
    const productName = kiwifyPayload.Product.product_name;
    const customerEmail = kiwifyPayload.Customer.email;
    
    // --- CORREÇÃO: Verificando o evento e o nome do produto ---
    // Verificamos se o evento é "order_approved" (como no log)
    // E se o nome do produto é o seu nome real OU o nome do produto de teste.
    if (eventType === 'order_approved' && (productName === 'Ebook interativo " como criar o habito de treinar em 30 dias"' || productName === 'Example product')) {

      // O resto do código para convidar o usuário permanece o mesmo
      const NETLIFY_API_URL = `https://api.netlify.com/api/v1/sites/${process.env.SITE_ID}/identity/invite`;
      const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_API_ACCESS_TOKEN;

      await fetch(NETLIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          roles: ['member'],
        }),
      });

      console.log(`Convite enviado com sucesso para: ${customerEmail}`);
      return { statusCode: 200, body: 'Convite de usuário processado com sucesso.' };
    }

    console.log('Evento ignorado:', eventType, productName);
    return { statusCode: 200, body: 'Evento não relevante, ignorado.' };

  } catch (error) {
    console.error('Erro na função do webhook:', error);
    return { statusCode: 500, body: 'Erro interno do servidor.' };
  }
};

const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const rawPayload = JSON.parse(event.body);

    // Verificamos se o payload real está dentro de um objeto "order".
    const kiwifyPayload = rawPayload.order ? rawPayload.order : rawPayload;

    // Lemos os dados da forma correta.
    const eventType = kiwifyPayload.webhook_event_type;
    const customerEmail = kiwifyPayload.Customer.email;
    const productId = kiwifyPayload.Product.product_id;
    
    // --- CORREÇÃO FINAL: USANDO O ID DO PRODUTO ---
    // Este ID é único e nunca muda. É a forma mais segura de verificar.
    const expectedProductId = '909edec0-4fae-11f0-9d11-ad6e516f6910';
    
    if (eventType === 'order_approved' && productId === expectedProductId) {

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

    // Mantemos o log para o caso de algum outro evento chegar.
    console.log(`Evento ignorado. Tipo: ${eventType}, ID do Produto: ${productId}`);
    return { statusCode: 200, body: 'Evento não relevante, ignorado.' };

  } catch (error) {
    console.error('Erro na função do webhook:', error);
    return { statusCode: 500, body: 'Erro interno do servidor.' };
  }
};




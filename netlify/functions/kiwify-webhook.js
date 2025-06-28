const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const rawPayload = JSON.parse(event.body);

    // --- A CORREÇÃO FINAL E MAIS IMPORTANTE ---
    // Verificamos se o payload real está dentro de um objeto "order".
    // Se estiver, usamos o conteúdo de "order". Se não (como no teste), usamos o payload principal.
    const kiwifyPayload = rawPayload.order ? rawPayload.order : rawPayload;

    // A partir daqui, o resto da lógica funciona, pois estamos a olhar para os dados corretos.
    const eventType = kiwifyPayload.webhook_event_type;
    const productName = kiwifyPayload.Product.product_name;
    const customerEmail = kiwifyPayload.Customer.email;
    
    // A nossa condição IF permanece a mesma, pois agora o 'productName' será o correto.
    if (eventType === 'order_approved' && (productName === 'Ebook interativo " como criar o habito de treinar em 30 dias"' || productName === 'Example product')) {

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

    console.log(`Evento ignorado. Tipo: ${eventType}, Produto: ${productName}`);
    return { statusCode: 200, body: 'Evento não relevante, ignorado.' };

  } catch (error) {
    console.error('Erro na função do webhook:', error);
    return { statusCode: 500, body: 'Erro interno do servidor.' };
  }
};


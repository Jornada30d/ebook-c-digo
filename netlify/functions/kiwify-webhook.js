const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const kiwifyPayload = JSON.parse(event.body);

    // --- NOSSA NOVA LINHA DE INVESTIGAÇÃO ---
    // Esta linha vai imprimir todos os dados recebidos no log da Netlify.
    console.log(JSON.stringify(kiwifyPayload, null, 2));
    
    // O resto do código permanece igual.
    if (kiwifyPayload.event === 'order.paid' && kiwifyPayload.product.name === 'Ebook interativo " como criar o habito de treinar em 30 dias"') {
      const customerEmail = kiwifyPayload.customer.email;

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

      return { statusCode: 200, body: 'Convite de usuário processado com sucesso.' };
    }

    return { statusCode: 200, body: 'Evento não relevante, ignorado.' };

  } catch (error) {
    console.error('Erro na função do webhook:', error);
    return { statusCode: 500, body: 'Erro interno do servidor.' };
  }
};

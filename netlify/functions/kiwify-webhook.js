// Este código usa o 'node-fetch' para fazer chamadas de API.
// A Netlify o disponibiliza automaticamente para as funções.
const fetch = require('node-fetch');

// Toda função da Netlify exporta um 'handler'
exports.handler = async (event) => {
  try {
    // O corpo do webhook da Kiwify vem como um texto (string)
    // Primeiro, convertemos ele para um objeto JSON para podermos ler
    const kiwifyPayload = JSON.parse(event.body);

    // --- Verificação de Segurança ---
    // Verificamos se o evento é uma venda aprovada ('order.paid')
    // e se o nome do produto é o que esperamos.
    if (kiwifyPayload.event === 'order.paid' && kiwifyPayload.product.name === 'Ebook interativo " como criar o habito de treinar em 30 dias"') {
      const customerEmail = kiwifyPayload.customer.email;

      // --- Chamada para a API da Netlify ---
      // Pegamos as chaves secretas que vamos configurar no painel da Netlify
      const NETLIFY_API_URL = `https://api.netlify.com/api/v1/sites/${process.env.SITE_ID}/identity/invite`;
      const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_API_ACCESS_TOKEN;

      // Usamos o 'fetch' para fazer a chamada POST para a API da Netlify,
      // convidando o novo usuário.
      await fetch(NETLIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          roles: ['member'], // Atribui a "role" que dá acesso ao conteúdo
        }),
      });

      // Se tudo deu certo, retornamos um status 200 (OK) para a Kiwify.
      return { statusCode: 200, body: 'Convite de usuário processado com sucesso.' };
    }

    // Se não for o evento ou o produto que queremos, apenas ignoramos.
    return { statusCode: 200, body: 'Evento não relevante, ignorado.' };

  } catch (error) {
    // Se qualquer erro acontecer, registramos no log e retornamos um erro.
    console.error('Erro na função do webhook:', error);
    return { statusCode: 500, body: 'Erro interno do servidor.' };
  }
};
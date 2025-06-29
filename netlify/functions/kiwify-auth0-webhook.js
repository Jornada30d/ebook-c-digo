const { ManagementClient } = require('auth0');

exports.handler = async (event) => {
  const rawPayload = JSON.parse(event.body);
  const kiwifyPayload = rawPayload.order || rawPayload;

  const eventType = kiwifyPayload.webhook_event_type;
  const customerEmail = kiwifyPayload.Customer.email;
  const productId = kiwifyPayload.Product.product_id;
  const expectedProductId = '909edec0-4fae-11f0-9d11-ad6e516f6910';

  if (eventType !== 'order_approved' || productId !== expectedProductId) {
    return { statusCode: 200, body: 'Evento ignorado.' };
  }

  const auth0 = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_MGMT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
  });

  try {
    await auth0.users.create({
      email: customerEmail,
      connection: 'Username-Password-Authentication',
      email_verified: true,
    });

    return { statusCode: 200, body: 'Utilizador criado no Auth0 com sucesso.' };
  } catch (error) {
    if (error.statusCode === 409) {
      return { statusCode: 200, body: 'Utilizador já existente.' };
    }
    console.error('Erro ao criar utilizador no Auth0:', error);
    return { statusCode: 500, body: 'Erro ao criar utilizador.' };
  }
};

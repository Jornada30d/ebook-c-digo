import { Auth0, config } from "https://deno.land/x/auth0/mod.ts";

export default async (request, context) => {
  // Configura o cliente do Auth0 com as variáveis de ambiente
  const auth0 = new Auth0({
    ...config,
    domain: Deno.env.get("AUTH0_DOMAIN"),
    clientID: Deno.env.get("AUTH0_CLIENT_ID"),
    clientSecret: Deno.env.get("AUTH0_CLIENT_SECRET"), // Necessário para sessões seguras
    redirectUri: request.url,
    scope: "openid profile email",
  });

  // Tenta obter a sessão do utilizador a partir dos cookies
  const { user } = await auth0.getSession(request);

  // Se não houver utilizador (não está logado), redireciona para a página de login
  if (!user) {
    return Response.redirect(new URL("/login/", request.url));
  }

  // Se houver utilizador, permite o acesso à página solicitada
  return;
};

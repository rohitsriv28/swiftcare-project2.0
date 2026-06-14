export const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

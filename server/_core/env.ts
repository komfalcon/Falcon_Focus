export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // JWT
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",

  // Email (SMTP)
  smtpHost: process.env.SMTP_HOST ?? "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587"),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  fromEmail: process.env.FROM_EMAIL ?? "",

  // App URLs
  appUrl: process.env.APP_URL ?? "http://localhost:8081",
  apiUrl: process.env.API_URL ?? "http://localhost:3000",
};

// Validate in production
if (process.env.NODE_ENV === "production") {
  const required = [
    "jwtSecret",
    "jwtRefreshSecret",
    "smtpUser",
    "smtpPass",
  ] as const;

  for (const key of required) {
    if (!ENV[key]) {
      throw new Error(`[ENV] Missing required environment variable: ${key}`);
    }
  }
}

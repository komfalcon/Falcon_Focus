# Deployment Guide

## Environment Variables

All sensitive values (secrets, URLs, API keys) are configured via environment variables. **Never hardcode secrets in source code.**

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in the values in `.env`.
3. The `.env` file is git-ignored and must never be committed.

### EAS Build (Preview + Production)

Set these in the EAS Dashboard:
**https://expo.dev/accounts/falconkom/projects/falcon-focus/settings/environment-variables**

For both `preview` and `production` profiles:

| Variable | Description |
|---|---|
| `API_URL` | Backend API URL (e.g. your Koyeb deployment URL) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_REDIRECT_URI` | Google OAuth Redirect URI |
| `APP_URL` | Frontend app URL |

### Koyeb (Server)

Set these in the Koyeb Dashboard → Service → Environment Variables:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Database connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | Google OAuth Redirect URI |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `FROM_EMAIL` | Sender email address |
| `APP_URL` | Frontend app URL |
| `API_URL` | Backend API URL |
| `OAUTH_SERVER_URL` | OAuth server URL |

### Required Variables in Production

The following variables **must** be set for the server to start in production:

- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SMTP_USER`
- `SMTP_PASS`

The following variables are validated on the client in production builds:

- `API_URL`
- `GOOGLE_CLIENT_ID`

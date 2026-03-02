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

---

## Google OAuth Redirect URI Setup

The app uses the custom URL scheme `falcon-focus` for Google OAuth deep links.
The redirect URI used in code is:

```
falcon-focus://auth/callback
```

### EAS Environment Variables

1. Go to **https://expo.dev/accounts/falconkom/projects/falcon-focus/settings/environment-variables**
2. Find (or create) the variable **`GOOGLE_REDIRECT_URI`**
3. Set its value to: **`falcon-focus://auth/callback`**
4. Apply it to both **preview** and **production** environments
5. Save

### Google Cloud Console — OAuth Redirect URI

1. Go to **https://console.cloud.google.com/apis/credentials**
2. Select the project used for Falcon Focus
3. Under **OAuth 2.0 Client IDs**, click on the client used for mobile/native (e.g. "Android" or "iOS" client)
4. In the **Authorized redirect URIs** section, click **Add URI**
5. Enter: **`falcon-focus://auth/callback`**
6. Click **Save**
7. Repeat for each OAuth client that the app uses (Android, iOS, Web if applicable)

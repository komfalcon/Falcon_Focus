import axios from "axios";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri?: string,
  codeVerifier?: string,
): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const effectiveRedirectUri = redirectUri || process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !effectiveRedirectUri) {
    throw new Error("Google OAuth not configured");
  }

  const body: Record<string, string> = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: effectiveRedirectUri,
    grant_type: "authorization_code",
  };

  if (codeVerifier) {
    body.code_verifier = codeVerifier;
  }

  const { data } = await axios.post(GOOGLE_TOKEN_URL, body);

  return data.access_token;
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const { data } = await axios.get(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

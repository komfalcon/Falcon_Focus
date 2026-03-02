import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert } from "react-native";
import ENV from "@/lib/env";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = ENV.GOOGLE_CLIENT_ID;

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export function useGoogleAuth() {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'falcon-focus',
      path: 'auth/callback',
    });

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId: GOOGLE_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        redirectUri,
      },
      discovery,
    );

    return {
      request,
      response,
      promptAsync,
      redirectUri,
    };
  } catch (error) {
    console.error('[GoogleAuth] Failed to initialize:', error);
    return {
      request: null,
      response: null,
      promptAsync: async () => {
        Alert.alert('Google Sign In unavailable', 'Please use email sign in instead.');
        return { type: 'dismiss' as const };
      },
      redirectUri: '',
    };
  }
}

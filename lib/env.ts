import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const ENV = {
  // API
  API_URL: (extra.apiUrl as string | undefined) ?? 'http://localhost:3000',

  // Google OAuth
  GOOGLE_CLIENT_ID: (extra.googleClientId as string | undefined) ?? '',
  GOOGLE_REDIRECT_URI: (extra.googleRedirectUri as string | undefined) ?? '',

  // App
  APP_URL: (extra.appUrl as string | undefined) ?? 'http://localhost:8081',

  // Helpers
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,
} as const;

// Validate required vars in production
if (!__DEV__) {
  const required = ['API_URL', 'GOOGLE_CLIENT_ID'] as const;
  for (const key of required) {
    if (!ENV[key]) {
      console.error(`[ENV] Missing required environment variable: ${key}`);
    }
  }
}

export default ENV;

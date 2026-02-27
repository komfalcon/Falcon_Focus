import Constants from 'expo-constants';

let extra: Record<string, unknown> = {};
try {
  extra = Constants.expoConfig?.extra ?? {};
} catch (error) {
  console.warn('[ENV] Failed to read expo constants:', error);
}

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
try {
  if (!__DEV__) {
    const required = ['API_URL', 'GOOGLE_CLIENT_ID'] as const;
    for (const key of required) {
      if (!ENV[key]) {
        console.error(`[ENV] Missing required environment variable: ${key}`);
      }
    }
  }
} catch (error) {
  console.warn('[ENV] Validation error:', error);
}

export default ENV;

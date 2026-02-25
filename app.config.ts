import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  name: "Study Planner App",
  slug: "study-planner-app",
  version: "1.0.0",
  orientation: "portrait",

  icon: "./assets/icon.png",

  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },

  updates: {
    fallbackToCacheTimeout: 0
  },

  assetBundlePatterns: ["**/*"],

  ios: {
    supportsTablet: true
  },

  android: {
    package: "com.falconkom.studyplanner", // REQUIRED
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    }
  },

  web: {
    favicon: "./assets/favicon.png"
  },

  extra: {
    ...config.extra,
    eas: {
      projectId: "3f5cd4dd-f7bb-4d83-b282-42d6cfcf2c32"
    }
  }
});
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    server: {
      deps: {
        external: [
          'react-native',
          'expo-notifications',
          'expo-device',
          'expo-constants',
          '@react-native-async-storage/async-storage',
        ],
      },
    },
  },
});
